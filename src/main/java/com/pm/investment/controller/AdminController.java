package com.pm.investment.controller;

import com.pm.investment.dto.AdminBoothRatingResponse;
import com.pm.investment.dto.RankingResponse;
import com.pm.investment.dto.StockPriceChangeRequest;
import com.pm.investment.dto.TicketUseRequest;
import com.pm.investment.dto.UserMissionResponse;
import com.pm.investment.service.MissionService;
import com.pm.investment.service.RankingService;
import com.pm.investment.service.SettingService;
import com.pm.investment.service.SseEmitterService;
import com.pm.investment.service.StockPriceService;
import com.pm.investment.service.StockRatingService;
import jakarta.validation.Valid;
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
    private final StockPriceService stockPriceService;
    private final StockRatingService stockRatingService;
    private final MissionService missionService;

    @GetMapping("/results/status")
    public ResponseEntity<Map<String, Boolean>> getResultsStatus() {
        return ResponseEntity.ok(Map.of("revealed", settingService.isResultsRevealed()));
    }

    @PostMapping("/results/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleResults() {
        boolean revealed = settingService.toggleResults();
        return ResponseEntity.ok(Map.of("revealed", revealed));
    }

    @GetMapping("/investment/status")
    public ResponseEntity<Map<String, Boolean>> getInvestmentStatus() {
        return ResponseEntity.ok(Map.of("enabled", settingService.isInvestmentEnabled()));
    }

    @PostMapping("/investment/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleInvestment() {
        boolean enabled = settingService.toggleInvestment();
        return ResponseEntity.ok(Map.of("enabled", enabled));
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

    @PostMapping("/stocks/price")
    public ResponseEntity<Map<String, String>> changeStockPrice(
            @Valid @RequestBody StockPriceChangeRequest request) {
        stockPriceService.changePrice(request.getBoothId(), request.getNewPrice());
        return ResponseEntity.ok(Map.of("message", "가격이 변경되었습니다"));
    }

    @GetMapping("/ratings")
    public ResponseEntity<List<AdminBoothRatingResponse>> getBoothRatings() {
        return ResponseEntity.ok(stockRatingService.getAdminRatingResults());
    }

    @PostMapping("/tickets/use")
    public ResponseEntity<UserMissionResponse> useTicket(@Valid @RequestBody TicketUseRequest request) {
        UserMissionResponse response = missionService.useTicket(request.getUserId(), request.getMissionId());
        return ResponseEntity.ok(response);
    }
}
