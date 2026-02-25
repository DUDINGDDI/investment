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

import java.util.List;

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

        return booths.stream().map(booth -> {
            Long totalHolding = stockHoldingRepository.getTotalHoldingByStockBoothId(booth.getId());
            Long myHolding = 0L;
            if (userId != null) {
                myHolding = stockHoldingRepository.findByUserIdAndStockBoothId(userId, booth.getId())
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
                    .hasVisited(userId != null && stockBoothVisitRepository.existsByUserIdAndStockBoothId(userId, booth.getId()))
                    .hasRated(userId != null && stockRatingRepository.existsByUserIdAndStockBoothId(userId, booth.getId()))
                    .build();
        }).toList();
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
