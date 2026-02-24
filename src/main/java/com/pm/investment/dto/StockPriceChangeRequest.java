package com.pm.investment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockPriceChangeRequest {

    @NotNull(message = "부스 ID는 필수입니다")
    private Long boothId;

    @NotNull(message = "가격은 필수입니다")
    @Min(value = 1, message = "가격은 0보다 커야 합니다")
    private Long newPrice;
}
