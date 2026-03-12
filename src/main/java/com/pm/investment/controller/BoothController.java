package com.pm.investment.controller;

import com.pm.investment.dto.BoothResponse;
import com.pm.investment.service.BoothMemoService;
import com.pm.investment.service.BoothService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booths")
@RequiredArgsConstructor
public class BoothController {

    private final BoothService boothService;
    private final BoothMemoService boothMemoService;

    @GetMapping
    public ResponseEntity<List<BoothResponse>> getAllBooths(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boothService.getAllBooths(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoothResponse> getBooth(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boothService.getBooth(id, userId));
    }

    @GetMapping("/memos")
    public ResponseEntity<List<java.util.Map<String, Object>>> getAllMemos(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boothMemoService.getAllMemos(userId));
    }

    @GetMapping("/{id}/memo")
    public ResponseEntity<java.util.Map<String, String>> getMemo(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String content = boothMemoService.getMemo(userId, id);
        return ResponseEntity.ok(java.util.Map.of("content", content != null ? content : ""));
    }

    @PostMapping("/{id}/memo")
    public ResponseEntity<java.util.Map<String, String>> saveMemo(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String content = body.getOrDefault("content", "");
        boothMemoService.saveMemo(userId, id, content);
        return ResponseEntity.ok(java.util.Map.of("content", content));
    }

    @DeleteMapping("/{id}/memo")
    public ResponseEntity<Void> deleteMemo(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        boothMemoService.deleteMemo(userId, id);
        return ResponseEntity.noContent().build();
    }
}
