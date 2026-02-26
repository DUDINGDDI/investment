package com.pm.investment.controller;

import com.pm.investment.dto.MyBoothVisitorResponse;
import com.pm.investment.dto.UserResponse;
import com.pm.investment.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @GetMapping("/me/booth-visitors")
    public ResponseEntity<MyBoothVisitorResponse> getMyBoothVisitors(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getMyBoothVisitors(userId));
    }
}
