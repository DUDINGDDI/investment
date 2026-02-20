package com.pm.investment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "고유 코드는 필수입니다")
    private String uniqueCode;

    @NotBlank(message = "이름은 필수입니다")
    private String name;
}
