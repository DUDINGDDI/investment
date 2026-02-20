package com.pm.investment.controller;

import com.pm.investment.dto.BoothResponse;
import com.pm.investment.service.BoothService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booths")
@RequiredArgsConstructor
public class BoothController {

    private final BoothService boothService;

    @GetMapping
    public ResponseEntity<List<BoothResponse>> getAllBooths(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boothService.getAllBooths(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoothResponse> getBooth(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boothService.getBooth(id, userId));
    }
}
