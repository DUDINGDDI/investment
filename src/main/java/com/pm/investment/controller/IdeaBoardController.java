package com.pm.investment.controller;

import com.pm.investment.dto.IdeaBoardResponse;
import com.pm.investment.dto.StockCommentResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.service.IdeaBoardSseService;
import com.pm.investment.service.StockCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/idea-board")
@RequiredArgsConstructor
public class IdeaBoardController {

    private final StockCommentService stockCommentService;
    private final StockBoothRepository stockBoothRepository;
    private final IdeaBoardSseService ideaBoardSseService;

    @GetMapping("/booths/{boothId}")
    public ResponseEntity<IdeaBoardResponse> getBoard(@PathVariable Long boothId) {
        StockBooth booth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        List<StockCommentResponse> comments = stockCommentService.getComments(boothId);

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

        List<StockCommentResponse> comments = stockCommentService.getComments(boothId);

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
