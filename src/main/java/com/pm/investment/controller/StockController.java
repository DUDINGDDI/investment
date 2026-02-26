package com.pm.investment.controller;

import com.pm.investment.dto.*;
import com.pm.investment.service.StockBoothService;
import com.pm.investment.service.StockCommentService;
import com.pm.investment.service.StockPriceService;
import com.pm.investment.service.StockRatingService;
import com.pm.investment.service.StockService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final StockBoothService stockBoothService;
    private final StockPriceService stockPriceService;
    private final StockCommentService stockCommentService;
    private final StockRatingService stockRatingService;

    @PostMapping("/buy")
    public ResponseEntity<Map<String, String>> buy(
            @Valid @RequestBody StockTradeRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        stockService.buy(userId, request.getBoothId(), request.getAmount());
        return ResponseEntity.ok(Map.of("message", "매수가 완료되었습니다"));
    }

    @PostMapping("/sell")
    public ResponseEntity<Map<String, String>> sell(
            @Valid @RequestBody StockTradeRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        stockService.sell(userId, request.getBoothId(), request.getAmount());
        return ResponseEntity.ok(Map.of("message", "매도가 완료되었습니다"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<StockHoldingResponse>> getMyHoldings(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(stockService.getMyHoldings(userId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<StockTradeHistoryResponse>> getMyTradeHistory(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(stockService.getMyTradeHistory(userId));
    }

    @GetMapping("/account")
    public ResponseEntity<StockAccountResponse> getMyAccount(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(stockService.getMyAccount(userId));
    }

    @GetMapping("/cospi")
    public ResponseEntity<CospiResponse> getCospi() {
        return ResponseEntity.ok(stockService.getCospiData());
    }

    @GetMapping("/booths")
    public ResponseEntity<List<StockBoothResponse>> getAllStockBooths(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(stockBoothService.getAllStockBooths(userId));
    }

    @GetMapping("/booths/{id}")
    public ResponseEntity<StockBoothResponse> getStockBooth(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(stockBoothService.getStockBooth(id, userId));
    }

    @GetMapping("/booths/{id}/price-history")
    public ResponseEntity<StockPriceHistoryResponse> getPriceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(stockPriceService.getPriceHistory(id));
    }

    @GetMapping("/booths/{id}/my-history")
    public ResponseEntity<List<StockTradeHistoryResponse>> getMyTradeHistoryByBooth(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(stockService.getMyTradeHistoryByBooth(userId, id));
    }

    @GetMapping("/booths/{id}/comments")
    public ResponseEntity<List<StockCommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(stockCommentService.getComments(id));
    }

    @PostMapping("/booths/{id}/comments")
    public ResponseEntity<StockCommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody StockCommentRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(stockCommentService.addComment(userId, id, request.getContent()));
    }

    @PostMapping("/booths/{id}/rating")
    public ResponseEntity<StockRatingResponse> submitRating(
            @PathVariable Long id,
            @Valid @RequestBody StockRatingRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(stockRatingService.submitRating(userId, id, request));
    }

    @GetMapping("/booths/{id}/rating")
    public ResponseEntity<StockRatingResponse> getMyRating(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        StockRatingResponse rating = stockRatingService.getMyRating(userId, id);
        if (rating == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/booths/{id}/reviews")
    public ResponseEntity<List<BoothReviewResponse>> getBoothReviews(@PathVariable Long id) {
        return ResponseEntity.ok(stockRatingService.getBoothReviews(id));
    }

    @DeleteMapping("/booths/{id}/rating/review")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        stockRatingService.deleteReview(userId, id);
        return ResponseEntity.noContent().build();
    }
}
