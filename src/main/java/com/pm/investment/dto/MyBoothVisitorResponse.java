package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyBoothVisitorResponse {
    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private long visitorCount;
}
