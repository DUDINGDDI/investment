package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_ratings", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_booth_rating", columnNames = {"user_id", "stock_booth_id"})
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_booth_id", nullable = false)
    private StockBooth stockBooth;

    @Column(name = "score_first", nullable = false)
    private Integer scoreFirst;

    @Column(name = "score_best", nullable = false)
    private Integer scoreBest;

    @Column(name = "score_different", nullable = false)
    private Integer scoreDifferent;

    @Column(name = "score_number_one", nullable = false)
    private Integer scoreNumberOne;

    @Column(name = "score_gap", nullable = false)
    private Integer scoreGap;

    @Column(name = "score_global", nullable = false)
    private Integer scoreGlobal;

    @Column(length = 500)
    private String review;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public StockRating(User user, StockBooth stockBooth, Integer scoreFirst, Integer scoreBest,
                       Integer scoreDifferent, Integer scoreNumberOne,
                       Integer scoreGap, Integer scoreGlobal, String review) {
        this.user = user;
        this.stockBooth = stockBooth;
        this.scoreFirst = scoreFirst;
        this.scoreBest = scoreBest;
        this.scoreDifferent = scoreDifferent;
        this.scoreNumberOne = scoreNumberOne;
        this.scoreGap = scoreGap;
        this.scoreGlobal = scoreGlobal;
        this.review = review;
    }

    public int getTotalScore() {
        return scoreFirst + scoreBest + scoreDifferent + scoreNumberOne + scoreGap + scoreGlobal;
    }
}
