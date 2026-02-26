package com.pm.investment.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CospiResponse {

    private Long currentTotal;
    private Long previousTotal;
    private Long change;
    private Double changeRate;
    private List<CospiPoint> history;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CospiPoint {
        private Long price;
        private LocalDateTime changedAt;
    }
}
