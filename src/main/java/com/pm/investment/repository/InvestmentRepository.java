package com.pm.investment.repository;

import com.pm.investment.entity.Investment;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    Optional<Investment> findByUserIdAndBoothId(Long userId, Long boothId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Investment i WHERE i.user.id = :userId AND i.booth.id = :boothId")
    Optional<Investment> findByUserIdAndBoothIdWithLock(@Param("userId") Long userId, @Param("boothId") Long boothId);

    List<Investment> findByUserIdAndAmountGreaterThan(Long userId, Long amount);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Investment i WHERE i.booth.id = :boothId")
    Long getTotalInvestmentByBoothId(@Param("boothId") Long boothId);

    @Query("SELECT COUNT(i) FROM Investment i WHERE i.booth.id = :boothId AND i.amount > 0")
    Long getInvestorCountByBoothId(@Param("boothId") Long boothId);

    @Query("SELECT i.booth.id, COALESCE(SUM(i.amount), 0), COUNT(i) FROM Investment i WHERE i.amount > 0 GROUP BY i.booth.id")
    List<Object[]> getInvestmentStatsByBooth();

    @Query("SELECT i.booth.id, i.amount FROM Investment i WHERE i.user.id = :userId AND i.amount > 0")
    List<Object[]> getMyInvestmentAmounts(@Param("userId") Long userId);
}
