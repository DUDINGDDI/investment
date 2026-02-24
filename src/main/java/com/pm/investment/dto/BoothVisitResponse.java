package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class BoothVisitResponse {
    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private String message;
    private LocalDateTime visitedAt;
}
