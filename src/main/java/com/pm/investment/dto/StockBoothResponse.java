package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StockBoothResponse {

    private Long id;
    private String name;
    private String category;
    private String description;
    private String shortDescription;
    private Integer displayOrder;
    private String logoEmoji;
    private String themeColor;
    private Long totalHolding;
    private Long myHolding;
    private Boolean hasVisited;
    private Boolean hasRated;
}
