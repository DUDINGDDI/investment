package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserMissionResponse {
    private String missionId;
    private int progress;
    private int target;
    private boolean isCompleted;
    private double achievementRate;
}
