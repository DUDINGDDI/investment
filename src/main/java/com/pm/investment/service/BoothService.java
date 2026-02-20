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

@Service
@RequiredArgsConstructor
public class BoothService {

    private final BoothRepository boothRepository;
    private final InvestmentRepository investmentRepository;

    @Transactional(readOnly = true)
    public List<BoothResponse> getAllBooths(Long userId) {
        List<Booth> booths = boothRepository.findAllByOrderByDisplayOrderAsc();

        return booths.stream().map(booth -> {
            Long totalInvestment = investmentRepository.getTotalInvestmentByBoothId(booth.getId());
            Long myInvestment = 0L;
            if (userId != null) {
                myInvestment = investmentRepository.findByUserIdAndBoothId(userId, booth.getId())
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
        }).toList();
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
