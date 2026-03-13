package com.pm.ideaboard.service;

import com.pm.ideaboard.dto.CommentResponse;
import com.pm.ideaboard.dto.IdeaBoardResponse;
import com.pm.ideaboard.entity.StockBooth;
import com.pm.ideaboard.entity.StockComment;
import com.pm.ideaboard.entity.StockRating;
import com.pm.ideaboard.repository.StockBoothRepository;
import com.pm.ideaboard.repository.StockCommentRepository;
import com.pm.ideaboard.repository.StockRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IdeaBoardService {

    private final StockBoothRepository stockBoothRepository;
    private final StockCommentRepository stockCommentRepository;
    private final StockRatingRepository stockRatingRepository;

    @Transactional(readOnly = true)
    public IdeaBoardResponse getBoard(Long boothId) {
        StockBooth booth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        // 댓글
        List<CommentResponse> taggedComments = stockCommentRepository
                .findByStockBoothIdOrderByCreatedAtDesc(boothId)
                .stream()
                .map(c -> CommentResponse.builder()
                        .id(c.getId())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .userCompany(c.getUser().getCompany())
                        .content(c.getContent())
                        .tag("꿈을 원대하게")
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();

        // 리뷰
        List<CommentResponse> reviewComments = stockRatingRepository
                .findByStockBoothIdAndReviewIsNotNullOrderByUpdatedAtDesc(boothId)
                .stream()
                .map(r -> CommentResponse.builder()
                        .id(-r.getId())
                        .userId(r.getUser().getId())
                        .userName(r.getUser().getName())
                        .userCompany(r.getUser().getCompany())
                        .content(r.getReview())
                        .tag("진정성 있게")
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();

        // 병합 + 최신순 정렬
        List<CommentResponse> merged = new ArrayList<>(taggedComments);
        merged.addAll(reviewComments);
        merged.sort(Comparator.comparing(CommentResponse::getCreatedAt).reversed());

        return IdeaBoardResponse.builder()
                .boothId(booth.getId())
                .boothName(booth.getName())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .category(booth.getCategory())
                .comments(merged)
                .build();
    }
}
