package com.pm.investment.service;

import com.pm.investment.dto.StockBoothResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.StockBoothVisitRepository;
import com.pm.investment.repository.StockHoldingRepository;
import com.pm.investment.repository.StockRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockBoothService {

    private final StockBoothRepository stockBoothRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final StockBoothVisitRepository stockBoothVisitRepository;
    private final StockRatingRepository stockRatingRepository;

    @Transactional(readOnly = true)
    public List<StockBoothResponse> getAllStockBooths(Long userId) {
        List<StockBooth> booths = stockBoothRepository.findAllByOrderByDisplayOrderAsc();

        // 1개 쿼리로 전체 부스 보유 통계 조회 (N+1 제거)
        Map<Long, Long> totalMap = stockHoldingRepository.getTotalHoldingByAllBooths()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).longValue()
                ));

        // 유저별 데이터 일괄 조회 (N+1 제거)
        Map<Long, Long> myMap = Map.of();
        Set<Long> visitedSet = Set.of();
        Set<Long> ratedSet = Set.of();
        if (userId != null) {
            myMap = stockHoldingRepository.getMyHoldingAmounts(userId)
                    .stream()
                    .collect(Collectors.toMap(
                            row -> (Long) row[0],
                            row -> ((Number) row[1]).longValue()
                    ));
            visitedSet = new HashSet<>(boothVisitRepository.findVisitedBoothIdsByUserId(userId));
            ratedSet = new HashSet<>(stockRatingRepository.findRatedBoothIdsByUserId(userId));
        }

        final Map<Long, Long> finalMyMap = myMap;
        final Set<Long> finalVisitedSet = visitedSet;
        final Set<Long> finalRatedSet = ratedSet;

        return booths.stream().map(booth -> StockBoothResponse.builder()
                .id(booth.getId())
                .name(booth.getName())
                .category(booth.getCategory())
                .description(booth.getDescription())
                .shortDescription(booth.getShortDescription())
                .displayOrder(booth.getDisplayOrder())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .totalHolding(totalMap.getOrDefault(booth.getId(), 0L))
                .myHolding(finalMyMap.getOrDefault(booth.getId(), 0L))
                .hasVisited(finalVisitedSet.contains(booth.getId()))
                .hasRated(finalRatedSet.contains(booth.getId()))
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public StockBoothResponse getStockBooth(Long boothId, Long userId) {
        StockBooth booth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        Long totalHolding = stockHoldingRepository.getTotalHoldingByStockBoothId(boothId);
        Long myHolding = 0L;
        if (userId != null) {
            myHolding = stockHoldingRepository.findByUserIdAndStockBoothId(userId, boothId)
                    .map(sh -> sh.getAmount())
                    .orElse(0L);
        }

        return StockBoothResponse.builder()
                .id(booth.getId())
                .name(booth.getName())
                .category(booth.getCategory())
                .description(booth.getDescription())
                .shortDescription(booth.getShortDescription())
                .displayOrder(booth.getDisplayOrder())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .totalHolding(totalHolding)
                .myHolding(myHolding)
                .hasVisited(userId != null && stockBoothVisitRepository.existsByUserIdAndStockBoothId(userId, boothId))
                .hasRated(userId != null && stockRatingRepository.existsByUserIdAndStockBoothId(userId, boothId))
                .build();
    }
}
