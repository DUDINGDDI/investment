package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AwardRankingItem {
    private int rank;
    private String name;
    private String company;
    private String value;
    private String time;
}
