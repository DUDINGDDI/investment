package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MissionRankingResponse {
    private int rank;
    private Long userId;
    private String name;
    private double achievementRate;
    private boolean isCompleted;
    private int progress;
    private int target;
}
