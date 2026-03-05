package com.pm.investment.service;

import com.pm.investment.dto.RankingResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.InvestmentRepository;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.StockHoldingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final BoothRepository boothRepository;
    private final InvestmentRepository investmentRepository;
    private final StockBoothRepository stockBoothRepository;
    private final StockHoldingRepository stockHoldingRepository;

    @Transactional(readOnly = true)
    public List<RankingResponse> getRanking() {
        List<Booth> booths = boothRepository.findAll();

        // 1개 쿼리로 전체 부스 투자 통계 조회 (N+1 제거)
        Map<Long, long[]> statsMap = investmentRepository.getInvestmentStatsByBooth()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> new long[]{((Number) row[1]).longValue(), ((Number) row[2]).longValue()}
                ));

        List<RankingResponse> unsorted = booths.stream().map(booth -> {
            long[] stats = statsMap.getOrDefault(booth.getId(), new long[]{0L, 0L});
            return RankingResponse.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .category(booth.getCategory())
                    .logoEmoji(booth.getLogoEmoji())
                    .themeColor(booth.getThemeColor())
                    .totalInvestment(stats[0])
                    .investorCount(stats[1])
                    .build();
        }).sorted(Comparator.comparingLong(RankingResponse::getTotalInvestment).reversed())
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

        Map<Long, long[]> holdingMap = stockHoldingRepository.getTotalHoldingByAllBooths()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> new long[]{((Number) row[1]).longValue(), 0L}
                ));

        // 투자자 수 계산
        for (StockBooth booth : booths) {
            long[] stats = holdingMap.get(booth.getId());
            if (stats != null) {
                stats[1] = stockHoldingRepository.getHolderCountByStockBoothId(booth.getId());
            }
        }

        List<RankingResponse> unsorted = booths.stream().map(booth -> {
            long[] stats = holdingMap.getOrDefault(booth.getId(), new long[]{0L, 0L});
            return RankingResponse.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .category(booth.getCategory())
                    .logoEmoji(booth.getLogoEmoji())
                    .themeColor(booth.getThemeColor())
                    .totalInvestment(stats[0])
                    .investorCount(stats[1])
                    .build();
        }).sorted(Comparator.comparingLong(RankingResponse::getTotalInvestment).reversed())
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
}
