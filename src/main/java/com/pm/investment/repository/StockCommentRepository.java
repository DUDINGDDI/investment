package com.pm.investment.repository;

import com.pm.investment.entity.StockComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockCommentRepository extends JpaRepository<StockComment, Long> {

    List<StockComment> findByStockBoothIdOrderByCreatedAtDesc(Long stockBoothId);

    long countByUserId(Long userId);
}
