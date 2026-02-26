package com.pm.investment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TicketUseRequest {

    @NotNull
    private Long userId;

    @NotNull
    private String missionId;
}
