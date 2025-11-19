package com.debate.controller;

import com.debate.dto.request.LoginRequest;
import com.debate.dto.request.RegisterRequest;
import com.debate.dto.response.ApiResponse;
import com.debate.dto.response.AuthResponse;
import com.debate.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 인증(Authentication) 관련 REST API 컨트롤러
 * 회원가입, 로그인 등의 인증 기능을 제공합니다.
 */
@Tag(name = "인증 API", description = "회원가입, 로그인 등 인증 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;  // 인증 비즈니스 로직 서비스

    /**
     * 회원가입
     * 
     * @param request 회원가입 요청 데이터 (이메일, 비밀번호, 아이디, 닉네임)
     * @return 인증 응답 (JWT 토큰 및 사용자 정보)
     */
    @Operation(summary = "회원가입", description = "새로운 사용자를 등록하고 JWT 토큰을 발급합니다.")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다", response));
    }

    /**
     * 로그인
     * 이메일 또는 아이디로 로그인 가능합니다.
     * 
     * @param request 로그인 요청 데이터 (이메일/아이디, 비밀번호)
     * @return 인증 응답 (JWT 토큰 및 사용자 정보)
     */
    @Operation(summary = "로그인", description = "이메일 또는 아이디로 로그인하고 JWT 토큰을 발급합니다.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));
    }
}

