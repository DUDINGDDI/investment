package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "booth_visits", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_booth_visit", columnNames = {"user_id", "booth_id"})
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoothVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booth_id", nullable = false)
    private Booth booth;

    @Column(name = "visited_at", updatable = false)
    private LocalDateTime visitedAt;

    @PrePersist
    protected void onCreate() {
        visitedAt = LocalDateTime.now();
    }

    public BoothVisit(User user, Booth booth) {
        this.user = user;
        this.booth = booth;
    }
}
