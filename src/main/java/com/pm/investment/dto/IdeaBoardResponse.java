package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class IdeaBoardResponse {

    private Long boothId;
    private String boothName;
    private String logoEmoji;
    private String themeColor;
    private String category;
    private List<StockCommentResponse> comments;
}
