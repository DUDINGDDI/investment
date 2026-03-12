package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class RookieInvestmentResponse {
    private List<RookieDetail> rookies;
    private List<BoothSummary> boothSummaries;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RookieDetail {
        private Long userId;
        private String name;
        private String company;
        private Long balance;
        private Long totalInvested;
        private List<InvestmentItem> investments;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class InvestmentItem {
        private Long boothId;
        private String boothName;
        private String category;
        private Long amount;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class BoothSummary {
        private Long boothId;
        private String boothName;
        private String category;
        private Long rookieInvestment;
        private int rookieInvestorCount;
    }
}
