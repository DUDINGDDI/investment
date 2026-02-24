package com.pm.investment.repository;

import com.pm.investment.entity.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

    Optional<StockPrice> findByBoothId(Long boothId);
}
