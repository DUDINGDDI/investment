package com.pm.investment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoothReplacePickRequest {

    @NotNull(message = "주식 부스 ID는 필수입니다")
    private Long stockBoothId;
}
