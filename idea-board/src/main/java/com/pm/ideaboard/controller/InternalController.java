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
        CommentResponse comment = toCommentResponse(request);
        sseEmitterService.broadcastNewComment(request.getBoothId(), comment);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comments/update")
    public ResponseEntity<Void> notifyUpdateComment(@RequestBody CommentNotifyRequest request) {
        CommentResponse comment = toCommentResponse(request);
        sseEmitterService.broadcastUpdateComment(request.getBoothId(), comment);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comments/delete")
    public ResponseEntity<Void> notifyDeleteComment(@RequestBody java.util.Map<String, Object> request) {
        Long boothId = ((Number) request.get("boothId")).longValue();
        Long commentId = ((Number) request.get("commentId")).longValue();
        sseEmitterService.broadcastDeleteComment(boothId, commentId);
        return ResponseEntity.ok().build();
    }

    private CommentResponse toCommentResponse(CommentNotifyRequest request) {
        return CommentResponse.builder()
                .id(request.getCommentId())
                .userId(request.getUserId())
                .userName(request.getUserName())
                .userCompany(request.getUserCompany())
                .content(request.getContent())
                .tag(request.getTag())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
