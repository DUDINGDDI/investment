package com.pm.investment.repository;

import com.pm.investment.entity.InvestmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvestmentHistoryRepository extends JpaRepository<InvestmentHistory, Long> {

    List<InvestmentHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndType(Long userId, InvestmentHistory.InvestmentType type);

    @Query("SELECT ih.user.id, COUNT(ih) FROM InvestmentHistory ih WHERE ih.type = :type AND ih.user.isRookie = true GROUP BY ih.user.id ORDER BY COUNT(ih) DESC")
    List<Object[]> countByTypeGroupedByRookieUser(@Param("type") InvestmentHistory.InvestmentType type);

    @Query("SELECT ih FROM InvestmentHistory ih WHERE ih.type = :type AND ih.user.isRookie = true ORDER BY ih.createdAt DESC LIMIT 1")
    Optional<InvestmentHistory> findLatestByTypeAndRookie(@Param("type") InvestmentHistory.InvestmentType type);

    @Query("SELECT ih.user.id, MAX(ih.createdAt) FROM InvestmentHistory ih WHERE ih.user.isRookie = true GROUP BY ih.user.id")
    List<Object[]> getLatestTimeByRookieUser();
}
