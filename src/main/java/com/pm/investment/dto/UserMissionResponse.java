package com.pm.investment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserMissionResponse {
    private String missionId;
    private int progress;
    private int target;

    @JsonProperty("isCompleted")
    private boolean isCompleted;

    private double achievementRate;

    @JsonProperty("isUsed")
    private boolean isUsed;

    private LocalDateTime usedAt;
}
