package com.pm.investment.repository;

import com.pm.investment.entity.ReportSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportSnapshotRepository extends JpaRepository<ReportSnapshot, Long> {
    Optional<ReportSnapshot> findFirstByReportTypeOrderByCreatedAtDesc(String reportType);
}
