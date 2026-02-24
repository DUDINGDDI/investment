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

    Optional<StockHolding> findByUserIdAndBoothId(Long userId, Long boothId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT sh FROM StockHolding sh WHERE sh.user.id = :userId AND sh.booth.id = :boothId")
    Optional<StockHolding> findByUserIdAndBoothIdWithLock(@Param("userId") Long userId, @Param("boothId") Long boothId);

    List<StockHolding> findByUserIdAndAmountGreaterThan(Long userId, Long amount);

    @Query("SELECT COALESCE(SUM(sh.amount), 0) FROM StockHolding sh WHERE sh.booth.id = :boothId")
    Long getTotalHoldingByBoothId(@Param("boothId") Long boothId);

    @Query("SELECT COUNT(sh) FROM StockHolding sh WHERE sh.booth.id = :boothId AND sh.amount > 0")
    Long getHolderCountByBoothId(@Param("boothId") Long boothId);
}
