package com.pm.investment.repository;

import com.pm.investment.entity.BoothVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoothVisitRepository extends JpaRepository<BoothVisit, Long> {

    boolean existsByUserIdAndBoothId(Long userId, Long boothId);

    List<BoothVisit> findByUserIdOrderByVisitedAtDesc(Long userId);

    long countByBoothId(Long boothId);
}
