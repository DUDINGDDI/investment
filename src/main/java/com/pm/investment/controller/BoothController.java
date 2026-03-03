package com.pm.investment.controller;

import com.pm.investment.dto.BoothResponse;
import com.pm.investment.dto.BoothReviewResponse;
import com.pm.investment.dto.StockRatingRequest;
import com.pm.investment.dto.StockRatingResponse;
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
}
