package com.pm.investment.service;

import com.pm.investment.dto.StockCommentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class IdeaBoardNotifier {

    private static final Logger log = LoggerFactory.getLogger(IdeaBoardNotifier.class);

    private final RestClient restClient;
    private final String internalApiKey;

    public IdeaBoardNotifier(
            @Value("${idea-board.url:}") String ideaBoardUrl,
            @Value("${idea-board.internal-api-key:idea-board-secret-key}") String internalApiKey) {
        this.internalApiKey = internalApiKey;
        this.restClient = RestClient.builder()
                .baseUrl(ideaBoardUrl.isEmpty() ? "http://localhost:8081" : ideaBoardUrl)
                .build();
    }

    @Async
    public void notifyNewComment(Long boothId, StockCommentResponse comment) {
        try {
            restClient.post()
                    .uri("/internal/comments/notify")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .header("Content-Type", "application/json")
                    .body(Map.of(
                            "boothId", boothId,
                            "commentId", comment.getId(),
                            "userId", comment.getUserId(),
                            "userName", comment.getUserName(),
                            "userCompany", comment.getUserCompany() != null ? comment.getUserCompany() : "",
                            "content", comment.getContent(),
                            "createdAt", comment.getCreatedAt().toString()
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("idea-board 알림 전송 실패 (무시): {}", e.getMessage());
        }
    }
}
