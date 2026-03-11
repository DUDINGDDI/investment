package com.pm.investment.controller;

import com.pm.investment.dto.BoothResponse;
import com.pm.investment.dto.BoothReviewResponse;
import com.pm.investment.dto.StockRatingRequest;
import com.pm.investment.dto.StockRatingResponse;
import com.pm.investment.service.BoothMemoService;
import com.pm.investment.service.BoothRatingService;
import com.pm.investment.service.BoothService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booths")
@RequiredArgsConstructor
public class BoothController {

    private final BoothService boothService;
    private final BoothRatingService boothRatingService;
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

    @PostMapping("/{id}/rating")
    public ResponseEntity<StockRatingResponse> submitRating(
            @PathVariable Long id,
            @Valid @RequestBody StockRatingRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(boothRatingService.submitRating(userId, id, request));
    }

    @GetMapping("/{id}/rating")
    public ResponseEntity<StockRatingResponse> getMyRating(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boothRatingService.getMyRating(userId, id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<BoothReviewResponse>> getBoothReviews(@PathVariable Long id) {
        return ResponseEntity.ok(boothRatingService.getBoothReviews(id));
    }

    @DeleteMapping("/{id}/rating/review")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        boothRatingService.deleteReview(userId, id);
        return ResponseEntity.noContent().build();
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
