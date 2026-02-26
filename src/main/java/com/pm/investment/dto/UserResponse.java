package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String uniqueCode;
    private String name;
    private String company;
    private Long balance;
}
