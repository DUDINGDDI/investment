package com.pm.ideaboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userCompany;
    private String content;
    private LocalDateTime createdAt;
}
