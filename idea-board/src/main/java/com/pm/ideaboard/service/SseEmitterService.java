package com.pm.ideaboard.service;

import com.pm.ideaboard.dto.CommentResponse;
import com.pm.ideaboard.dto.IdeaBoardResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.*;

@Service
public class SseEmitterService {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterService.class);
    private static final long TIMEOUT = 10 * 60 * 1000L; // 10분
    private static final long HEARTBEAT_INTERVAL = 30_000L; // 30초

    private final Map<Long, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatScheduler = Executors.newSingleThreadScheduledExecutor();

    public SseEmitterService() {
        heartbeatScheduler.scheduleAtFixedRate(this::sendHeartbeats,
                HEARTBEAT_INTERVAL, HEARTBEAT_INTERVAL, TimeUnit.MILLISECONDS);
    }

    public SseEmitter subscribe(Long boothId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        Set<SseEmitter> boothEmitters = emitters.computeIfAbsent(boothId,
                k -> ConcurrentHashMap.newKeySet());
        boothEmitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(boothId, emitter));
        emitter.onTimeout(() -> removeEmitter(boothId, emitter));
        emitter.onError(e -> removeEmitter(boothId, emitter));

        return emitter;
    }

    public void sendInit(SseEmitter emitter, IdeaBoardResponse board) {
        try {
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data(board));
        } catch (IOException e) {
            log.warn("init 이벤트 전송 실패: {}", e.getMessage());
        }
    }

    public void broadcastNewComment(Long boothId, CommentResponse comment) {
        Set<SseEmitter> boothEmitters = emitters.get(boothId);
        if (boothEmitters == null || boothEmitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : boothEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("new-comment")
                        .data(comment));
            } catch (IOException e) {
                removeEmitter(boothId, emitter);
            }
        }
    }

    private void sendHeartbeats() {
        emitters.forEach((boothId, boothEmitters) -> {
            for (SseEmitter emitter : boothEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("heartbeat")
                            .data(""));
                } catch (IOException e) {
                    removeEmitter(boothId, emitter);
                }
            }
        });
    }

    private void removeEmitter(Long boothId, SseEmitter emitter) {
        Set<SseEmitter> boothEmitters = emitters.get(boothId);
        if (boothEmitters != null) {
            boothEmitters.remove(emitter);
            if (boothEmitters.isEmpty()) {
                emitters.remove(boothId);
            }
        }
    }
}
