package com.pm.investment.repository;

import com.pm.investment.entity.StockAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StockAccountRepository extends JpaRepository<StockAccount, Long> {

    Optional<StockAccount> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT sa FROM StockAccount sa WHERE sa.user.id = :userId")
    Optional<StockAccount> findByUserIdWithLock(@Param("userId") Long userId);
}
