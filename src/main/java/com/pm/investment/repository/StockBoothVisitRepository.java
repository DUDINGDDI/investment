package com.pm.investment.repository;

import com.pm.investment.entity.StockBoothVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StockBoothVisitRepository extends JpaRepository<StockBoothVisit, Long> {

    @Query("SELECT COUNT(bv) FROM StockBoothVisit bv WHERE bv.user.id = :userId AND bv.visitedAt >= :start AND bv.visitedAt < :end")
    long countByUserIdAndVisitedAtBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    boolean existsByUserIdAndStockBoothId(Long userId, Long stockBoothId);

    List<StockBoothVisit> findByUserIdOrderByVisitedAtDesc(Long userId);

    long countByStockBoothId(Long stockBoothId);

    @Query("SELECT bv.stockBooth.id FROM StockBoothVisit bv WHERE bv.user.id = :userId")
    List<Long> findVisitedStockBoothIdsByUserId(@Param("userId") Long userId);
}
