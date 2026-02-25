package com.pm.investment.service;

import com.pm.investment.dto.StockPriceHistoryResponse;
import com.pm.investment.entity.StockBooth;
import com.pm.investment.entity.StockPrice;
import com.pm.investment.entity.StockPriceHistory;
import com.pm.investment.repository.StockBoothRepository;
import com.pm.investment.repository.StockPriceHistoryRepository;
import com.pm.investment.repository.StockPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockPriceService {

    private final StockBoothRepository stockBoothRepository;
    private final StockPriceRepository stockPriceRepository;
    private final StockPriceHistoryRepository stockPriceHistoryRepository;

    @Transactional(readOnly = true)
    public StockPriceHistoryResponse getPriceHistory(Long boothId) {
        StockBooth stockBooth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        Long currentPrice = stockPriceRepository.findByStockBoothId(boothId)
                .map(StockPrice::getCurrentPrice)
                .orElse(1_000_000_000L);

        List<StockPriceHistoryResponse.PricePoint> pricePoints =
                stockPriceHistoryRepository.findByStockBoothIdOrderByCreatedAtAsc(boothId)
                        .stream()
                        .map(h -> StockPriceHistoryResponse.PricePoint.builder()
                                .price(h.getPrice())
                                .changedAt(h.getCreatedAt())
                                .build())
                        .toList();

        return StockPriceHistoryResponse.builder()
                .boothId(boothId)
                .boothName(stockBooth.getName())
                .currentPrice(currentPrice)
                .priceHistory(pricePoints)
                .build();
    }

    @Transactional
    public void changePrice(Long boothId, Long newPrice) {
        StockBooth stockBooth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        StockPrice stockPrice = stockPriceRepository.findByStockBoothId(boothId)
                .orElseThrow(() -> new IllegalArgumentException("해당 부스의 가격 정보를 찾을 수 없습니다"));

        stockPrice.setCurrentPrice(newPrice);

        stockPriceHistoryRepository.save(new StockPriceHistory(stockBooth, newPrice));

        // TODO: SSE 또는 WebSocket으로 가격 변동 실시간 브로드캐스트
    }
}
