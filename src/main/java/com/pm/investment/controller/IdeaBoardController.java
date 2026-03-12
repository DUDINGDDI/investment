package com.pm.investment.controller;

import com.pm.investment.dto.IdeaBoardResponse;
import com.pm.investment.dto.StockCommentResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.entity.StockRating;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.StockRatingRepository;
import com.pm.investment.service.IdeaBoardSseService;
import com.pm.investment.service.StockCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/idea-board")
@RequiredArgsConstructor
public class IdeaBoardController {

    private final StockCommentService stockCommentService;
    private final StockBoothRepository stockBoothRepository;
    private final StockRatingRepository stockRatingRepository;
    private final IdeaBoardSseService ideaBoardSseService;

    private List<StockCommentResponse> getMergedComments(Long boothId) {
        List<StockCommentResponse> comments = stockCommentService.getComments(boothId);
        // 댓글에 tag 추가
        List<StockCommentResponse> taggedComments = comments.stream()
                .map(c -> StockCommentResponse.builder()
                        .id(c.getId())
                        .userId(c.getUserId())
                        .userName(c.getUserName())
                        .userCompany(c.getUserCompany())
                        .content(c.getContent())
                        .tag("꿈을 원대하게")
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();

        // 리뷰(sincere)도 포함
        List<StockRating> reviews = stockRatingRepository.findByStockBoothIdAndReviewIsNotNullOrderByUpdatedAtDesc(boothId);
        List<StockCommentResponse> reviewComments = reviews.stream()
                .map(r -> StockCommentResponse.builder()
                        .id(-r.getId()) // 음수 ID로 댓글과 구분
                        .userId(r.getUser().getId())
                        .userName(r.getUser().getName())
                        .userCompany(r.getUser().getCompany())
                        .content(r.getReview())
                        .tag("진정성 있게")
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();

        List<StockCommentResponse> merged = new ArrayList<>(taggedComments);
        merged.addAll(reviewComments);
        merged.sort(Comparator.comparing(StockCommentResponse::getCreatedAt).reversed());
        return merged;
    }

    @GetMapping("/booths/{boothId}")
    public ResponseEntity<IdeaBoardResponse> getBoard(@PathVariable Long boothId) {
        StockBooth booth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        List<StockCommentResponse> comments = getMergedComments(boothId);

        IdeaBoardResponse response = IdeaBoardResponse.builder()
                .boothId(booth.getId())
                .boothName(booth.getName())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .category(booth.getCategory())
                .comments(comments)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/booths/{boothId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable Long boothId) {
        StockBooth booth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        List<StockCommentResponse> comments = getMergedComments(boothId);

        IdeaBoardResponse initData = IdeaBoardResponse.builder()
                .boothId(booth.getId())
                .boothName(booth.getName())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .category(booth.getCategory())
                .comments(comments)
                .build();

        SseEmitter emitter = ideaBoardSseService.subscribe(boothId);

        try {
            emitter.send(SseEmitter.event().name("init").data(initData));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }
}
