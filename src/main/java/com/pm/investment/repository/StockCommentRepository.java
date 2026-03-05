package com.pm.investment.repository;

import com.pm.investment.entity.StockComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockCommentRepository extends JpaRepository<StockComment, Long> {

    List<StockComment> findByStockBoothIdOrderByCreatedAtDesc(Long stockBoothId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT c.stockBooth.id) FROM StockComment c WHERE c.user.id = :userId AND LENGTH(c.content) >= :minLength")
    long countByUserIdAndContentMinLength(@Param("userId") Long userId, @Param("minLength") int minLength);

    boolean existsByUserIdAndStockBoothId(Long userId, Long stockBoothId);
}
