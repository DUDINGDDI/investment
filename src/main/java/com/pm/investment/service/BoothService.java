package com.pm.investment.service;

import com.pm.investment.dto.BoothResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.entity.Investment;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.InvestmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoothService {

    private final BoothRepository boothRepository;
    private final InvestmentRepository investmentRepository;

    @Transactional(readOnly = true)
    public List<BoothResponse> getAllBooths(Long userId) {
        List<Booth> booths = boothRepository.findAllByOrderByDisplayOrderAsc();

        // 1개 쿼리로 전체 부스 투자 통계 조회 (N+1 제거)
        Map<Long, Long> totalMap = investmentRepository.getInvestmentStatsByBooth()
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).longValue()
                ));

        // 1개 쿼리로 내 투자금 일괄 조회 (N+1 제거)
        Map<Long, Long> myMap = userId != null
                ? investmentRepository.getMyInvestmentAmounts(userId)
                        .stream()
                        .collect(Collectors.toMap(
                                row -> (Long) row[0],
                                row -> ((Number) row[1]).longValue()
                        ))
                : Map.of();

        return booths.stream().map(booth -> BoothResponse.builder()
                .id(booth.getId())
                .name(booth.getName())
                .category(booth.getCategory())
                .description(booth.getDescription())
                .shortDescription(booth.getShortDescription())
                .displayOrder(booth.getDisplayOrder())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .totalInvestment(totalMap.getOrDefault(booth.getId(), 0L))
                .myInvestment(myMap.getOrDefault(booth.getId(), 0L))
                .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public BoothResponse getBooth(Long boothId, Long userId) {
        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        Long totalInvestment = investmentRepository.getTotalInvestmentByBoothId(boothId);
        Long myInvestment = 0L;
        if (userId != null) {
            myInvestment = investmentRepository.findByUserIdAndBoothId(userId, boothId)
                    .map(Investment::getAmount)
                    .orElse(0L);
        }

        return BoothResponse.builder()
                .id(booth.getId())
                .name(booth.getName())
                .category(booth.getCategory())
                .description(booth.getDescription())
                .shortDescription(booth.getShortDescription())
                .displayOrder(booth.getDisplayOrder())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .totalInvestment(totalInvestment)
                .myInvestment(myInvestment)
                .build();
    }
}
