package com.pm.investment.controller;

import com.pm.investment.dto.MissionProgressRequest;
import com.pm.investment.dto.UserMissionResponse;
import com.pm.investment.service.MissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @GetMapping("/my")
    public ResponseEntity<List<UserMissionResponse>> getMyMissions(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(missionService.getMyMissions(userId));
    }

    @PostMapping("/progress")
    public ResponseEntity<UserMissionResponse> updateProgress(
            HttpServletRequest request,
            @Valid @RequestBody MissionProgressRequest body) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(missionService.updateProgress(userId, body.getMissionId(), body.getProgress()));
    }

    @PostMapping("/complete")
    public ResponseEntity<UserMissionResponse> completeMission(
            HttpServletRequest request,
            @Valid @RequestBody MissionProgressRequest body) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(missionService.completeMission(userId, body.getMissionId()));
    }

    @GetMapping("/ranking")
    public ResponseEntity<Map<String, Object>> getMissionRanking(
            @RequestParam String missionId,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(missionService.getMissionRanking(missionId, userId));
    }
}
