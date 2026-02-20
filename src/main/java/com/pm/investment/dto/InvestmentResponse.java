package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class InvestmentResponse {
    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private String themeColor;
    private Long amount;
}
