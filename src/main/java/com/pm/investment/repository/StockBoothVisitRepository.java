package com.pm.investment.repository;

import com.pm.investment.entity.StockBoothVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockBoothVisitRepository extends JpaRepository<StockBoothVisit, Long> {

    boolean existsByUserIdAndStockBoothId(Long userId, Long stockBoothId);

    List<StockBoothVisit> findByUserIdOrderByVisitedAtDesc(Long userId);

    long countByStockBoothId(Long stockBoothId);
}
