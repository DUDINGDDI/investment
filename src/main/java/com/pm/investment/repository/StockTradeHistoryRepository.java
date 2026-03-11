package com.pm.investment.repository;

import com.pm.investment.entity.StockTradeHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockTradeHistoryRepository extends JpaRepository<StockTradeHistory, Long> {

    List<StockTradeHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<StockTradeHistory> findByUserIdAndStockBoothIdOrderByCreatedAtDesc(Long userId, Long stockBoothId);

    List<StockTradeHistory> findAllByOrderByCreatedAtAsc();

    long countByUserId(Long userId);

    long countByUserIdAndType(Long userId, StockTradeHistory.TradeType type);

    @Query("SELECT sth FROM StockTradeHistory sth WHERE sth.user.isRookie = true ORDER BY sth.createdAt DESC LIMIT 1")
    Optional<StockTradeHistory> findLatestByRookieUser();

    @Query("SELECT sth.user.id, MAX(sth.createdAt) FROM StockTradeHistory sth WHERE sth.user.isRookie = true GROUP BY sth.user.id")
    List<Object[]> getLatestTimeByRookieUser();
}
