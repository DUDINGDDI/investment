package com.pm.investment.service;

import com.pm.investment.dto.StockCommentResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.entity.StockComment;
import com.pm.investment.entity.User;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.StockBoothVisitRepository;
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
    private final StockBoothRepository stockBoothRepository;
    private final StockBoothVisitRepository stockBoothVisitRepository;
    private final MissionService missionService;
    private final IdeaBoardNotifier ideaBoardNotifier;

    @Transactional(readOnly = true)
    public List<StockCommentResponse> getComments(Long boothId) {
        List<StockComment> comments = stockCommentRepository.findByStockBoothIdOrderByCreatedAtDesc(boothId);

        return comments.stream()
                .map(c -> StockCommentResponse.builder()
                        .id(c.getId())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .userCompany(c.getUser().getCompany())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public StockCommentResponse addComment(Long userId, Long boothId, String content) {
        if (!stockBoothVisitRepository.existsByUserIdAndStockBoothId(userId, boothId)) {
            throw new IllegalStateException("부스를 방문한 후에 제안을 남길 수 있습니다");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다"));

        StockBooth stockBooth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        StockComment comment = new StockComment(user, stockBooth, content);
        stockCommentRepository.save(comment);

        // renew 미션: 댓글을 남긴 서로 다른 부스 수를 progress로 반영
        long distinctBoothCount = stockCommentRepository.countDistinctBoothsByUserId(userId);
        missionService.checkAndUpdateMission(userId, "renew", (int) distinctBoothCount);

        StockCommentResponse response = StockCommentResponse.builder()
                .id(comment.getId())
                .userId(user.getId())
                .userName(user.getName())
                .userCompany(user.getCompany())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();

        // idea-board 서비스에 비동기 알림
        ideaBoardNotifier.notifyNewComment(boothId, response);

        return response;
    }
}
