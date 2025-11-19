package com.debate.controller;

import com.debate.dto.response.ApiResponse;
import com.debate.dto.response.UserResponse;
import com.debate.service.UserService;
import com.debate.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final SecurityUtil securityUtil;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String profileImage) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        UserResponse response = userService.updateProfile(userId, nickname, bio, profileImage);
        return ResponseEntity.ok(ApiResponse.success("프로필이 수정되었습니다", response));
    }
}

