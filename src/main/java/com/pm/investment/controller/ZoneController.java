package com.pm.investment.controller;

import com.pm.investment.dto.ZoneResponse;
import com.pm.investment.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @GetMapping
    public ResponseEntity<List<ZoneResponse>> getAllZones() {
        return ResponseEntity.ok(zoneService.getAllZones());
    }

    @GetMapping("/{zoneCode}")
    public ResponseEntity<ZoneResponse> getZoneByCode(@PathVariable String zoneCode) {
        return ResponseEntity.ok(zoneService.getZoneByCode(zoneCode));
    }
}
