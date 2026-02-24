package com.pm.investment.repository;

import com.pm.investment.entity.StockPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, Long> {

    List<StockPriceHistory> findByBoothIdOrderByCreatedAtAsc(Long boothId);
}
