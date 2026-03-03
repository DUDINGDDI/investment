package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ReportResponse {
    private boolean eligible;
    private String ineligibleReason;

    // 유저 정보
    private String userName;
    private String userCompany;

    // 성향 유형
    private String tendencyType;
    private String tendencyName;
    private String tendencyEmoji;
    private String tendencyOneLiner;

    // 레이더 차트 (0~100)
    private int diversity;
    private int activeness;
    private int stability;
    private int creativity;
    private int insight;

    // 핵심 수치
    private long totalInvested;
    private long currentBalance;
    private int investedBoothCount;
    private int totalTradeCount;
    private int ideaCount;
    private double ratingAverage;

    // 포트폴리오
    private List<PortfolioItem> portfolio;

    // 최대 투자처
    private String topBoothName;
    private String topBoothEmoji;
    private long topBoothAmount;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PortfolioItem {
        private Long boothId;
        private String boothName;
        private String logoEmoji;
        private String themeColor;
        private long amount;
        private double percentage;
    }
}
