package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_prices")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_booth_id", nullable = false, unique = true)
    private StockBooth stockBooth;

    @Column(name = "current_price", nullable = false)
    private Long currentPrice = 1_000_000_000L;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public StockPrice(StockBooth stockBooth) {
        this.stockBooth = stockBooth;
        this.currentPrice = 1_000_000_000L;
    }
}
