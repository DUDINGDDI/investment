package com.pm.investment.service;

import com.pm.investment.dto.StockAccountResponse;
import com.pm.investment.dto.StockHoldingResponse;
import com.pm.investment.dto.StockTradeHistoryResponse;
import com.pm.investment.entity.*;
import com.pm.investment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private static final long TRADE_UNIT = 10_000_000L;

    private final StockAccountRepository stockAccountRepository;
    private final StockBoothRepository stockBoothRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final StockTradeHistoryRepository stockTradeHistoryRepository;
    private final StockPriceRepository stockPriceRepository;
    private final StockBoothVisitRepository stockBoothVisitRepository;
    private final StockRatingRepository stockRatingRepository;

    @Transactional
    public void buy(Long userId, Long boothId, Long amount) {
        validateAmount(amount);
        validateVisitAndRating(userId, boothId);

        StockAccount account = stockAccountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다"));

        StockBooth stockBooth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        if (account.getBalance() < amount) {
            throw new IllegalStateException("보유 잔액이 부족합니다");
        }

        StockHolding holding = stockHoldingRepository.findByUserIdAndStockBoothIdWithLock(userId, boothId)
                .orElseGet(() -> {
                    StockHolding newHolding = new StockHolding(account.getUser(), stockBooth);
                    return stockHoldingRepository.save(newHolding);
                });

        long maxPerBooth = 40_000_000L;
        if (holding.getAmount() + amount > maxPerBooth) {
            throw new IllegalStateException("부스당 최대 투자 금액은 4,000만원입니다");
        }

        account.setBalance(account.getBalance() - amount);
        holding.setAmount(holding.getAmount() + amount);

        stockTradeHistoryRepository.save(
                new StockTradeHistory(account.getUser(), stockBooth, StockTradeHistory.TradeType.BUY, amount, 0L, account.getBalance())
        );
    }

    @Transactional
    public void sell(Long userId, Long boothId, Long amount) {
        validateAmount(amount);
        validateVisitAndRating(userId, boothId);

        StockAccount account = stockAccountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다"));

        StockBooth stockBooth = stockBoothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        StockHolding holding = stockHoldingRepository.findByUserIdAndStockBoothIdWithLock(userId, boothId)
                .orElseThrow(() -> new IllegalStateException("해당 부스에 보유한 투자금이 없습니다"));

        if (holding.getAmount() < amount) {
            throw new IllegalStateException("철회 금액이 투자 금액을 초과합니다");
        }

        account.setBalance(account.getBalance() + amount);
        holding.setAmount(holding.getAmount() - amount);

        stockTradeHistoryRepository.save(
                new StockTradeHistory(account.getUser(), stockBooth, StockTradeHistory.TradeType.SELL, amount, 0L, account.getBalance())
        );
    }

    @Transactional(readOnly = true)
    public List<StockHoldingResponse> getMyHoldings(Long userId) {
        return stockHoldingRepository.findByUserIdAndAmountGreaterThan(userId, 0L)
                .stream()
                .map(holding -> {
                    return StockHoldingResponse.builder()
                            .boothId(holding.getStockBooth().getId())
                            .boothName(holding.getStockBooth().getName())
                            .logoEmoji(holding.getStockBooth().getLogoEmoji())
                            .themeColor(holding.getStockBooth().getThemeColor())
                            .amount(holding.getAmount())
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockTradeHistoryResponse> getMyTradeHistory(Long userId) {
        return stockTradeHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(h -> StockTradeHistoryResponse.builder()
                        .id(h.getId())
                        .boothId(h.getStockBooth().getId())
                        .boothName(h.getStockBooth().getName())
                        .logoEmoji(h.getStockBooth().getLogoEmoji())
                        .themeColor(h.getStockBooth().getThemeColor())
                        .type(h.getType().name())
                        .amount(h.getAmount())
                        .priceAtTrade(h.getPriceAtTrade())
                        .balanceAfter(h.getBalanceAfter())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockTradeHistoryResponse> getMyTradeHistoryByBooth(Long userId, Long boothId) {
        return stockTradeHistoryRepository.findByUserIdAndStockBoothIdOrderByCreatedAtDesc(userId, boothId)
                .stream()
                .map(h -> StockTradeHistoryResponse.builder()
                        .id(h.getId())
                        .boothId(h.getStockBooth().getId())
                        .boothName(h.getStockBooth().getName())
                        .logoEmoji(h.getStockBooth().getLogoEmoji())
                        .themeColor(h.getStockBooth().getThemeColor())
                        .type(h.getType().name())
                        .amount(h.getAmount())
                        .priceAtTrade(h.getPriceAtTrade())
                        .balanceAfter(h.getBalanceAfter())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public StockAccountResponse getMyAccount(Long userId) {
        StockAccount account = stockAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다"));
        return StockAccountResponse.builder()
                .userId(userId)
                .balance(account.getBalance())
                .build();
    }

    private void validateVisitAndRating(Long userId, Long boothId) {
        if (!stockBoothVisitRepository.existsByUserIdAndStockBoothId(userId, boothId)) {
            throw new IllegalStateException("부스를 방문한 후에 거래할 수 있습니다");
        }
        if (!stockRatingRepository.existsByUserIdAndStockBoothId(userId, boothId)) {
            throw new IllegalStateException("부스 평가를 완료한 후에 거래할 수 있습니다");
        }
    }

    private void validateAmount(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        }
        if (amount % TRADE_UNIT != 0) {
            throw new IllegalArgumentException("금액은 10,000,000원 단위여야 합니다");
        }
    }
}
