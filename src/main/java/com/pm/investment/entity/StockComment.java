package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_comments")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_booth_id", nullable = false)
    private StockBooth stockBooth;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public StockComment(User user, StockBooth stockBooth, String content) {
        this.user = user;
        this.stockBooth = stockBooth;
        this.content = content;
    }
}
