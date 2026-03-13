package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class RepresentativeResultResponse {

    private List<BoothResult> combinedRanking;
    private List<BoothResult> rookieRanking;
    private List<BoothResult> executiveRanking;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class BoothResult {
        private int rank;
        private Long boothId;
        private String boothName;
        private String category;
        private long rookieRawInvestment;
        private double rookieScore;
        private long executiveInvestment;
        private double totalScore;
    }
}
