package com.pm.investment.service;

import com.pm.investment.dto.LoginRequest;
import com.pm.investment.dto.LoginResponse;
import com.pm.investment.dto.UserResponse;
import com.pm.investment.entity.User;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUniqueCode(request.getUniqueCode())
                .orElseGet(() -> {
                    User newUser = new User(request.getUniqueCode(), request.getName());
                    return userRepository.save(newUser);
                });

        String token = generateToken(user.getId());

        return new LoginResponse(user.getId(), user.getName(), user.getBalance(), token);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
        return new UserResponse(user.getId(), user.getUniqueCode(), user.getName(), user.getBalance());
    }

    private String generateToken(Long userId) {
        String payload = userId + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(payload.getBytes());
    }

    public Long parseToken(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token));
            return Long.parseLong(decoded.split(":")[0]);
        } catch (Exception e) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다");
        }
    }
}
