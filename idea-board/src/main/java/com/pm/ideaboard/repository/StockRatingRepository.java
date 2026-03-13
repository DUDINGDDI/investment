package com.pm.ideaboard.repository;

import com.pm.ideaboard.entity.StockRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockRatingRepository extends JpaRepository<StockRating, Long> {
    List<StockRating> findByStockBoothIdAndReviewIsNotNullOrderByUpdatedAtDesc(Long stockBoothId);
}
