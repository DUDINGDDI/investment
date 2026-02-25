package com.pm.investment.controller;

import com.pm.investment.dto.RankingResponse;
import com.pm.investment.service.RankingService;
import com.pm.investment.service.SettingService;
import com.pm.investment.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final SettingService settingService;
    private final RankingService rankingService;
    private final SseEmitterService sseEmitterService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        return ResponseEntity.ok(Map.of("revealed", settingService.isResultsRevealed()));
    }

    @GetMapping("/investment-status")
    public ResponseEntity<Map<String, Boolean>> getInvestmentStatus() {
        return ResponseEntity.ok(Map.of("enabled", settingService.isInvestmentEnabled()));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingResponse>> getRanking() {
        if (!settingService.isResultsRevealed()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(rankingService.getRanking());
    }

    @GetMapping("/announcement")
    public ResponseEntity<Map<String, String>> getAnnouncement() {
        return ResponseEntity.ok(settingService.getAnnouncement());
    }

    @GetMapping(value = "/announce", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        // DB 조회를 컨트롤러에서 먼저 수행하여 트랜잭션/커넥션을 즉시 반환
        Map<String, String> currentAnnouncement = settingService.getAnnouncement();
        return sseEmitterService.subscribe(currentAnnouncement);
    }
}
