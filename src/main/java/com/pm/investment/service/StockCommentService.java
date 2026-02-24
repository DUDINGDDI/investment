package com.pm.investment.service;

import com.pm.investment.dto.StockCommentResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.entity.StockComment;
import com.pm.investment.entity.User;
import com.pm.investment.repository.BoothRepository;
import com.pm.investment.repository.StockCommentRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockCommentService {

    private final StockCommentRepository stockCommentRepository;
    private final UserRepository userRepository;
    private final BoothRepository boothRepository;

    @Transactional(readOnly = true)
    public List<StockCommentResponse> getComments(Long boothId) {
        return stockCommentRepository.findByBoothIdOrderByCreatedAtDesc(boothId)
                .stream()
                .map(c -> StockCommentResponse.builder()
                        .id(c.getId())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public StockCommentResponse addComment(Long userId, Long boothId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다"));

        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        StockComment comment = new StockComment(user, booth, content);
        stockCommentRepository.save(comment);

        return StockCommentResponse.builder()
                .id(comment.getId())
                .userId(user.getId())
                .userName(user.getName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
