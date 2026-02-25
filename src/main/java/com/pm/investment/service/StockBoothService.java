package com.pm.investment.service;

import com.pm.investment.dto.StockBoothResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.BoothVisitRepository;
import com.pm.investment.repository.StockHoldingRepository;
import com.pm.investment.repository.StockRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockBoothService {

    private final BoothRepository boothRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final BoothVisitRepository boothVisitRepository;
    private final StockRatingRepository stockRatingRepository;

    @Transactional(readOnly = true)
    public List<StockBoothResponse> getAllStockBooths(Long userId) {
        List<Booth> booths = boothRepository.findAllByOrderByDisplayOrderAsc();

        return booths.stream().map(booth -> {
            Long totalHolding = stockHoldingRepository.getTotalHoldingByBoothId(booth.getId());
            Long myHolding = 0L;
            if (userId != null) {
                myHolding = stockHoldingRepository.findByUserIdAndBoothId(userId, booth.getId())
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
                    .hasVisited(userId != null && boothVisitRepository.existsByUserIdAndBoothId(userId, booth.getId()))
                    .hasRated(userId != null && stockRatingRepository.existsByUserIdAndBoothId(userId, booth.getId()))
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public StockBoothResponse getStockBooth(Long boothId, Long userId) {
        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        Long totalHolding = stockHoldingRepository.getTotalHoldingByBoothId(boothId);
        Long myHolding = 0L;
        if (userId != null) {
            myHolding = stockHoldingRepository.findByUserIdAndBoothId(userId, boothId)
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
                .hasVisited(userId != null && boothVisitRepository.existsByUserIdAndBoothId(userId, boothId))
                .hasRated(userId != null && stockRatingRepository.existsByUserIdAndBoothId(userId, boothId))
                .build();
    }
}
