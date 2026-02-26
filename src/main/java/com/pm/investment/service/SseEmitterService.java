package com.pm.investment.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseEmitterService {

    private static final long TIMEOUT = 5 * 60 * 1000L; // 5분
    private final Set<SseEmitter> emitters = ConcurrentHashMap.newKeySet();

    public SseEmitter subscribe(Map<String, String> currentAnnouncement) {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitters.add(emitter);

        Runnable cleanup = () -> emitters.remove(emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // 이미 조회된 공지 데이터를 초기 이벤트로 전송 (DB 커넥션 미사용)
        try {
            String message = currentAnnouncement.get("message");
            String updatedAt = currentAnnouncement.get("updatedAt");
            if (message != null && !message.isEmpty()) {
                emitter.send(SseEmitter.event()
                        .name("announcement")
                        .data(Map.of("message", message, "updatedAt", updatedAt)));
            }
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcast(String message, String updatedAt) {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("announcement")
                        .data(Map.of("message", message, "updatedAt", updatedAt)));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }

    public void broadcastClear() {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("cleared")
                        .data(""));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }
}
