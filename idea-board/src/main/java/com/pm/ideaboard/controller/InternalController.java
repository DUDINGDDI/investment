package com.pm.ideaboard.controller;

import com.pm.ideaboard.dto.CommentNotifyRequest;
import com.pm.ideaboard.dto.CommentResponse;
import com.pm.ideaboard.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalController {

    private final SseEmitterService sseEmitterService;

    @PostMapping("/comments/notify")
    public ResponseEntity<Void> notifyNewComment(@RequestBody CommentNotifyRequest request) {
        CommentResponse comment = CommentResponse.builder()
                .id(request.getCommentId())
                .userId(request.getUserId())
                .userName(request.getUserName())
                .userCompany(request.getUserCompany())
                .content(request.getContent())
                .createdAt(request.getCreatedAt())
                .build();

        sseEmitterService.broadcastNewComment(request.getBoothId(), comment);

        return ResponseEntity.ok().build();
    }
}
