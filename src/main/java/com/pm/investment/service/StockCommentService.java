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
    private final MissionService missionService;

    @Transactional(readOnly = true)
    public List<StockCommentResponse> getComments(Long boothId, String tag) {
        List<StockComment> comments = (tag == null || tag.isBlank())
                ? stockCommentRepository.findByBoothIdOrderByCreatedAtDesc(boothId)
                : stockCommentRepository.findByBoothIdAndTagOrderByCreatedAtDesc(boothId, tag);

        return comments.stream()
                .map(c -> StockCommentResponse.builder()
                        .id(c.getId())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .content(c.getContent())
                        .tag(c.getTag())
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public StockCommentResponse addComment(Long userId, Long boothId, String content, String tag) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다"));

        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        StockComment comment = new StockComment(user, booth, content, tag);
        stockCommentRepository.save(comment);

        // renew 미션: 댓글 총 수를 progress로 반영
        long commentCount = stockCommentRepository.countByUserId(userId);
        missionService.checkAndUpdateMission(userId, "renew", (int) commentCount);

        return StockCommentResponse.builder()
                .id(comment.getId())
                .userId(user.getId())
                .userName(user.getName())
                .content(comment.getContent())
                .tag(comment.getTag())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
