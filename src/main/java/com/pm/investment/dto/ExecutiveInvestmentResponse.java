package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExecutiveInvestmentResponse {
    private List<ExecutiveDetail> executives;
    private List<BoothSummary> boothSummaries;

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExecutiveDetail {
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
    @NoArgsConstructor
    public static class InvestmentItem {
        private Long boothId;
        private String boothName;
        private String category;
        private String logoEmoji;
        private Long amount;
        private String memo;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BoothSummary {
        private Long boothId;
        private String boothName;
        private String category;
        private String logoEmoji;
        private String themeColor;
        private Long executiveInvestment;
        private int executiveInvestorCount;
    }
}
