package com.pm.investment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvestRequest {

    @NotNull(message = "부스 ID는 필수입니다")
    private Long boothId;

    @NotNull(message = "금액은 필수입니다")
    @Min(value = 10000, message = "최소 투자 금액은 10,000 코인입니다")
    private Long amount;
}
