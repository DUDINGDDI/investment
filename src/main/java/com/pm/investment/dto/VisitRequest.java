package com.pm.investment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VisitRequest {

    @NotBlank(message = "부스 UUID는 필수입니다")
    private String boothUuid;
}
