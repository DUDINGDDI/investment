package com.pm.investment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockTradeRequest {

    @NotNull(message = "부스 ID는 필수입니다")
    private Long boothId;

    @NotNull(message = "금액은 필수입니다")
    @Min(value = 100_000_000, message = "최소 거래 금액은 1억원입니다")
    private Long amount;
}
