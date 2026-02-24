package com.pm.investment.controller;

import com.pm.investment.dto.BoothVisitResponse;
import com.pm.investment.dto.VisitRequest;
import com.pm.investment.service.BoothVisitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final BoothVisitService boothVisitService;

    @PostMapping
    public ResponseEntity<BoothVisitResponse> visit(
            @Valid @RequestBody VisitRequest request,
            HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(boothVisitService.visit(userId, request.getBoothUuid()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BoothVisitResponse>> getMyVisits(HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        return ResponseEntity.ok(boothVisitService.getMyVisits(userId));
    }
}
