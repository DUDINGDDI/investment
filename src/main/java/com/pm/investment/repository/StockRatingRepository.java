package com.pm.investment.repository;

import com.pm.investment.entity.StockRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockRatingRepository extends JpaRepository<StockRating, Long> {

    Optional<StockRating> findByUserIdAndStockBoothId(Long userId, Long stockBoothId);

    boolean existsByUserIdAndStockBoothId(Long userId, Long stockBoothId);

    long countByUserIdAndReviewIsNotNull(Long userId);

    List<StockRating> findByStockBoothIdAndReviewIsNotNullOrderByUpdatedAtDesc(Long stockBoothId);

    @Query("SELECT r.stockBooth.id, " +
           "COUNT(r), " +
           "SUM(r.scoreFirst + r.scoreBest + r.scoreDifferent + r.scoreNumberOne + r.scoreGap + r.scoreGlobal), " +
           "AVG(r.scoreFirst), AVG(r.scoreBest), AVG(r.scoreDifferent), " +
           "AVG(r.scoreNumberOne), AVG(r.scoreGap), AVG(r.scoreGlobal) " +
           "FROM StockRating r GROUP BY r.stockBooth.id")
    List<Object[]> getBoothRatingAggregates();
}
