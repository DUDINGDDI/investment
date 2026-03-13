package com.pm.investment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pm.investment.dto.CombinedInvestmentResponse;
import com.pm.investment.dto.ExecutiveInvestmentResponse;
import com.pm.investment.dto.RookieInvestmentResponse;
import com.pm.investment.entity.ReportSnapshot;
import com.pm.investment.repository.ReportSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportSnapshotService {

    private final ReportSnapshotRepository snapshotRepository;
    private final RankingService rankingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Map<String, String> generateAllSnapshots() {
        generateSnapshot("EXECUTIVE", rankingService.getExecutiveInvestments());
        generateSnapshot("ROOKIE", rankingService.getRookieInvestments());
        generateSnapshot("COMBINED", rankingService.getCombinedInvestments());
        return Map.of(
                "message", "보고서 3건이 생성되었습니다.",
                "generatedAt", LocalDateTime.now().toString()
        );
    }

    private void generateSnapshot(String type, Object data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            ReportSnapshot snapshot = ReportSnapshot.builder()
                    .reportType(type)
                    .data(json)
                    .build();
            snapshotRepository.save(snapshot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("보고서 직렬화 실패: " + type, e);
        }
    }

    @Transactional(readOnly = true)
    public ExecutiveInvestmentResponse getExecutiveSnapshot() {
        return getSnapshot("EXECUTIVE", ExecutiveInvestmentResponse.class);
    }

    @Transactional(readOnly = true)
    public RookieInvestmentResponse getRookieSnapshot() {
        return getSnapshot("ROOKIE", RookieInvestmentResponse.class);
    }

    @Transactional(readOnly = true)
    public CombinedInvestmentResponse getCombinedSnapshot() {
        return getSnapshot("COMBINED", CombinedInvestmentResponse.class);
    }

    @Transactional(readOnly = true)
    public LocalDateTime getSnapshotCreatedAt(String type) {
        return snapshotRepository.findFirstByReportTypeOrderByCreatedAtDesc(type)
                .map(ReportSnapshot::getCreatedAt)
                .orElse(null);
    }

    private <T> T getSnapshot(String type, Class<T> clazz) {
        ReportSnapshot snapshot = snapshotRepository
                .findFirstByReportTypeOrderByCreatedAtDesc(type)
                .orElseThrow(() -> new IllegalStateException("생성된 보고서가 없습니다. 관리자 페이지에서 보고서를 먼저 생성해주세요."));
        try {
            return objectMapper.readValue(snapshot.getData(), clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("보고서 역직렬화 실패: " + type, e);
        }
    }
}
