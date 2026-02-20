package com.pm.investment.controller;

import com.pm.investment.dto.InvestRequest;
import com.pm.investment.dto.InvestmentHistoryResponse;
import com.pm.investment.dto.InvestmentResponse;
import com.pm.investment.service.InvestmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentService investmentService;

    @PostMapping("/invest")
    public ResponseEntity<Map<String, String>> invest(
            @Valid @RequestBody InvestRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        investmentService.invest(userId, request.getBoothId(), request.getAmount());
        return ResponseEntity.ok(Map.of("message", "투자가 완료되었습니다"));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Map<String, String>> withdraw(
            @Valid @RequestBody InvestRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        investmentService.withdraw(userId, request.getBoothId(), request.getAmount());
        return ResponseEntity.ok(Map.of("message", "철회가 완료되었습니다"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<InvestmentResponse>> getMyInvestments(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(investmentService.getMyInvestments(userId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<InvestmentHistoryResponse>> getMyHistory(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(investmentService.getMyHistory(userId));
    }
}
