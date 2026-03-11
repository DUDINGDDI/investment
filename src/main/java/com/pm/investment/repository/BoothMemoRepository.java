package com.pm.investment.repository;

import com.pm.investment.entity.BoothMemo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoothMemoRepository extends JpaRepository<BoothMemo, Long> {

    Optional<BoothMemo> findByUserIdAndBoothId(Long userId, Long boothId);

    @Query("SELECT m FROM BoothMemo m JOIN FETCH m.user JOIN FETCH m.booth WHERE m.user.id IN :userIds")
    List<BoothMemo> findAllByUserIdIn(@Param("userIds") List<Long> userIds);

    void deleteByUserIdAndBoothId(Long userId, Long boothId);
}
