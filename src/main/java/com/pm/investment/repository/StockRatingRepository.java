package com.pm.investment.repository;

import com.pm.investment.entity.StockRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockRatingRepository extends JpaRepository<StockRating, Long> {

    Optional<StockRating> findByUserIdAndBoothId(Long userId, Long boothId);

    boolean existsByUserIdAndBoothId(Long userId, Long boothId);

    long countByUserIdAndReviewIsNotNull(Long userId);

    List<StockRating> findByBoothIdAndReviewIsNotNullOrderByUpdatedAtDesc(Long boothId);

    @Query("SELECT r.booth.id, " +
           "COUNT(r), " +
           "SUM(r.scoreFirst + r.scoreBest + r.scoreDifferent + r.scoreNumberOne + r.scoreGap + r.scoreGlobal), " +
           "AVG(r.scoreFirst), AVG(r.scoreBest), AVG(r.scoreDifferent), " +
           "AVG(r.scoreNumberOne), AVG(r.scoreGap), AVG(r.scoreGlobal) " +
           "FROM StockRating r GROUP BY r.booth.id")
    List<Object[]> getBoothRatingAggregates();
}
