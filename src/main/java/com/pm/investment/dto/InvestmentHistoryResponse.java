package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class InvestmentHistoryResponse {
    private Long id;
    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private String themeColor;
    private String type;
    private Long amount;
    private Long balanceAfter;
    private LocalDateTime createdAt;
}
