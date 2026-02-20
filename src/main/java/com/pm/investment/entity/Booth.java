package com.pm.investment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "booths")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Booth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 200)
    private String shortDescription;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "logo_emoji", length = 10)
    private String logoEmoji;

    @Column(name = "theme_color", length = 7)
    private String themeColor;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
