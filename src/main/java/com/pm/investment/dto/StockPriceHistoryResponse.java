package com.pm.investment.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StockPriceHistoryResponse {

    private Long boothId;
    private String boothName;
    private Long currentPrice;
    private List<PricePoint> priceHistory;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class PricePoint {
        private Long price;
        private LocalDateTime changedAt;
    }
}
