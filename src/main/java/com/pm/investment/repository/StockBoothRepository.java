package com.pm.investment.repository;

import com.pm.investment.entity.StockBooth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockBoothRepository extends JpaRepository<StockBooth, Long> {

    Optional<StockBooth> findByBoothUuid(String boothUuid);

    List<StockBooth> findAllByOrderByDisplayOrderAsc();

    @Query("SELECT sb FROM StockBooth sb LEFT JOIN FETCH sb.zone ORDER BY sb.displayOrder ASC")
    List<StockBooth> findAllWithZoneOrderByDisplayOrderAsc();

    List<StockBooth> findByZoneIdOrderByDisplayOrderAsc(Long zoneId);

    Optional<StockBooth> findByName(String name);
}
