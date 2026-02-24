package com.pm.investment.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StockTradeHistoryResponse {

    private Long id;
    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private String themeColor;
    private String type;
    private Long amount;
    private Long priceAtTrade;
    private Long balanceAfter;
    private LocalDateTime createdAt;
}
