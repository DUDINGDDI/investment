package com.pm.ideaboard.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stock_booths")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StockBooth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "logo_emoji", length = 10)
    private String logoEmoji;

    @Column(name = "theme_color", length = 7)
    private String themeColor;
}
