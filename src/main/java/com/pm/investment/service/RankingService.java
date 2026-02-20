package com.pm.investment.service;

import com.pm.investment.dto.RankingResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.InvestmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final BoothRepository boothRepository;
    private final InvestmentRepository investmentRepository;

    @Transactional(readOnly = true)
    public List<RankingResponse> getRanking() {
        List<Booth> booths = boothRepository.findAll();

        List<RankingResponse> unsorted = booths.stream().map(booth -> {
            Long totalInvestment = investmentRepository.getTotalInvestmentByBoothId(booth.getId());
            Long investorCount = investmentRepository.getInvestorCountByBoothId(booth.getId());
            return RankingResponse.builder()
                    .boothId(booth.getId())
                    .boothName(booth.getName())
                    .category(booth.getCategory())
                    .logoEmoji(booth.getLogoEmoji())
                    .themeColor(booth.getThemeColor())
                    .totalInvestment(totalInvestment)
                    .investorCount(investorCount)
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
