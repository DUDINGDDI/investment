package com.pm.investment.service;

import com.pm.investment.dto.LoginRequest;
import com.pm.investment.dto.LoginResponse;
import com.pm.investment.dto.MyBoothVisitorResponse;
import com.pm.investment.dto.UserResponse;
import com.pm.investment.entity.Booth;
import com.pm.investment.entity.StockAccount;
import com.pm.investment.entity.User;
import com.pm.investment.repository.BoothVisitRepository;
import com.pm.investment.repository.StockAccountRepository;
import com.pm.investment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StockAccountRepository stockAccountRepository;
    private final BoothVisitRepository boothVisitRepository;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUniqueCodeAndName(request.getUniqueCode(), request.getName())
                .orElseThrow(() -> new IllegalArgumentException("사번 또는 이름이 올바르지 않습니다"));

        // StockAccount가 없으면 자동 생성
        if (stockAccountRepository.findByUserId(user.getId()).isEmpty()) {
            stockAccountRepository.save(new StockAccount(user));
        }

        String token = generateToken(user.getId());

        return new LoginResponse(user.getId(), user.getName(), user.getCompany(), user.getBalance(), token);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
        return new UserResponse(user.getId(), user.getUniqueCode(), user.getName(), user.getCompany(), user.getBalance());
    }

    @Transactional(readOnly = true)
    public MyBoothVisitorResponse getMyBoothVisitors(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        Booth booth = user.getBelongingBooth();
        if (booth == null) {
            return new MyBoothVisitorResponse(null, null, null, 0);
        }

        long visitorCount = boothVisitRepository.countByBoothId(booth.getId());
        return new MyBoothVisitorResponse(booth.getId(), booth.getName(), booth.getLogoEmoji(), visitorCount);
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
