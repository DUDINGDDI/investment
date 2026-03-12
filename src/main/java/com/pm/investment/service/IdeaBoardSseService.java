package com.pm.investment.service;

import com.pm.investment.dto.StockCommentResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdeaBoardSseService {

    private static final long TIMEOUT = 10 * 60 * 1000L; // 10분

    // boothId -> Set<SseEmitter>
    private final Map<Long, Set<SseEmitter>> emitterMap = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long boothId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitterMap.computeIfAbsent(boothId, k -> ConcurrentHashMap.newKeySet()).add(emitter);

        Runnable cleanup = () -> {
            Set<SseEmitter> set = emitterMap.get(boothId);
            if (set != null) {
                set.remove(emitter);
                if (set.isEmpty()) emitterMap.remove(boothId);
            }
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        return emitter;
    }

    public void broadcastNewComment(Long boothId, StockCommentResponse comment) {
        broadcast(boothId, "new-comment", comment);
    }

    public void broadcastUpdateComment(Long boothId, StockCommentResponse comment) {
        broadcast(boothId, "update-comment", comment);
    }

    public void broadcastDeleteComment(Long boothId, Long commentId) {
        broadcast(boothId, "delete-comment", Map.of("id", commentId));
    }

    private void broadcast(Long boothId, String eventName, Object data) {
        Set<SseEmitter> emitters = emitterMap.get(boothId);
        if (emitters == null || emitters.isEmpty()) return;

        List<SseEmitter> dead = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                dead.add(emitter);
            }
        }
        emitters.removeAll(dead);
    }
}
