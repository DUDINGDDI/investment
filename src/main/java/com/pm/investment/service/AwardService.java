package com.pm.investment.service;

import com.pm.investment.dto.AwardRankingItem;
import com.pm.investment.dto.AwardResponse;
import com.pm.investment.entity.*;
import com.pm.investment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AwardService {

    private static final List<String> MISSION_IDS = List.of("renew", "dream", "result", "again", "sincere", "together");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final StockHoldingRepository stockHoldingRepository;
    private final StockBoothRepository stockBoothRepository;
    private final StockBoothVisitRepository stockBoothVisitRepository;
    private final UserMissionRepository userMissionRepository;
    private final InvestmentHistoryRepository investmentHistoryRepository;
    private final StockTradeHistoryRepository stockTradeHistoryRepository;
    private final StockCommentRepository stockCommentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AwardResponse> getAwards() {
        List<AwardResponse> awards = new ArrayList<>();

        awards.add(get11thBooth());
        awards.add(getTopProfitInvestor());
        awards.add(getOctopusInvestor());
        awards.add(getFootworkInvestor());
        awards.add(getEarlyBirdInvestor());
        awards.add(getTransferInvestor());
        awards.add(getLastTrainInvestor());
        awards.add(getDreamBigAward());
        awards.add(getTryAgainAward());

        return awards;
    }

    /**
     * 11번째 발표 부스: 오전 부스 중 가장 많은 투자금을 받은 부스
     */
    private AwardResponse get11thBooth() {
        List<Object[]> holdings = stockHoldingRepository.getTotalHoldingByAllBooths();
        if (holdings.isEmpty()) {
            return emptyAward("11번째 발표 부스", "오전 부스 중 가장 많은 투자금을 받은 부스");
        }

        // holdings: [stockBoothId, totalAmount, lastUpdatedAt]
        Long topBoothId = (Long) holdings.get(0)[0];
        long topAmount = ((Number) holdings.get(0)[1]).longValue();
        StockBooth booth = stockBoothRepository.findById(topBoothId).orElse(null);

        return AwardResponse.builder()
                .awardName("11번째 발표 부스")
                .description("오전 부스 중 가장 많은 투자금을 받은 부스")
                .winnerName(booth != null ? booth.getName() : "없음")
                .winnerCompany(booth != null ? booth.getCategory() : "")
                .detail(formatAmount(topAmount))
                .build();
    }

    /**
     * 하고잡이 투자자상: 투자처 순위 가중치 기반 점수가 가장 높은 개인 (is_rookie만)
     *
     * 부스 순위별 가중치:
     * 1위=10, 2위=9, 3위=8, 4위=7, 5위=6, 6~7위=5, 8~10위=4, 11~15위=3, 16~22위=2, 23위~=1
     *
     * 점수 = SUM(투자금액 × 해당 부스의 가중치)
     */
    private AwardResponse getTopProfitInvestor() {
        // 1. 부스별 총 투자금 순위 산출
        List<Object[]> boothHoldings = stockHoldingRepository.getTotalHoldingByAllBooths();

        // boothId → 가중치 매핑
        Map<Long, Integer> boothWeightMap = new HashMap<>();
        for (int i = 0; i < boothHoldings.size(); i++) {
            Long boothId = (Long) boothHoldings.get(i)[0];
            boothWeightMap.put(boothId, rankToWeight(i + 1));
        }

        // 2. rookie 유저의 보유 주식으로 가중치 점수 계산
        List<StockHolding> allHoldings = stockHoldingRepository.findByAmountGreaterThan(0L);

        Set<Long> rookieIds = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsRookie()))
                .map(User::getId)
                .collect(Collectors.toSet());

        // 유저별 가중치 점수 합산
        Map<Long, Long> scoreMap = new HashMap<>();
        for (StockHolding holding : allHoldings) {
            Long userId = holding.getUser().getId();
            if (!rookieIds.contains(userId)) continue;
            int weight = boothWeightMap.getOrDefault(holding.getStockBooth().getId(), 1);
            scoreMap.merge(userId, holding.getAmount() * weight, Long::sum);
        }

        if (scoreMap.isEmpty()) {
            return emptyAward("하고잡이 투자자상", "투자처 순위 가중치 점수가 가장 높은 개인");
        }

        // 3. 최고 점수 유저
        Map.Entry<Long, Long> best = scoreMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);

        User winner = userRepository.findById(best.getKey()).orElse(null);
        return AwardResponse.builder()
                .awardName("하고잡이 투자자상")
                .description("투자처 순위 가중치 점수가 가장 높은 개인")
                .winnerName(winner != null ? winner.getName() : "없음")
                .winnerCompany(winner != null ? winner.getCompany() : "")
                .detail("가중치 점수 " + formatAmount(best.getValue()))
                .build();
    }

    private int rankToWeight(int rank) {
        if (rank == 1) return 10;
        if (rank == 2) return 9;
        if (rank == 3) return 8;
        if (rank == 4) return 7;
        if (rank == 5) return 6;
        if (rank <= 7) return 5;
        if (rank <= 10) return 4;
        if (rank <= 15) return 3;
        if (rank <= 22) return 2;
        return 1;
    }

    /**
     * 문어발 투자자상: 오전 투자에서 가장 많은 부스에 투자한 개인 (is_rookie만)
     */
    private AwardResponse getOctopusInvestor() {
        List<Object[]> boothCounts = stockHoldingRepository.getBoothCountByRookieUser();
        if (boothCounts.isEmpty()) {
            return emptyAward("문어발 투자자상", "오전 투자에서 가장 많은 부스에 투자한 개인");
        }

        Long userId = (Long) boothCounts.get(0)[0];
        long count = ((Number) boothCounts.get(0)[1]).longValue();
        User winner = userRepository.findById(userId).orElse(null);

        return AwardResponse.builder()
                .awardName("문어발 투자자상")
                .description("오전 투자에서 가장 많은 부스에 투자한 개인")
                .winnerName(winner != null ? winner.getName() : "없음")
                .winnerCompany(winner != null ? winner.getCompany() : "")
                .detail(count + "개 부스 투자")
                .build();
    }

    /**
     * 발품투자자상: 오전 투자에서 가장 많은 부스에 방문한 개인 (is_rookie만)
     */
    private AwardResponse getFootworkInvestor() {
        List<Object[]> visitCounts = stockBoothVisitRepository.getVisitCountByRookieUser();
        if (visitCounts.isEmpty()) {
            return emptyAward("발품투자자상", "오전 투자에서 가장 많은 부스에 방문한 개인");
        }

        Long userId = (Long) visitCounts.get(0)[0];
        long count = ((Number) visitCounts.get(0)[1]).longValue();
        User winner = userRepository.findById(userId).orElse(null);

        return AwardResponse.builder()
                .awardName("발품투자자상")
                .description("오전 투자에서 가장 많은 부스에 방문한 개인")
                .winnerName(winner != null ? winner.getName() : "없음")
                .winnerCompany(winner != null ? winner.getCompany() : "")
                .detail(count + "개 부스 방문")
                .build();
    }

    /**
     * 얼리버드 투자자상: 하고잡이 미션 6개를 가장 먼저 완수한 개인 (is_rookie만)
     */
    private AwardResponse getEarlyBirdInvestor() {
        List<UserMission> allMissions = userMissionRepository.findByMissionIdIn(MISSION_IDS);

        // rookie 유저 ID 세트
        Set<Long> rookieIds = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsRookie()))
                .map(User::getId)
                .collect(Collectors.toSet());

        // 유저별 완료된 미션 그룹핑 (rookie만)
        Map<Long, List<UserMission>> byUser = allMissions.stream()
                .filter(um -> Boolean.TRUE.equals(um.getIsCompleted()))
                .filter(um -> rookieIds.contains(um.getUser().getId()))
                .collect(Collectors.groupingBy(um -> um.getUser().getId()));

        Long bestUserId = null;
        LocalDateTime earliestCompletion = null;

        for (Map.Entry<Long, List<UserMission>> entry : byUser.entrySet()) {
            Set<String> completedMissions = entry.getValue().stream()
                    .map(UserMission::getMissionId)
                    .collect(Collectors.toSet());

            if (completedMissions.containsAll(MISSION_IDS)) {
                // 6개 모두 완료 → 마지막 미션 완료 시간이 가장 빠른 유저
                LocalDateTime lastCompleted = entry.getValue().stream()
                        .filter(um -> MISSION_IDS.contains(um.getMissionId()))
                        .map(UserMission::getCompletedAt)
                        .filter(Objects::nonNull)
                        .max(LocalDateTime::compareTo)
                        .orElse(null);

                if (lastCompleted != null && (earliestCompletion == null || lastCompleted.isBefore(earliestCompletion))) {
                    earliestCompletion = lastCompleted;
                    bestUserId = entry.getKey();
                }
            }
        }

        if (bestUserId == null) {
            return emptyAward("얼리버드 투자자상", "하고잡이 미션 6개를 가장 먼저 완수한 개인");
        }

        User winner = userRepository.findById(bestUserId).orElse(null);
        return AwardResponse.builder()
                .awardName("얼리버드 투자자상")
                .description("하고잡이 미션 6개를 가장 먼저 완수한 개인")
                .winnerName(winner != null ? winner.getName() : "없음")
                .winnerCompany(winner != null ? winner.getCompany() : "")
                .detail("완수 시각 " + earliestCompletion.format(TIME_FMT))
                .build();
    }

    /**
     * 환승투자자상: 철회 횟수가 가장 많은 개인 (is_rookie만)
     */
    private AwardResponse getTransferInvestor() {
        List<Object[]> withdrawCounts = investmentHistoryRepository
                .countByTypeGroupedByRookieUser(InvestmentHistory.InvestmentType.WITHDRAW);

        if (withdrawCounts.isEmpty()) {
            return emptyAward("환승투자자상", "철회 횟수가 가장 많은 개인");
        }

        Long userId = (Long) withdrawCounts.get(0)[0];
        long count = ((Number) withdrawCounts.get(0)[1]).longValue();
        User winner = userRepository.findById(userId).orElse(null);

        return AwardResponse.builder()
                .awardName("환승투자자상")
                .description("철회 횟수가 가장 많은 개인")
                .winnerName(winner != null ? winner.getName() : "없음")
                .winnerCompany(winner != null ? winner.getCompany() : "")
                .detail("철회 " + count + "회")
                .build();
    }

    /**
     * 막차투자자상: 장 마감 전 가장 마지막으로 투자한 개인 (is_rookie만)
     */
    private AwardResponse getLastTrainInvestor() {
        // PM 마지막 투자
        Optional<InvestmentHistory> lastInvest = investmentHistoryRepository
                .findLatestByTypeAndRookie(InvestmentHistory.InvestmentType.INVEST);
        // AM 마지막 거래
        Optional<StockTradeHistory> lastTrade = stockTradeHistoryRepository
                .findLatestByRookieUser();

        User winner = null;
        LocalDateTime lastTime = null;

        if (lastInvest.isPresent()) {
            winner = lastInvest.get().getUser();
            lastTime = lastInvest.get().getCreatedAt();
        }
        if (lastTrade.isPresent()) {
            LocalDateTime tradeTime = lastTrade.get().getCreatedAt();
            if (lastTime == null || tradeTime.isAfter(lastTime)) {
                winner = lastTrade.get().getUser();
                lastTime = tradeTime;
            }
        }

        if (winner == null) {
            return emptyAward("막차투자자상", "장 마감 전 가장 마지막으로 투자한 개인");
        }

        return AwardResponse.builder()
                .awardName("막차투자자상")
                .description("장 마감 전 가장 마지막으로 투자한 개인")
                .winnerName(winner.getName())
                .winnerCompany(winner.getCompany())
                .detail("마지막 투자 " + lastTime.format(TIME_FMT))
                .build();
    }

    /**
     * 꿈을 원대하게상: 아이디어 디벨롭 댓글 횟수 1위인 개인 (is_rookie만)
     */
    private AwardResponse getDreamBigAward() {
        List<Object[]> commentCounts = stockCommentRepository.getCommentCountByRookieUser();
        if (commentCounts.isEmpty()) {
            return emptyAward("꿈을 원대하게상", "아이디어 디벨롭 댓글 횟수 1위인 개인");
        }

        Long userId = (Long) commentCounts.get(0)[0];
        long count = ((Number) commentCounts.get(0)[1]).longValue();
        User winner = userRepository.findById(userId).orElse(null);

        return AwardResponse.builder()
                .awardName("꿈을 원대하게상")
                .description("아이디어 디벨롭 댓글 횟수 1위인 개인")
                .winnerName(winner != null ? winner.getName() : "없음")
                .winnerCompany(winner != null ? winner.getCompany() : "")
                .detail("댓글 " + count + "개")
                .build();
    }

    /**
     * 안돼도 다시 상: 방문 인원이 가장 많은 부스
     */
    private AwardResponse getTryAgainAward() {
        List<Object[]> visitors = stockBoothVisitRepository.getVisitorCountByBooth();
        if (visitors.isEmpty()) {
            return emptyAward("안돼도 다시 상", "방문 인원이 가장 많은 부스");
        }

        // [boothId, boothName, count, category, maxVisitedAt]
        String boothName = (String) visitors.get(0)[1];
        long count = ((Number) visitors.get(0)[2]).longValue();
        String category = (String) visitors.get(0)[3];

        return AwardResponse.builder()
                .awardName("안돼도 다시 상")
                .description("방문 인원이 가장 많은 부스")
                .winnerName(boothName)
                .winnerCompany(category)
                .detail("방문자 " + count + "명")
                .build();
    }

    // ──────────────────────────────────────────────
    // 전체 랭킹 조회 (시상 종목별 상세)
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AwardRankingItem> getAwardRanking(int index) {
        return switch (index) {
            case 0 -> ranking11thBooth();
            case 1 -> rankingTopProfit();
            case 2 -> rankingOctopus();
            case 3 -> rankingFootwork();
            case 4 -> rankingEarlyBird();
            case 5 -> rankingTransfer();
            case 6 -> rankingLastTrain();
            case 7 -> rankingDreamBig();
            case 8 -> rankingTryAgain();
            default -> List.of();
        };
    }

    /** 11번째 발표 부스 — 부스별 총 투자금 순위 */
    private List<AwardRankingItem> ranking11thBooth() {
        List<Object[]> holdings = stockHoldingRepository.getTotalHoldingByAllBooths();
        List<AwardRankingItem> items = new ArrayList<>();
        long prevAmount = -1;
        int prevRank = 0;
        for (int i = 0; i < holdings.size(); i++) {
            Long boothId = (Long) holdings.get(i)[0];
            long amount = ((Number) holdings.get(i)[1]).longValue();
            int rank = (amount == prevAmount) ? prevRank : i + 1;
            prevAmount = amount;
            prevRank = rank;
            StockBooth booth = stockBoothRepository.findById(boothId).orElse(null);
            items.add(AwardRankingItem.builder()
                    .rank(rank)
                    .name(booth != null ? booth.getName() : "없음")
                    .company(booth != null ? booth.getCategory() : "")
                    .value(formatAmount(amount))
                    .build());
        }
        return items;
    }

    /** 하고잡이 투자자상 — 가중치 점수 순위 */
    private List<AwardRankingItem> rankingTopProfit() {
        List<Object[]> boothHoldings = stockHoldingRepository.getTotalHoldingByAllBooths();
        Map<Long, Integer> boothWeightMap = new HashMap<>();
        for (int i = 0; i < boothHoldings.size(); i++) {
            boothWeightMap.put((Long) boothHoldings.get(i)[0], rankToWeight(i + 1));
        }

        List<StockHolding> allHoldings = stockHoldingRepository.findByAmountGreaterThan(0L);
        Map<Long, User> rookieMap = getRookieMap();

        Map<Long, Long> scoreMap = new HashMap<>();
        for (StockHolding holding : allHoldings) {
            Long userId = holding.getUser().getId();
            if (!rookieMap.containsKey(userId)) continue;
            int weight = boothWeightMap.getOrDefault(holding.getStockBooth().getId(), 1);
            scoreMap.merge(userId, holding.getAmount() * weight, Long::sum);
        }

        List<Map.Entry<Long, Long>> sorted = scoreMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .toList();

        List<AwardRankingItem> items = new ArrayList<>();
        long prevScore = -1;
        int prevRank = 0;
        for (int i = 0; i < sorted.size(); i++) {
            long score = sorted.get(i).getValue();
            int rank = (score == prevScore) ? prevRank : i + 1;
            prevScore = score;
            prevRank = rank;
            User user = rookieMap.get(sorted.get(i).getKey());
            items.add(AwardRankingItem.builder()
                    .rank(rank)
                    .name(user.getName())
                    .company(user.getCompany())
                    .value(formatAmount(score))
                    .build());
        }
        return items;
    }

    /** 문어발 투자자상 — 투자 부스 수 순위 */
    private List<AwardRankingItem> rankingOctopus() {
        return buildSimpleRanking(stockHoldingRepository.getBoothCountByRookieUser(), "개 부스");
    }

    /** 발품투자자상 — 방문 부스 수 순위 */
    private List<AwardRankingItem> rankingFootwork() {
        return buildSimpleRanking(stockBoothVisitRepository.getVisitCountByRookieUser(), "개 부스");
    }

    /** 얼리버드 투자자상 — 미션 완수 시각 순위 */
    private List<AwardRankingItem> rankingEarlyBird() {
        List<UserMission> allMissions = userMissionRepository.findByMissionIdIn(MISSION_IDS);
        Map<Long, User> rookieMap = getRookieMap();

        Map<Long, List<UserMission>> byUser = allMissions.stream()
                .filter(um -> Boolean.TRUE.equals(um.getIsCompleted()))
                .filter(um -> rookieMap.containsKey(um.getUser().getId()))
                .collect(Collectors.groupingBy(um -> um.getUser().getId()));

        // 유저별 (완료 미션 수, 마지막 완료 시각)
        List<long[]> userIds = new ArrayList<>();
        Map<Long, LocalDateTime> completionTimeMap = new HashMap<>();
        Map<Long, Integer> completedCountMap = new HashMap<>();

        for (Map.Entry<Long, List<UserMission>> entry : byUser.entrySet()) {
            Set<String> completedMissions = entry.getValue().stream()
                    .map(UserMission::getMissionId)
                    .collect(Collectors.toSet());

            int completedCount = (int) MISSION_IDS.stream().filter(completedMissions::contains).count();
            completedCountMap.put(entry.getKey(), completedCount);

            LocalDateTime lastCompleted = entry.getValue().stream()
                    .filter(um -> MISSION_IDS.contains(um.getMissionId()))
                    .map(UserMission::getCompletedAt)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
            completionTimeMap.put(entry.getKey(), lastCompleted);
        }

        // 정렬: 완료 미션 수 DESC → 마지막 완료 시각 ASC
        List<Long> sortedUserIds = byUser.keySet().stream()
                .sorted(Comparator.<Long, Integer>comparing(id -> completedCountMap.getOrDefault(id, 0)).reversed()
                        .thenComparing(id -> completionTimeMap.getOrDefault(id, LocalDateTime.MAX)))
                .toList();

        List<AwardRankingItem> items = new ArrayList<>();
        int prevCount = -1;
        LocalDateTime prevTime = null;
        int prevRank = 0;
        for (int i = 0; i < sortedUserIds.size(); i++) {
            Long userId = sortedUserIds.get(i);
            User user = rookieMap.get(userId);
            int count = completedCountMap.getOrDefault(userId, 0);
            LocalDateTime time = completionTimeMap.get(userId);
            boolean tied = (count == prevCount) && Objects.equals(time, prevTime);
            int rank = tied ? prevRank : i + 1;
            prevCount = count;
            prevTime = time;
            prevRank = rank;
            items.add(AwardRankingItem.builder()
                    .rank(rank)
                    .name(user.getName())
                    .company(user.getCompany())
                    .value(count + "/" + MISSION_IDS.size() + " 완료")
                    .time(time != null ? time.format(TIME_FMT) : null)
                    .build());
        }
        return items;
    }

    /** 환승투자자상 — 철회 횟수 순위 */
    private List<AwardRankingItem> rankingTransfer() {
        return buildSimpleRanking(
                investmentHistoryRepository.countByTypeGroupedByRookieUser(InvestmentHistory.InvestmentType.WITHDRAW),
                "회");
    }

    /** 막차투자자상 — 마지막 투자 시각 순위 */
    private List<AwardRankingItem> rankingLastTrain() {
        Map<Long, User> rookieMap = getRookieMap();

        // PM 최종 투자 시각
        Map<Long, LocalDateTime> pmTimeMap = investmentHistoryRepository.getLatestTimeByRookieUser()
                .stream().collect(Collectors.toMap(r -> (Long) r[0], r -> (LocalDateTime) r[1]));

        // AM 최종 거래 시각
        Map<Long, LocalDateTime> amTimeMap = stockTradeHistoryRepository.getLatestTimeByRookieUser()
                .stream().collect(Collectors.toMap(r -> (Long) r[0], r -> (LocalDateTime) r[1]));

        // 합산: 더 늦은 시각
        Map<Long, LocalDateTime> mergedMap = new HashMap<>();
        Set<Long> allUserIds = new HashSet<>(pmTimeMap.keySet());
        allUserIds.addAll(amTimeMap.keySet());

        for (Long userId : allUserIds) {
            if (!rookieMap.containsKey(userId)) continue;
            LocalDateTime pm = pmTimeMap.get(userId);
            LocalDateTime am = amTimeMap.get(userId);
            LocalDateTime latest = pm;
            if (am != null && (latest == null || am.isAfter(latest))) latest = am;
            mergedMap.put(userId, latest);
        }

        // 시각 내림차순 (가장 늦은 사람이 1위)
        List<Map.Entry<Long, LocalDateTime>> sorted = mergedMap.entrySet().stream()
                .sorted(Map.Entry.<Long, LocalDateTime>comparingByValue().reversed())
                .toList();

        List<AwardRankingItem> items = new ArrayList<>();
        LocalDateTime prevTime = null;
        int prevRank = 0;
        for (int i = 0; i < sorted.size(); i++) {
            User user = rookieMap.get(sorted.get(i).getKey());
            LocalDateTime time = sorted.get(i).getValue();
            int rank = Objects.equals(time, prevTime) ? prevRank : i + 1;
            prevTime = time;
            prevRank = rank;
            items.add(AwardRankingItem.builder()
                    .rank(rank)
                    .name(user.getName())
                    .company(user.getCompany())
                    .value("")
                    .time(time != null ? time.format(TIME_FMT) : null)
                    .build());
        }
        return items;
    }

    /** 꿈을 원대하게상 — 댓글 수 순위 */
    private List<AwardRankingItem> rankingDreamBig() {
        return buildSimpleRanking(stockCommentRepository.getCommentCountByRookieUser(), "개");
    }

    /** 안돼도 다시 상 — 부스별 방문자 수 순위 (공동 순위 적용) */
    private List<AwardRankingItem> rankingTryAgain() {
        List<Object[]> visitors = stockBoothVisitRepository.getVisitorCountByBooth();
        List<AwardRankingItem> items = new ArrayList<>();
        long prevCount = -1;
        int prevRank = 0;
        for (int i = 0; i < visitors.size(); i++) {
            long count = ((Number) visitors.get(i)[2]).longValue();
            int rank = (count == prevCount) ? prevRank : i + 1;
            prevCount = count;
            prevRank = rank;
            items.add(AwardRankingItem.builder()
                    .rank(rank)
                    .name((String) visitors.get(i)[1])
                    .company((String) visitors.get(i)[3])
                    .value(count + "명")
                    .build());
        }
        return items;
    }

    // ──────── 공통 헬퍼 ────────

    /** userId → User (rookie만) */
    private Map<Long, User> getRookieMap() {
        return userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsRookie()))
                .collect(Collectors.toMap(User::getId, u -> u));
    }

    /** [userId, count] 형태 쿼리 결과를 랭킹으로 변환 (공동 순위 적용) */
    private List<AwardRankingItem> buildSimpleRanking(List<Object[]> rows, String unit) {
        Map<Long, User> rookieMap = getRookieMap();
        List<AwardRankingItem> items = new ArrayList<>();
        long prevCount = -1;
        int prevRank = 0;
        for (int i = 0; i < rows.size(); i++) {
            Long userId = (Long) rows.get(i)[0];
            long count = ((Number) rows.get(i)[1]).longValue();
            User user = rookieMap.get(userId);
            if (user == null) continue;
            int position = items.size() + 1;
            int rank = (count == prevCount) ? prevRank : position;
            prevCount = count;
            prevRank = rank;
            items.add(AwardRankingItem.builder()
                    .rank(rank)
                    .name(user.getName())
                    .company(user.getCompany())
                    .value(count + unit)
                    .build());
        }
        return items;
    }

    private AwardResponse emptyAward(String name, String description) {
        return AwardResponse.builder()
                .awardName(name)
                .description(description)
                .winnerName("해당 없음")
                .winnerCompany("")
                .detail("")
                .build();
    }

    private String formatAmount(long amount) {
        if (amount >= 100_000_000 || amount <= -100_000_000) {
            return String.format("%.1f억", amount / 100_000_000.0);
        } else if (amount >= 10_000 || amount <= -10_000) {
            return String.format("%.1f만", amount / 10_000.0);
        }
        return amount + "원";
    }
}
