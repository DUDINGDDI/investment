package com.pm.investment.repository;

import com.pm.investment.entity.StockHolding;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockHoldingRepository extends JpaRepository<StockHolding, Long> {

    Optional<StockHolding> findByUserIdAndStockBoothId(Long userId, Long stockBoothId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT sh FROM StockHolding sh WHERE sh.user.id = :userId AND sh.stockBooth.id = :stockBoothId")
    Optional<StockHolding> findByUserIdAndStockBoothIdWithLock(@Param("userId") Long userId, @Param("stockBoothId") Long stockBoothId);

    List<StockHolding> findByUserIdAndAmountGreaterThan(Long userId, Long amount);

    @Query("SELECT COALESCE(SUM(sh.amount), 0) FROM StockHolding sh WHERE sh.stockBooth.id = :stockBoothId")
    Long getTotalHoldingByStockBoothId(@Param("stockBoothId") Long stockBoothId);

    @Query("SELECT sh.stockBooth.id, COALESCE(SUM(sh.amount), 0) FROM StockHolding sh WHERE sh.amount > 0 GROUP BY sh.stockBooth.id")
    List<Object[]> getTotalHoldingByAllBooths();

    @Query("SELECT sh.stockBooth.id, sh.amount FROM StockHolding sh WHERE sh.user.id = :userId AND sh.amount > 0")
    List<Object[]> getMyHoldingAmounts(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(sh) FROM StockHolding sh WHERE sh.stockBooth.id = :stockBoothId AND sh.amount > 0")
    Long getHolderCountByStockBoothId(@Param("stockBoothId") Long stockBoothId);
}
