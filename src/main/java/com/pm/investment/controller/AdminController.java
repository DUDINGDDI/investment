package com.pm.investment.controller;

import com.pm.investment.dto.RankingResponse;
import com.pm.investment.service.RankingService;
import com.pm.investment.service.SettingService;
import com.pm.investment.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SettingService settingService;
    private final RankingService rankingService;
    private final SseEmitterService sseEmitterService;

    @GetMapping("/results/status")
    public ResponseEntity<Map<String, Boolean>> getResultsStatus() {
        return ResponseEntity.ok(Map.of("revealed", settingService.isResultsRevealed()));
    }

    @PostMapping("/results/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleResults() {
        boolean revealed = settingService.toggleResults();
        return ResponseEntity.ok(Map.of("revealed", revealed));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingResponse>> getRanking() {
        return ResponseEntity.ok(rankingService.getRanking());
    }

    @GetMapping("/announcement")
    public ResponseEntity<Map<String, String>> getAnnouncement() {
        return ResponseEntity.ok(settingService.getAnnouncement());
    }

    @PostMapping("/announcement")
    public ResponseEntity<Map<String, String>> setAnnouncement(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        Map<String, String> result = settingService.setAnnouncement(message);
        sseEmitterService.broadcast(result.get("message"), result.get("updatedAt"));
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/announcement")
    public ResponseEntity<Void> clearAnnouncement() {
        settingService.clearAnnouncement();
        sseEmitterService.broadcastClear();
        return ResponseEntity.noContent().build();
    }
}
