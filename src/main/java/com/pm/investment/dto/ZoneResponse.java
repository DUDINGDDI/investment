package com.pm.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ZoneResponse {
    private Long id;
    private String zoneCode;
    private String name;
    private String floorInfo;
    private Integer displayOrder;
    private List<ZoneBoothResponse> booths;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ZoneBoothResponse {
        private Long id;
        private String name;
        private String category;
        private String shortDescription;
        private String logoEmoji;
        private String themeColor;
    }
}
