package com.pm.investment.repository;

import com.pm.investment.entity.StockTradeHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTradeHistoryRepository extends JpaRepository<StockTradeHistory, Long> {

    List<StockTradeHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<StockTradeHistory> findByUserIdAndStockBoothIdOrderByCreatedAtDesc(Long userId, Long stockBoothId);
}
