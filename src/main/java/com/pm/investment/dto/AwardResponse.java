package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AwardResponse {
    private String awardName;
    private String description;
    private String winnerName;
    private String winnerCompany;
    private String detail;
}
