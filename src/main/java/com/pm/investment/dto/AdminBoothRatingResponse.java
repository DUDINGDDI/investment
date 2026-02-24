package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminBoothRatingResponse {

    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private String themeColor;
    private Long ratingCount;
    private Long totalScoreSum;
    private Double avgFirst;
    private Double avgBest;
    private Double avgDifferent;
    private Double avgNumberOne;
    private Double avgGap;
    private Double avgGlobal;
    private Double avgTotal;
}
