package com.pm.investment.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseEmitterService {

    private static final long TIMEOUT = 5 * 60 * 1000L; // 5분
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final SettingService settingService;

    public SseEmitterService(SettingService settingService) {
        this.settingService = settingService;
    }

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        // 현재 공지를 초기 이벤트로 전송
        try {
            Map<String, String> current = settingService.getAnnouncement();
            String message = current.get("message");
            String updatedAt = current.get("updatedAt");
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
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("announcement")
                        .data(Map.of("message", message, "updatedAt", updatedAt)));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    public void broadcastClear() {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("cleared")
                        .data(""));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
