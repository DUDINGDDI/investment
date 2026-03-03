package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ReportEligibilityResponse {
    private boolean eligible;
    private int morningVisitCount;
    private int afternoonVisitCount;
    private int morningRequired;
    private int afternoonRequired;
}
