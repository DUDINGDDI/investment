package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RankingResponse {
    private int rank;
    private Long boothId;
    private String boothName;
    private String category;
    private String logoEmoji;
    private String themeColor;
    private Long totalInvestment;
    private Long investorCount;
}
