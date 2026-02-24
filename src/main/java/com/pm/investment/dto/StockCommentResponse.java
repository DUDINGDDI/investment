package com.pm.investment.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StockCommentResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}
