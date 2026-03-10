package com.pm.investment.service;

import com.pm.investment.entity.FcmToken;
import com.pm.investment.entity.User;
import com.pm.investment.repository.FcmTokenRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FcmTokenService {

    private final FcmTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;

    @Transactional
    public void registerToken(Long userId, String token) {
        if (fcmTokenRepository.findByUserIdAndToken(userId, token).isPresent()) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        FcmToken fcmToken = FcmToken.builder()
                .user(user)
                .token(token)
                .build();

        fcmTokenRepository.save(fcmToken);
    }

    @Transactional
    public void removeToken(Long userId, String token) {
        fcmTokenRepository.deleteByUserIdAndToken(userId, token);
    }
}
