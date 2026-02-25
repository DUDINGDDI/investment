package com.pm.investment.repository;

import com.pm.investment.entity.BoothVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BoothVisitRepository extends JpaRepository<BoothVisit, Long> {

    boolean existsByUserIdAndBoothId(Long userId, Long boothId);

    List<BoothVisit> findByUserIdOrderByVisitedAtDesc(Long userId);

    long countByBoothId(Long boothId);

    @Query("SELECT bv.booth.id FROM BoothVisit bv WHERE bv.user.id = :userId")
    List<Long> findVisitedBoothIdsByUserId(@Param("userId") Long userId);
}
