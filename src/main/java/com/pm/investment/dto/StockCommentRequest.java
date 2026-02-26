package com.pm.investment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockCommentRequest {

    @NotBlank(message = "댓글 내용을 입력해주세요")
    private String content;
}
