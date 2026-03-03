package com.pm.investment.repository;

import com.pm.investment.entity.SharedReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SharedReportRepository extends JpaRepository<SharedReport, Long> {

    boolean existsByUserId(Long userId);

    List<SharedReport> findAllByOrderByCreatedAtDesc();
}
