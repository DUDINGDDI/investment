package com.pm.investment.repository;

import com.pm.investment.entity.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {

    Optional<FcmToken> findByUserIdAndToken(Long userId, String token);

    List<FcmToken> findByUserId(Long userId);

    void deleteByUserIdAndToken(Long userId, String token);
}
