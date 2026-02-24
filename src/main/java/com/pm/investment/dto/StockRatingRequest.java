package com.pm.investment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockRatingRequest {

    @NotNull(message = "최초 점수는 필수입니다")
    @Min(1) @Max(5)
    private Integer scoreFirst;

    @NotNull(message = "최고 점수는 필수입니다")
    @Min(1) @Max(5)
    private Integer scoreBest;

    @NotNull(message = "차별화 점수는 필수입니다")
    @Min(1) @Max(5)
    private Integer scoreDifferent;

    @NotNull(message = "일등 점수는 필수입니다")
    @Min(1) @Max(5)
    private Integer scoreNumberOne;

    @NotNull(message = "초격차 점수는 필수입니다")
    @Min(1) @Max(5)
    private Integer scoreGap;

    @NotNull(message = "글로벌 점수는 필수입니다")
    @Min(1) @Max(5)
    private Integer scoreGlobal;

    private String review;
}
