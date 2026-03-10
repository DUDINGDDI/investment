package com.pm.investment.service;

import com.pm.investment.dto.MissionRankingResponse;
import com.pm.investment.dto.UserMissionResponse;
import com.pm.investment.entity.StockAccount;
import com.pm.investment.entity.User;
import com.pm.investment.entity.UserMission;
import com.pm.investment.repository.StockAccountRepository;
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
    private final StockAccountRepository stockAccountRepository;
    private final SettingService settingService;
    private final com.pm.investment.repository.StockBoothVisitRepository stockBoothVisitRepository;

    /** 함께하는 하고잡이 미션 전용 고정 UUID */
    private static final String TOGETHER_SPACE_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

    /** 내일 더 새롭게 미션 전용 고정 UUID */
    private static final String RENEW_SPACE_UUID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

    /** 랭킹 스냅샷: missionId → (userId → 이전 순위). 조회 시마다 갱신 */
    private final Map<String, Map<Long, Integer>> previousRankSnapshots = new ConcurrentHashMap<>();

    private static final Map<String, Integer> MISSION_TARGETS = Map.ofEntries(
            Map.entry("renew", 1),
            Map.entry("dream", 5),
            Map.entry("result", 1),
            Map.entry("again", 70),
            Map.entry("sincere", 12),
            Map.entry("together", 1),
            Map.entry("photo_0", 1),
            Map.entry("photo_1", 1),
            Map.entry("photo_2", 1),
            Map.entry("photo_3", 1),
            Map.entry("photo_4", 1),
            Map.entry("photo_5", 1)
    );

    /** 원본 미션 완료 시 자동으로 완료할 포토 티켓 매핑 */
    private static final Map<String, List<String>> PHOTO_TICKET_MAP = Map.of(
            "renew", List.of("photo_0", "photo_1"),
            "dream", List.of("photo_2", "photo_3"),
            "sincere", List.of("photo_4", "photo_5")
    );

    /**
     * 원본 미션이 완료되었을 때 연결된 포토 티켓을 자동 완료 처리
     */
    private void autoCompletePhotoTickets(User user, String missionId) {
        List<String> photoIds = PHOTO_TICKET_MAP.get(missionId);
        if (photoIds == null) return;

        for (String photoId : photoIds) {
            UserMission um = userMissionRepository.findByUser_IdAndMissionId(user.getId(), photoId)
                    .orElseGet(() -> {
                        UserMission newUm = new UserMission(user, photoId, MISSION_TARGETS.get(photoId));
                        return userMissionRepository.save(newUm);
                    });
            if (!um.getIsCompleted()) {
                um.setProgress(um.getTarget());
                um.setIsCompleted(true);
                um.setCompletedAt(LocalDateTime.now());
                userMissionRepository.save(um);
            }
        }
    }

    /**
     * 기존 유저 소급 처리: 원본 미션이 완료되었지만 포토 티켓이 없는 경우 자동 생성
     */
    private void ensurePhotoTickets(Long userId) {
        List<UserMission> userMissions = userMissionRepository.findByUser_Id(userId);
        Map<String, UserMission> missionMap = userMissions.stream()
                .collect(Collectors.toMap(UserMission::getMissionId, um -> um));

        for (Map.Entry<String, List<String>> entry : PHOTO_TICKET_MAP.entrySet()) {
            UserMission parentMission = missionMap.get(entry.getKey());
            if (parentMission != null && parentMission.getIsCompleted()) {
                boolean needsCreation = entry.getValue().stream()
                        .anyMatch(photoId -> !missionMap.containsKey(photoId));
                if (needsCreation) {
                    autoCompletePhotoTickets(parentMission.getUser(), entry.getKey());
                }
            }
        }
    }

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

        boolean wasCompleted = um.getIsCompleted();
        if (um.getProgress() >= um.getTarget() && !um.getIsCompleted()) {
            um.setIsCompleted(true);
            um.setCompletedAt(LocalDateTime.now());
        }

        userMissionRepository.save(um);

        if (!wasCompleted && um.getIsCompleted()) {
            autoCompletePhotoTickets(user, missionId);
        }

        return new UserMissionResponse(
                um.getMissionId(), um.getProgress(), um.getTarget(),
                um.getIsCompleted(), um.getAchievementRate(),
                um.getIsUsed(), um.getUsedAt()
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

        autoCompletePhotoTickets(user, missionId);

        return new UserMissionResponse(
                um.getMissionId(), um.getProgress(), um.getTarget(),
                um.getIsCompleted(), um.getAchievementRate(),
                um.getIsUsed(), um.getUsedAt()
        );
    }

    @Transactional
    public UserMissionResponse completeTogetherMission(Long userId, String scannedUuid) {
        if (!TOGETHER_SPACE_UUID.equalsIgnoreCase(scannedUuid)) {
            throw new IllegalArgumentException("유효하지 않은 QR 코드입니다");
        }

        Optional<UserMission> existing = userMissionRepository.findByUser_IdAndMissionId(userId, "together");
        if (existing.isPresent() && existing.get().getIsCompleted()) {
            throw new IllegalStateException("이미 완료한 미션입니다");
        }

        return completeMission(userId, "together");
    }

    @Transactional
    public UserMissionResponse completeRenewMission(Long userId, String scannedUuid) {
        if (!RENEW_SPACE_UUID.equalsIgnoreCase(scannedUuid)) {
            throw new IllegalArgumentException("유효하지 않은 QR 코드입니다");
        }

        Optional<UserMission> existing = userMissionRepository.findByUser_IdAndMissionId(userId, "renew");
        if (existing.isPresent() && existing.get().getIsCompleted()) {
            throw new IllegalStateException("이미 완료한 미션입니다");
        }

        UserMissionResponse response = completeMission(userId, "renew");

        StockAccount account = stockAccountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다"));
        account.setBalance(account.getBalance() + 100_000_000L);
        stockAccountRepository.save(account);

        return response;
    }

    @Transactional
    public List<UserMissionResponse> getMyMissions(Long userId) {
        ensurePhotoTickets(userId);

        List<UserMission> userMissions = userMissionRepository.findByUser_Id(userId);
        Map<String, UserMission> missionMap = userMissions.stream()
                .collect(Collectors.toMap(UserMission::getMissionId, um -> um));

        // "again" 미션: 소속 부스의 실시간 방문자 수 조회
        int againProgress = getBoothVisitorCount(userId);

        return MISSION_TARGETS.entrySet().stream()
                .map(entry -> {
                    UserMission um = missionMap.get(entry.getKey());

                    // "again" 미션은 실시간 방문자 수로 덮어쓰기 (단, DB에서 이미 완료된 경우 유지)
                    if ("again".equals(entry.getKey())) {
                        boolean dbCompleted = um != null && um.getIsCompleted();
                        int displayProgress = dbCompleted ? Math.max(againProgress, entry.getValue()) : againProgress;
                        boolean completed = dbCompleted || againProgress >= entry.getValue();
                        return new UserMissionResponse(
                                entry.getKey(), displayProgress, entry.getValue(),
                                completed, entry.getValue() > 0 ? Math.min((double) displayProgress / entry.getValue() * 100, 100.0) : 0.0,
                                um != null ? um.getIsUsed() : false,
                                um != null ? um.getUsedAt() : null
                        );
                    }

                    if (um != null) {
                        return new UserMissionResponse(
                                um.getMissionId(), um.getProgress(), um.getTarget(),
                                um.getIsCompleted(), um.getAchievementRate(),
                                um.getIsUsed(), um.getUsedAt()
                        );
                    }
                    return new UserMissionResponse(
                            entry.getKey(), 0, entry.getValue(), false, 0.0,
                            false, null
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * 유저 소속 부스의 실시간 방문자 수 조회
     */
    private int getBoothVisitorCount(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getBelongingStockBooth() == null) return 0;

        return (int) stockBoothVisitRepository.countByStockBoothId(user.getBelongingStockBooth().getId());
    }

    @Transactional
    public UserMissionResponse useTicket(Long userId, String missionId) {
        UserMission um = userMissionRepository.findByUser_IdAndMissionId(userId, missionId)
                .orElseThrow(() -> new IllegalArgumentException("해당 미션 기록을 찾을 수 없습니다"));

        if (!um.getIsCompleted()) {
            throw new IllegalStateException("완료되지 않은 미션입니다");
        }
        if (um.getIsUsed()) {
            throw new IllegalStateException("이미 사용된 이용권입니다");
        }

        um.setIsUsed(true);
        um.setUsedAt(LocalDateTime.now());
        userMissionRepository.save(um);

        return new UserMissionResponse(
                um.getMissionId(), um.getProgress(), um.getTarget(),
                um.getIsCompleted(), um.getAchievementRate(),
                um.getIsUsed(), um.getUsedAt()
        );
    }

    @Transactional
    public int useAllTickets(Long userId) {
        List<UserMission> missions = userMissionRepository.findByUser_Id(userId);
        int count = 0;
        LocalDateTime now = LocalDateTime.now();
        for (UserMission um : missions) {
            if (um.getIsCompleted() && !um.getIsUsed()) {
                um.setIsUsed(true);
                um.setUsedAt(now);
                userMissionRepository.save(um);
                count++;
            }
        }
        if (count == 0) {
            throw new IllegalStateException("사용 가능한 이용권이 없습니다");
        }
        return count;
    }

    /**
     * 미션별 랭킹: progress 내림차순, 등락 포함 (페이지 접속 시 실시간 계산)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMissionRanking(String missionId, Long currentUserId) {
        if (!MISSION_TARGETS.containsKey(missionId)) {
            throw new IllegalArgumentException("존재하지 않는 미션입니다: " + missionId);
        }

        // "again" 미션은 부스 방문자 수 기반 랭킹
        if ("again".equals(missionId)) {
            return getBoothVisitorRanking(currentUserId);
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

    /**
     * "안돼도 다시" 전용: 부스별 방문자 수 랭킹
     */
    private Map<String, Object> getBoothVisitorRanking(Long currentUserId) {
        List<Object[]> boothVisitors = stockBoothVisitRepository.getVisitorCountByBooth();

        Map<Long, Integer> snapshot = previousRankSnapshots.getOrDefault("again", Map.of());
        List<MissionRankingResponse> rankings = new ArrayList<>();
        Map<Long, Integer> newSnapshot = new HashMap<>();

        for (int i = 0; i < boothVisitors.size(); i++) {
            Object[] row = boothVisitors.get(i);
            Long boothId = (Long) row[0];
            String boothName = (String) row[1];
            int visitorCount = ((Number) row[2]).intValue();
            int rank = i + 1;
            int prevRank = snapshot.getOrDefault(boothId, 0);
            int rankChange = prevRank > 0 ? prevRank - rank : 0;

            rankings.add(new MissionRankingResponse(
                    rank,
                    boothId,
                    boothName,
                    null,
                    visitorCount,
                    rankChange
            ));

            newSnapshot.put(boothId, rank);
        }

        previousRankSnapshots.put("again", newSnapshot);

        // 현재 유저의 소속 stock_booth 찾기
        MissionRankingResponse myRanking = null;
        User currentUser = userRepository.findById(currentUserId).orElse(null);
        if (currentUser != null && currentUser.getBelongingStockBooth() != null) {
            Long myStockBoothId = currentUser.getBelongingStockBooth().getId();
            myRanking = rankings.stream()
                    .filter(r -> myStockBoothId.equals(r.getUserId()))
                    .findFirst()
                    .orElse(null);
        }

        List<MissionRankingResponse> top20 = rankings.stream()
                .limit(20)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("rankings", top20);
        result.put("myRanking", myRanking);
        return result;
    }

    /**
     * 전체 유저에게 특정 미션 일괄 완료 처리
     */
    @Transactional
    public int completeForAll(String missionId) {
        if (!MISSION_TARGETS.containsKey(missionId)) {
            throw new IllegalArgumentException("존재하지 않는 미션입니다: " + missionId);
        }

        List<User> allUsers = userRepository.findAll();
        int count = 0;
        for (User user : allUsers) {
            UserMission um = userMissionRepository.findByUser_IdAndMissionId(user.getId(), missionId)
                    .orElseGet(() -> {
                        UserMission newUm = new UserMission(user, missionId, MISSION_TARGETS.get(missionId));
                        return userMissionRepository.save(newUm);
                    });
            if (!um.getIsCompleted()) {
                um.setProgress(um.getTarget());
                um.setIsCompleted(true);
                um.setCompletedAt(LocalDateTime.now());
                userMissionRepository.save(um);
                autoCompletePhotoTickets(user, missionId);
                count++;
            }
        }
        return count;
    }

    /**
     * 전체 유저에게 특정 미션 일괄 미완료 처리
     */
    @Transactional
    public int uncompleteForAll(String missionId) {
        if (!MISSION_TARGETS.containsKey(missionId)) {
            throw new IllegalArgumentException("존재하지 않는 미션입니다: " + missionId);
        }

        List<User> allUsers = userRepository.findAll();
        int count = 0;
        for (User user : allUsers) {
            Optional<UserMission> opt = userMissionRepository.findByUser_IdAndMissionId(user.getId(), missionId);
            if (opt.isPresent() && opt.get().getIsCompleted()) {
                UserMission um = opt.get();
                um.setProgress(0);
                um.setIsCompleted(false);
                um.setCompletedAt(null);
                userMissionRepository.save(um);
                count++;
            }
        }
        return count;
    }
}
