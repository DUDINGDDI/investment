package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private Long userId;
    private String name;
    private String company;
    private Long balance;
    private String token;
}
