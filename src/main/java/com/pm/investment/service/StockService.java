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

    private static final long TRADE_UNIT = 100_000_000L;

    private final StockAccountRepository stockAccountRepository;
    private final BoothRepository boothRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final StockTradeHistoryRepository stockTradeHistoryRepository;
    private final StockPriceRepository stockPriceRepository;
    private final BoothVisitRepository boothVisitRepository;
    private final StockRatingRepository stockRatingRepository;

    @Transactional
    public void buy(Long userId, Long boothId, Long amount) {
        validateAmount(amount);
        validateVisitAndRating(userId, boothId);

        StockAccount account = stockAccountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다"));

        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        if (account.getBalance() < amount) {
            throw new IllegalStateException("보유 잔액이 부족합니다");
        }

        StockHolding holding = stockHoldingRepository.findByUserIdAndBoothIdWithLock(userId, boothId)
                .orElseGet(() -> {
                    StockHolding newHolding = new StockHolding(account.getUser(), booth);
                    return stockHoldingRepository.save(newHolding);
                });

        Long currentPrice = stockPriceRepository.findByBoothId(boothId)
                .map(StockPrice::getCurrentPrice)
                .orElse(1_000_000_000L);

        account.setBalance(account.getBalance() - amount);
        holding.setAmount(holding.getAmount() + amount);

        stockTradeHistoryRepository.save(
                new StockTradeHistory(account.getUser(), booth, StockTradeHistory.TradeType.BUY, amount, currentPrice, account.getBalance())
        );
    }

    @Transactional
    public void sell(Long userId, Long boothId, Long amount) {
        validateAmount(amount);
        validateVisitAndRating(userId, boothId);

        StockAccount account = stockAccountRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("주식 계좌를 찾을 수 없습니다"));

        Booth booth = boothRepository.findById(boothId)
                .orElseThrow(() -> new IllegalArgumentException("부스를 찾을 수 없습니다"));

        StockHolding holding = stockHoldingRepository.findByUserIdAndBoothIdWithLock(userId, boothId)
                .orElseThrow(() -> new IllegalStateException("해당 부스에 보유한 주식이 없습니다"));

        if (holding.getAmount() < amount) {
            throw new IllegalStateException("매도 금액이 보유 금액을 초과합니다");
        }

        Long currentPrice = stockPriceRepository.findByBoothId(boothId)
                .map(StockPrice::getCurrentPrice)
                .orElse(1_000_000_000L);

        account.setBalance(account.getBalance() + amount);
        holding.setAmount(holding.getAmount() - amount);

        stockTradeHistoryRepository.save(
                new StockTradeHistory(account.getUser(), booth, StockTradeHistory.TradeType.SELL, amount, currentPrice, account.getBalance())
        );
    }

    @Transactional(readOnly = true)
    public List<StockHoldingResponse> getMyHoldings(Long userId) {
        return stockHoldingRepository.findByUserIdAndAmountGreaterThan(userId, 0L)
                .stream()
                .map(holding -> {
                    Long currentPrice = stockPriceRepository.findByBoothId(holding.getBooth().getId())
                            .map(StockPrice::getCurrentPrice)
                            .orElse(1_000_000_000L);
                    return StockHoldingResponse.builder()
                            .boothId(holding.getBooth().getId())
                            .boothName(holding.getBooth().getName())
                            .logoEmoji(holding.getBooth().getLogoEmoji())
                            .themeColor(holding.getBooth().getThemeColor())
                            .amount(holding.getAmount())
                            .currentPrice(currentPrice)
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
                        .boothId(h.getBooth().getId())
                        .boothName(h.getBooth().getName())
                        .logoEmoji(h.getBooth().getLogoEmoji())
                        .themeColor(h.getBooth().getThemeColor())
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
        return stockTradeHistoryRepository.findByUserIdAndBoothIdOrderByCreatedAtDesc(userId, boothId)
                .stream()
                .map(h -> StockTradeHistoryResponse.builder()
                        .id(h.getId())
                        .boothId(h.getBooth().getId())
                        .boothName(h.getBooth().getName())
                        .logoEmoji(h.getBooth().getLogoEmoji())
                        .themeColor(h.getBooth().getThemeColor())
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
        if (!boothVisitRepository.existsByUserIdAndBoothId(userId, boothId)) {
            throw new IllegalStateException("부스를 방문한 후에 거래할 수 있습니다");
        }
        if (!stockRatingRepository.existsByUserIdAndBoothId(userId, boothId)) {
            throw new IllegalStateException("부스 평가를 완료한 후에 거래할 수 있습니다");
        }
    }

    private void validateAmount(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        }
        if (amount % TRADE_UNIT != 0) {
            throw new IllegalArgumentException("금액은 1억원 단위여야 합니다");
        }
    }
}
