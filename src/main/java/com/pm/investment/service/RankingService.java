package com.pm.investment.service;

import com.pm.investment.dto.ExecutiveInvestmentResponse;
import com.pm.investment.dto.RookieInvestmentResponse;
import com.pm.investment.dto.RankingResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.entity.Investment;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.entity.User;
import com.pm.investment.entity.BoothMemo;
import com.pm.investment.repository.BoothMemoRepository;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.InvestmentRepository;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.StockHoldingRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final BoothRepository boothRepository;
    private final InvestmentRepository investmentRepository;
    private final StockBoothRepository stockBoothRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final UserRepository userRepository;
    private final BoothMemoRepository boothMemoRepository;

    @Transactional(readOnly = true)
    public List<RankingResponse> getRanking() {
        List<Booth> booths = boothRepository.findAll();

        // 1개 쿼리로 전체 부스 투자 통계 조회 (N+1 제거)
        Map<Long, Object[]> statsMap = investmentRepository.getInvestmentStatsByBooth()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> row
                ));

        // 동률 시 먼저 달성한 부스(lastUpdatedAt이 빠른)가 높은 순위
        List<RankingResponse> unsorted = booths.stream().map(booth -> {
            Object[] row = statsMap.get(booth.getId());
            long totalInvestment = row != null ? ((Number) row[1]).longValue() : 0L;
            long investorCount = row != null ? ((Number) row[2]).longValue() : 0L;
            LocalDateTime lastUpdatedAt = row != null ? (LocalDateTime) row[3] : LocalDateTime.MAX;
            return RankingResponse.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .category(booth.getCategory())
                    .logoEmoji(booth.getLogoEmoji())
                    .themeColor(booth.getThemeColor())
                    .totalInvestment(totalInvestment)
                    .investorCount(investorCount)
                    .lastUpdatedAt(lastUpdatedAt)
                    .build();
        }).sorted(Comparator.comparingLong(RankingResponse::getTotalInvestment).reversed()
                .thenComparing(RankingResponse::getLastUpdatedAt))
                .toList();

        AtomicInteger rankCounter = new AtomicInteger(1);
        return unsorted.stream().map(r -> RankingResponse.builder()
                .rank(rankCounter.getAndIncrement())
                .boothId(r.getBoothId())
                .boothName(r.getBoothName())
                .category(r.getCategory())
                .logoEmoji(r.getLogoEmoji())
                .themeColor(r.getThemeColor())
                .totalInvestment(r.getTotalInvestment())
                .investorCount(r.getInvestorCount())
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public List<RankingResponse> getStockRanking() {
        List<StockBooth> booths = stockBoothRepository.findAllByOrderByDisplayOrderAsc();

        Map<Long, Object[]> holdingMap = stockHoldingRepository.getTotalHoldingByAllBooths()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> row
                ));

        // 투자자 수 계산
        Map<Long, Long> holderCountMap = new HashMap<>();
        for (StockBooth booth : booths) {
            if (holdingMap.containsKey(booth.getId())) {
                holderCountMap.put(booth.getId(), stockHoldingRepository.getHolderCountByStockBoothId(booth.getId()));
            }
        }

        // 동률 시 먼저 달성한 부스(lastUpdatedAt이 빠른)가 높은 순위
        List<RankingResponse> unsorted = booths.stream().map(booth -> {
            Object[] row = holdingMap.get(booth.getId());
            long totalInvestment = row != null ? ((Number) row[1]).longValue() : 0L;
            long investorCount = holderCountMap.getOrDefault(booth.getId(), 0L);
            LocalDateTime lastUpdatedAt = row != null ? (LocalDateTime) row[2] : LocalDateTime.MAX;
            return RankingResponse.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .category(booth.getCategory())
                    .logoEmoji(booth.getLogoEmoji())
                    .themeColor(booth.getThemeColor())
                    .totalInvestment(totalInvestment)
                    .investorCount(investorCount)
                    .lastUpdatedAt(lastUpdatedAt)
                    .build();
        }).sorted(Comparator.comparingLong(RankingResponse::getTotalInvestment).reversed()
                .thenComparing(RankingResponse::getLastUpdatedAt))
                .toList();

        AtomicInteger rankCounter = new AtomicInteger(1);
        return unsorted.stream().map(r -> RankingResponse.builder()
                .rank(rankCounter.getAndIncrement())
                .boothId(r.getBoothId())
                .boothName(r.getBoothName())
                .category(r.getCategory())
                .logoEmoji(r.getLogoEmoji())
                .themeColor(r.getThemeColor())
                .totalInvestment(r.getTotalInvestment())
                .investorCount(r.getInvestorCount())
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public ExecutiveInvestmentResponse getExecutiveInvestments() {
        List<Investment> investments = investmentRepository.findAllByExecutiveUsersWithAmount();

        // 임원별 투자 내역
        Map<Long, List<Investment>> byUser = investments.stream()
                .collect(Collectors.groupingBy(i -> i.getUser().getId(), LinkedHashMap::new, Collectors.toList()));

        // 투자하지 않은 임원도 포함
        List<User> allExecutives = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsExecutive()))
                .sorted(Comparator.comparing(User::getName))
                .toList();

        // 임원들의 메모 조회
        List<Long> execUserIds = allExecutives.stream().map(User::getId).toList();
        Map<String, String> memoMap = new HashMap<>();
        if (!execUserIds.isEmpty()) {
            boothMemoRepository.findAllByUserIdIn(execUserIds).forEach(memo ->
                    memoMap.put(memo.getUser().getId() + "_" + memo.getBooth().getId(), memo.getContent())
            );
        }

        List<ExecutiveInvestmentResponse.ExecutiveDetail> executives = allExecutives.stream().map(user -> {
            List<Investment> userInvestments = byUser.getOrDefault(user.getId(), List.of());
            long totalInvested = userInvestments.stream().mapToLong(Investment::getAmount).sum();
            List<ExecutiveInvestmentResponse.InvestmentItem> items = userInvestments.stream().map(inv ->
                    ExecutiveInvestmentResponse.InvestmentItem.builder()
                            .boothId(inv.getBooth().getId())
                            .boothName(inv.getBooth().getName())
                            .category(inv.getBooth().getCategory())
                            .logoEmoji(inv.getBooth().getLogoEmoji())
                            .amount(inv.getAmount())
                            .memo(memoMap.get(user.getId() + "_" + inv.getBooth().getId()))
                            .build()
            ).toList();
            return ExecutiveInvestmentResponse.ExecutiveDetail.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .company(user.getCompany())
                    .balance(user.getBalance())
                    .totalInvested(totalInvested)
                    .investments(items)
                    .build();
        }).toList();

        // 부스별 임원 투자 합계
        List<Booth> allBooths = boothRepository.findAllByOrderByDisplayOrderAsc();
        Map<Long, long[]> boothStats = new HashMap<>();
        for (Investment inv : investments) {
            long[] stats = boothStats.computeIfAbsent(inv.getBooth().getId(), k -> new long[]{0L, 0});
            stats[0] += inv.getAmount();
            stats[1]++;
        }

        List<ExecutiveInvestmentResponse.BoothSummary> boothSummaries = allBooths.stream().map(booth -> {
            long[] stats = boothStats.getOrDefault(booth.getId(), new long[]{0L, 0});
            return ExecutiveInvestmentResponse.BoothSummary.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .category(booth.getCategory())
                    .logoEmoji(booth.getLogoEmoji())
                    .themeColor(booth.getThemeColor())
                    .executiveInvestment(stats[0])
                    .executiveInvestorCount((int) stats[1])
                    .build();
        }).sorted(Comparator.comparingLong(ExecutiveInvestmentResponse.BoothSummary::getExecutiveInvestment).reversed())
                .toList();

        return ExecutiveInvestmentResponse.builder()
                .executives(executives)
                .boothSummaries(boothSummaries)
                .build();
    }

    @Transactional(readOnly = true)
    public RookieInvestmentResponse getRookieInvestments() {
        List<Investment> investments = investmentRepository.findAllByRookieUsersWithAmount();

        Map<Long, List<Investment>> byUser = investments.stream()
                .collect(Collectors.groupingBy(i -> i.getUser().getId(), LinkedHashMap::new, Collectors.toList()));

        List<User> allRookies = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsRookie()))
                .sorted(Comparator.comparing(User::getName))
                .toList();

        List<RookieInvestmentResponse.RookieDetail> rookies = allRookies.stream().map(user -> {
            List<Investment> userInvestments = byUser.getOrDefault(user.getId(), List.of());
            long totalInvested = userInvestments.stream().mapToLong(Investment::getAmount).sum();
            List<RookieInvestmentResponse.InvestmentItem> items = userInvestments.stream().map(inv ->
                    RookieInvestmentResponse.InvestmentItem.builder()
                            .boothId(inv.getBooth().getId())
                            .boothName(inv.getBooth().getName())
                            .category(inv.getBooth().getCategory())
                            .amount(inv.getAmount())
                            .build()
            ).toList();
            return RookieInvestmentResponse.RookieDetail.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .company(user.getCompany())
                    .balance(user.getBalance())
                    .totalInvested(totalInvested)
                    .investments(items)
                    .build();
        }).toList();

        List<Booth> allBooths = boothRepository.findAllByOrderByDisplayOrderAsc();
        Map<Long, long[]> boothStats = new HashMap<>();
        for (Investment inv : investments) {
            long[] stats = boothStats.computeIfAbsent(inv.getBooth().getId(), k -> new long[]{0L, 0});
            stats[0] += inv.getAmount();
            stats[1]++;
        }

        List<RookieInvestmentResponse.BoothSummary> boothSummaries = allBooths.stream().map(booth -> {
            long[] stats = boothStats.getOrDefault(booth.getId(), new long[]{0L, 0});
            return RookieInvestmentResponse.BoothSummary.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .category(booth.getCategory())
                    .rookieInvestment(stats[0])
                    .rookieInvestorCount((int) stats[1])
                    .build();
        }).sorted(Comparator.comparingLong(RookieInvestmentResponse.BoothSummary::getRookieInvestment).reversed())
                .toList();

        return RookieInvestmentResponse.builder()
                .rookies(rookies)
                .boothSummaries(boothSummaries)
                .build();
    }
}
