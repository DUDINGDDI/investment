package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MyStockBoothVisitorResponse {
    private String boothName;
    private String logoEmoji;
    private long visitorCount;
}
