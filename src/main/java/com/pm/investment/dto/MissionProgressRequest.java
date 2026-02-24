package com.pm.investment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MissionProgressRequest {
    @NotBlank(message = "미션 ID는 필수입니다")
    private String missionId;
    private int progress;
}
