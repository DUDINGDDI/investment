package com.pm.investment.repository;

import com.pm.investment.entity.StockBooth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockBoothRepository extends JpaRepository<StockBooth, Long> {

    Optional<StockBooth> findByBoothUuid(String boothUuid);

    List<StockBooth> findAllByOrderByDisplayOrderAsc();

    List<StockBooth> findByZoneIdOrderByDisplayOrderAsc(Long zoneId);
}
