package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StockBoothVisitResponse {
    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private String message;
}
