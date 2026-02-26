package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class NoteResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderCompany;
    private Long receiverId;
    private String receiverName;
    private String receiverCompany;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
