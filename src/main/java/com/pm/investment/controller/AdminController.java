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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SettingService settingService;
    private final RankingService rankingService;

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
}
