package com.pm.investment.controller;

import com.pm.investment.dto.ReportEligibilityResponse;
import com.pm.investment.dto.ReportResponse;
import com.pm.investment.dto.ShareReportRequest;
import com.pm.investment.dto.SharedReportResponse;
import com.pm.investment.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/eligibility")
    public ResponseEntity<ReportEligibilityResponse> checkEligibility(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(reportService.checkEligibility(userId));
    }

    @GetMapping
    public ResponseEntity<ReportResponse> getReport(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(reportService.generateReport(userId));
    }

    @PostMapping("/share")
    public ResponseEntity<Map<String, String>> shareReport(
            HttpServletRequest request,
            @Valid @RequestBody ShareReportRequest body) {
        Long userId = (Long) request.getAttribute("userId");
        reportService.shareReport(userId, body.getVision());
        return ResponseEntity.ok(Map.of("message", "리포트가 공유되었습니다"));
    }

    @GetMapping("/share/status")
    public ResponseEntity<Map<String, Boolean>> getShareStatus(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(Map.of("shared", reportService.isShared(userId)));
    }

    @GetMapping("/shared")
    public ResponseEntity<List<SharedReportResponse>> getSharedReports() {
        return ResponseEntity.ok(reportService.getSharedReports());
    }
}
