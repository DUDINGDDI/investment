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
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final UserMissionRepository userMissionRepository;
    private final UserRepository userRepository;

    private static final Map<String, Integer> MISSION_TARGETS = Map.of(
            "renew", 1,
            "dream", 1,
            "result", 1,
            "again", 70,
            "sincere", 12,
            "together", 1
    );

    /**
     * 자동 미션 달성 체크 — 이미 완료된 미션은 스킵
     */
    @Transactional
    public void checkAndUpdateMission(Long userId, String missionId, int currentProgress) {
        if (!MISSION_TARGETS.containsKey(missionId)) return;

        Optional<UserMission> existing = userMissionRepository.findByUser_IdAndMissionId(userId, missionId);
        if (existing.isPresent() && existing.get().getIsCompleted()) return;

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

    @Transactional(readOnly = true)
    public Map<String, Object> getMissionRanking(String missionId, Long currentUserId) {
        if (!MISSION_TARGETS.containsKey(missionId)) {
            throw new IllegalArgumentException("존재하지 않는 미션입니다: " + missionId);
        }

        List<UserMission> allMissions = userMissionRepository.findRankingByMissionId(missionId);

        List<MissionRankingResponse> rankings = IntStream.range(0, allMissions.size())
                .mapToObj(i -> {
                    UserMission um = allMissions.get(i);
                    return new MissionRankingResponse(
                            i + 1,
                            um.getUser().getId(),
                            um.getUser().getName(),
                            um.getAchievementRate(),
                            um.getIsCompleted(),
                            um.getProgress(),
                            um.getTarget()
                    );
                })
                .collect(Collectors.toList());

        MissionRankingResponse myRanking = rankings.stream()
                .filter(r -> r.getUserId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        List<MissionRankingResponse> top10 = rankings.stream()
                .limit(10)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("rankings", top10);
        result.put("myRanking", myRanking);
        return result;
    }
}
