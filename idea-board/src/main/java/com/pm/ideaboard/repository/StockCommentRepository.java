package com.pm.ideaboard.repository;

import com.pm.ideaboard.entity.StockComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockCommentRepository extends JpaRepository<StockComment, Long> {
    List<StockComment> findByStockBoothIdOrderByCreatedAtDesc(Long stockBoothId);
}
