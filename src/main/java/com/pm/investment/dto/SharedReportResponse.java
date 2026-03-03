package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class SharedReportResponse {
    private Long userId;
    private String userName;
    private String userCompany;
    private String tendencyType;
    private String tendencyName;
    private String tendencyEmoji;
    private String tendencyOneLiner;
    private String vision;
    private LocalDateTime createdAt;
}
