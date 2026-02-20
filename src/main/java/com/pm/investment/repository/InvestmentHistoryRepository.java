package com.pm.investment.repository;

import com.pm.investment.entity.InvestmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestmentHistoryRepository extends JpaRepository<InvestmentHistory, Long> {

    List<InvestmentHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
