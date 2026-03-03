package com.pm.investment.repository;

import com.pm.investment.entity.StockComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockCommentRepository extends JpaRepository<StockComment, Long> {

    List<StockComment> findByStockBoothIdOrderByCreatedAtDesc(Long stockBoothId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT sc.stockBooth.id) FROM StockComment sc WHERE sc.user.id = :userId")
    long countDistinctBoothsByUserId(@Param("userId") Long userId);
}
