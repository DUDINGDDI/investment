package com.pm.ideaboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentNotifyRequest {
    private Long boothId;
    private Long commentId;
    private Long userId;
    private String userName;
    private String userCompany;
    private String content;
    private String tag;
    private LocalDateTime createdAt;
}
