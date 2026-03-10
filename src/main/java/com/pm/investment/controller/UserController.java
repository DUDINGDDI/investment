package com.pm.investment.controller;

import com.pm.investment.dto.FcmTokenRequest;
import com.pm.investment.dto.UserResponse;
import com.pm.investment.service.FcmTokenService;
import com.pm.investment.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FcmTokenService fcmTokenService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @PostMapping("/fcm-token")
    public ResponseEntity<Map<String, String>> registerFcmToken(
            HttpServletRequest request,
            @Valid @RequestBody FcmTokenRequest fcmTokenRequest) {
        Long userId = (Long) request.getAttribute("userId");
        fcmTokenService.registerToken(userId, fcmTokenRequest.getToken());
        return ResponseEntity.ok(Map.of("message", "FCM 토큰이 등록되었습니다"));
    }

    @DeleteMapping("/fcm-token")
    public ResponseEntity<Map<String, String>> removeFcmToken(
            HttpServletRequest request,
            @Valid @RequestBody FcmTokenRequest fcmTokenRequest) {
        Long userId = (Long) request.getAttribute("userId");
        fcmTokenService.removeToken(userId, fcmTokenRequest.getToken());
        return ResponseEntity.ok(Map.of("message", "FCM 토큰이 삭제되었습니다"));
    }
}
