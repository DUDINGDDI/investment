package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_price_history")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_booth_id", nullable = false)
    private StockBooth stockBooth;

    @Column(nullable = false)
    private Long price;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public StockPriceHistory(StockBooth stockBooth, Long price) {
        this.stockBooth = stockBooth;
        this.price = price;
    }
}
