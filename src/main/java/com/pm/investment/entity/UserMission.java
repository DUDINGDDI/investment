package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_missions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "mission_id"})
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "mission_id", nullable = false, length = 30)
    private String missionId;

    @Column(nullable = false)
    private Integer progress = 0;

    @Column(nullable = false)
    private Integer target = 0;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

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

    public UserMission(User user, String missionId, int target) {
        this.user = user;
        this.missionId = missionId;
        this.progress = 0;
        this.target = target;
        this.isCompleted = false;
    }

    public double getAchievementRate() {
        if (isCompleted) return 100.0;
        if (target <= 0) return 0.0;
        return Math.min((double) progress / target * 100.0, 100.0);
    }
}
