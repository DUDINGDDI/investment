package com.pm.investment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserMissionResponse {
    private String missionId;
    private int progress;
    private int target;

    @JsonProperty("isCompleted")
    private boolean isCompleted;

    private double achievementRate;
}
