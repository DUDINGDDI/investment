package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shared_reports", uniqueConstraints = {
        @UniqueConstraint(name = "uk_shared_report_user", columnNames = {"user_id"})
})
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SharedReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String vision;

    @Column(name = "tendency_type", nullable = false)
    private String tendencyType;

    @Column(name = "tendency_name", nullable = false)
    private String tendencyName;

    @Column(name = "tendency_emoji", nullable = false)
    private String tendencyEmoji;

    @Column(name = "tendency_one_liner", nullable = false)
    private String tendencyOneLiner;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
