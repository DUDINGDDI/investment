package com.pm.investment.controller;

import com.pm.investment.dto.AdminBoothRatingResponse;
import com.pm.investment.dto.ExecutiveInvestmentResponse;
import com.pm.investment.dto.RankingResponse;
import com.pm.investment.dto.StockPriceChangeRequest;
import com.pm.investment.dto.TicketUseRequest;
import com.pm.investment.dto.UserMissionResponse;
import com.pm.investment.service.MissionService;
import com.pm.investment.service.RankingService;
import com.pm.investment.service.SettingService;
import com.pm.investment.service.SseEmitterService;
import com.pm.investment.service.BoothRatingService;
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
    private final BoothRatingService boothRatingService;
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

    @GetMapping("/mission-result/status")
    public ResponseEntity<Map<String, Boolean>> getMissionResultStatus() {
        return ResponseEntity.ok(Map.of("revealed", settingService.isMissionResultRevealed()));
    }

    @PostMapping("/mission-result/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleMissionResult() {
        boolean revealed = settingService.toggleMissionResult();
        return ResponseEntity.ok(Map.of("revealed", revealed));
    }

    @GetMapping("/stock/status")
    public ResponseEntity<Map<String, Boolean>> getStockStatus() {
        return ResponseEntity.ok(Map.of("enabled", settingService.isStockEnabled()));
    }

    @PostMapping("/stock/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleStock() {
        boolean enabled = settingService.toggleStock();
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    @GetMapping("/stock-ranking/status")
    public ResponseEntity<Map<String, Boolean>> getStockRankingStatus() {
        return ResponseEntity.ok(Map.of("enabled", settingService.isStockRankingEnabled()));
    }

    @PostMapping("/stock-ranking/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleStockRanking() {
        boolean enabled = settingService.toggleStockRanking();
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    @GetMapping("/dream/status")
    public ResponseEntity<Map<String, Boolean>> getDreamStatus() {
        return ResponseEntity.ok(Map.of("enabled", settingService.isDreamEnabled()));
    }

    @PostMapping("/dream/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleDream() {
        boolean enabled = settingService.toggleDream();
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingResponse>> getRanking() {
        return ResponseEntity.ok(rankingService.getRanking());
    }

    @GetMapping("/stock-ranking")
    public ResponseEntity<List<RankingResponse>> getStockRanking() {
        return ResponseEntity.ok(rankingService.getStockRanking());
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

    @GetMapping("/booth-ratings")
    public ResponseEntity<List<AdminBoothRatingResponse>> getPmBoothRatings() {
        return ResponseEntity.ok(boothRatingService.getAdminRatingResults());
    }

    @PostMapping("/tickets/use")
    public ResponseEntity<UserMissionResponse> useTicket(@Valid @RequestBody TicketUseRequest request) {
        UserMissionResponse response = missionService.useTicket(request.getUserId(), request.getMissionId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tickets/use-all")
    public ResponseEntity<Map<String, Object>> useAllTickets(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        List<String> usedMissionIds = missionService.useAllTickets(userId);
        return ResponseEntity.ok(Map.of("userId", userId, "usedCount", usedMissionIds.size(), "usedMissions", usedMissionIds));
    }

    @PostMapping("/missions/complete-all")
    public ResponseEntity<Map<String, Object>> completeMissionForAll(@RequestBody Map<String, String> body) {
        String missionId = body.get("missionId");
        int count = missionService.completeForAll(missionId);
        sseEmitterService.broadcastMissionComplete(missionId);
        return ResponseEntity.ok(Map.of("missionId", missionId, "completedCount", count));
    }

    @GetMapping("/executive-investments")
    public ResponseEntity<ExecutiveInvestmentResponse> getExecutiveInvestments() {
        return ResponseEntity.ok(rankingService.getExecutiveInvestments());
    }

    @PostMapping("/missions/uncomplete-all")
    public ResponseEntity<Map<String, Object>> uncompleteMissionForAll(@RequestBody Map<String, String> body) {
        String missionId = body.get("missionId");
        int count = missionService.uncompleteForAll(missionId);
        return ResponseEntity.ok(Map.of("missionId", missionId, "uncompletedCount", count));
    }
}
