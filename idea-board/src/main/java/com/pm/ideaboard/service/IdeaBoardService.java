package com.pm.ideaboard.service;

import com.pm.ideaboard.dto.CommentResponse;
import com.pm.ideaboard.dto.IdeaBoardResponse;
import com.pm.ideaboard.entity.StockBooth;
import com.pm.ideaboard.entity.StockComment;
import com.pm.ideaboard.repository.StockBoothRepository;
import com.pm.ideaboard.repository.StockCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IdeaBoardService {

    private final StockBoothRepository stockBoothRepository;
    private final StockCommentRepository stockCommentRepository;

    @Transactional(readOnly = true)
    public IdeaBoardResponse getBoard(Long boothId) {
        StockBooth booth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        List<StockComment> comments = stockCommentRepository
                .findByStockBoothIdOrderByCreatedAtDesc(boothId);

        List<CommentResponse> commentResponses = comments.stream()
                .map(c -> CommentResponse.builder()
                        .id(c.getId())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .userCompany(c.getUser().getCompany())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();

        return IdeaBoardResponse.builder()
                .boothId(booth.getId())
                .boothName(booth.getName())
                .logoEmoji(booth.getLogoEmoji())
                .themeColor(booth.getThemeColor())
                .category(booth.getCategory())
                .comments(commentResponses)
                .build();
    }
}
