package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class StockRatingResponse {

    private Long id;
    private Long boothId;
    private Integer scoreFirst;
    private Integer scoreBest;
    private Integer scoreDifferent;
    private Integer scoreNumberOne;
    private Integer scoreGap;
    private Integer scoreGlobal;
    private Integer totalScore;
    private String review;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
