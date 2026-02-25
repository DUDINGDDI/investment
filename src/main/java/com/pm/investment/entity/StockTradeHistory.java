package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_trade_history")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockTradeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_booth_id", nullable = false)
    private StockBooth stockBooth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeType type;

    @Column(nullable = false)
    private Long amount;

    @Column(name = "price_at_trade", nullable = false)
    private Long priceAtTrade;

    @Column(name = "balance_after", nullable = false)
    private Long balanceAfter;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public StockTradeHistory(User user, StockBooth stockBooth, TradeType type, Long amount, Long priceAtTrade, Long balanceAfter) {
        this.user = user;
        this.stockBooth = stockBooth;
        this.type = type;
        this.amount = amount;
        this.priceAtTrade = priceAtTrade;
        this.balanceAfter = balanceAfter;
    }

    public enum TradeType {
        BUY, SELL
    }
}
