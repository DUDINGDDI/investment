package com.pm.investment.service;

import com.pm.investment.dto.ZoneResponse;
import com.pm.investment.dto.ZoneResponse.ZoneBoothResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.entity.Zone;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final StockBoothRepository stockBoothRepository;

    @Transactional(readOnly = true)
    public List<ZoneResponse> getAllZones() {
        List<Zone> zones = zoneRepository.findAllByOrderByDisplayOrderAsc();

        return zones.stream().map(zone -> {
            List<StockBooth> booths = stockBoothRepository.findByZoneIdOrderByDisplayOrderAsc(zone.getId());

            List<ZoneBoothResponse> boothResponses = booths.stream().map(booth ->
                    ZoneBoothResponse.builder()
                            .id(booth.getId())
                            .name(booth.getName())
                            .category(booth.getCategory())
                            .shortDescription(booth.getShortDescription())
                            .logoEmoji(booth.getLogoEmoji())
                            .themeColor(booth.getThemeColor())
                            .build()
            ).toList();

            return ZoneResponse.builder()
                    .id(zone.getId())
                    .zoneCode(zone.getZoneCode())
                    .name(zone.getName())
                    .floorInfo(zone.getFloorInfo())
                    .displayOrder(zone.getDisplayOrder())
                    .booths(boothResponses)
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public ZoneResponse getZoneByCode(String zoneCode) {
        Zone zone = zoneRepository.findByZoneCode(zoneCode)
                .orElseThrow(() -> new IllegalArgumentException("구역을 찾을 수 없습니다"));

        List<StockBooth> booths = stockBoothRepository.findByZoneIdOrderByDisplayOrderAsc(zone.getId());

        List<ZoneBoothResponse> boothResponses = booths.stream().map(booth ->
                ZoneBoothResponse.builder()
                        .id(booth.getId())
                        .name(booth.getName())
                        .category(booth.getCategory())
                        .shortDescription(booth.getShortDescription())
                        .logoEmoji(booth.getLogoEmoji())
                        .themeColor(booth.getThemeColor())
                        .build()
        ).toList();

        return ZoneResponse.builder()
                .id(zone.getId())
                .zoneCode(zone.getZoneCode())
                .name(zone.getName())
                .floorInfo(zone.getFloorInfo())
                .displayOrder(zone.getDisplayOrder())
                .booths(boothResponses)
                .build();
    }
}
