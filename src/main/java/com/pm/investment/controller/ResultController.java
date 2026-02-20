package com.pm.investment.controller;

import com.pm.investment.dto.RankingResponse;
import com.pm.investment.service.RankingService;
import com.pm.investment.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final SettingService settingService;
    private final RankingService rankingService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        return ResponseEntity.ok(Map.of("revealed", settingService.isResultsRevealed()));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingResponse>> getRanking() {
        if (!settingService.isResultsRevealed()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(rankingService.getRanking());
    }
}
