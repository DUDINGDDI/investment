package com.pm.investment.service;

import com.pm.investment.dto.MissionRankingResponse;
import com.pm.investment.dto.UserMissionResponse;
import com.pm.investment.entity.User;
import com.pm.investment.entity.UserMission;
import com.pm.investment.repository.UserMissionRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final UserMissionRepository userMissionRepository;
    private final UserRepository userRepository;

    /** 랭킹 스냅샷: missionId → (userId → 이전 순위). 조회 시마다 갱신 */
    private final Map<String, Map<Long, Integer>> previousRankSnapshots = new ConcurrentHashMap<>();

    private static final Map<String, Integer> MISSION_TARGETS = Map.of(
            "renew", 1,
            "dream", 1,
            "result", 1,
            "again", 70,
            "sincere", 12,
            "together", 1
    );

    /**
     * 자동 미션 달성 체크 — 완료 후에도 progress는 계속 카운팅
     */
    @Transactional
    public void checkAndUpdateMission(Long userId, String missionId, int currentProgress) {
        if (!MISSION_TARGETS.containsKey(missionId)) return;
        updateProgress(userId, missionId, currentProgress);
    }

    @Transactional
    public UserMissionResponse updateProgress(Long userId, String missionId, int progress) {
        if (!MISSION_TARGETS.containsKey(missionId)) {
            throw new IllegalArgumentException("존재하지 않는 미션입니다: " + missionId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        UserMission um = userMissionRepository.findByUser_IdAndMissionId(userId, missionId)
                .orElseGet(() -> {
                    UserMission newUm = new UserMission(user, missionId, MISSION_TARGETS.get(missionId));
                    return userMissionRepository.save(newUm);
                });

        um.setProgress(Math.max(0, progress));
        um.setTarget(MISSION_TARGETS.get(missionId));

        if (um.getProgress() >= um.getTarget() && !um.getIsCompleted()) {
            um.setIsCompleted(true);
            um.setCompletedAt(LocalDateTime.now());
        }

        userMissionRepository.save(um);

        return new UserMissionResponse(
                um.getMissionId(), um.getProgress(), um.getTarget(),
                um.getIsCompleted(), um.getAchievementRate()
        );
    }

    @Transactional
    public UserMissionResponse completeMission(Long userId, String missionId) {
        if (!MISSION_TARGETS.containsKey(missionId)) {
            throw new IllegalArgumentException("존재하지 않는 미션입니다: " + missionId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        UserMission um = userMissionRepository.findByUser_IdAndMissionId(userId, missionId)
                .orElseGet(() -> {
                    UserMission newUm = new UserMission(user, missionId, MISSION_TARGETS.get(missionId));
                    return userMissionRepository.save(newUm);
                });

        um.setProgress(um.getTarget());
        um.setIsCompleted(true);
        um.setCompletedAt(LocalDateTime.now());
        userMissionRepository.save(um);

        return new UserMissionResponse(
                um.getMissionId(), um.getProgress(), um.getTarget(),
                um.getIsCompleted(), um.getAchievementRate()
        );
    }

    @Transactional(readOnly = true)
    public List<UserMissionResponse> getMyMissions(Long userId) {
        List<UserMission> userMissions = userMissionRepository.findByUser_Id(userId);
        Map<String, UserMission> missionMap = userMissions.stream()
                .collect(Collectors.toMap(UserMission::getMissionId, um -> um));

        return MISSION_TARGETS.entrySet().stream()
                .map(entry -> {
                    UserMission um = missionMap.get(entry.getKey());
                    if (um != null) {
                        return new UserMissionResponse(
                                um.getMissionId(), um.getProgress(), um.getTarget(),
                                um.getIsCompleted(), um.getAchievementRate()
                        );
                    }
                    return new UserMissionResponse(
                            entry.getKey(), 0, entry.getValue(), false, 0.0
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * 미션별 랭킹: progress 내림차순, 등락 포함 (페이지 접속 시 실시간 계산)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMissionRanking(String missionId, Long currentUserId) {
        if (!MISSION_TARGETS.containsKey(missionId)) {
            throw new IllegalArgumentException("존재하지 않는 미션입니다: " + missionId);
        }

        // progress 내림차순 정렬
        List<UserMission> allMissions = userMissionRepository.findRankingByMissionId(missionId);

        // 이전 스냅샷으로 등락 계산
        Map<Long, Integer> snapshot = previousRankSnapshots.getOrDefault(missionId, Map.of());

        List<MissionRankingResponse> rankings = new ArrayList<>();
        Map<Long, Integer> newSnapshot = new HashMap<>();

        for (int i = 0; i < allMissions.size(); i++) {
            UserMission um = allMissions.get(i);
            int rank = i + 1;
            int prevRank = snapshot.getOrDefault(um.getUser().getId(), 0);
            int rankChange = prevRank > 0 ? prevRank - rank : 0;

            rankings.add(new MissionRankingResponse(
                    rank,
                    um.getUser().getId(),
                    um.getUser().getName(),
                    um.getUser().getCompany(),
                    um.getProgress(),
                    rankChange
            ));

            newSnapshot.put(um.getUser().getId(), rank);
        }

        // 현재 순위를 다음 조회 시 비교용으로 저장
        previousRankSnapshots.put(missionId, newSnapshot);

        MissionRankingResponse myRanking = rankings.stream()
                .filter(r -> r.getUserId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        List<MissionRankingResponse> top20 = rankings.stream()
                .limit(20)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("rankings", top20);
        result.put("myRanking", myRanking);
        return result;
    }
}
