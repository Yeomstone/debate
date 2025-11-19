package com.debate.util;

import com.debate.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT (JSON Web Token) 유틸리티 클래스
 * JWT 토큰의 생성, 검증, 파싱 기능을 제공합니다.
 */
@Component
@RequiredArgsConstructor
public class JwtUtil {
    private final JwtProperties jwtProperties;  // JWT 설정 속성 (시크릿 키, 만료 시간 등)

    /**
     * JWT 서명에 사용할 비밀 키 생성
     * 
     * @return SecretKey 인스턴스
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * JWT 토큰 생성
     * 
     * @param userId 사용자 ID
     * @param email 사용자 이메일
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateToken(Long userId, String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getExpiration());

        return Jwts.builder()
                .subject(String.valueOf(userId))        // 토큰 주제 (사용자 ID)
                .claim("email", email)                  // 커스텀 클레임 (사용자 이메일)
                .issuedAt(now)                          // 발행 시간
                .expiration(expiryDate)                 // 만료 시간
                .signWith(getSigningKey())              // 서명 키
                .compact();                             // 토큰 문자열 생성
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     * 
     * @param token JWT 토큰 문자열
     * @return 사용자 ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())            // 서명 키로 검증
                .build()
                .parseSignedClaims(token)               // 서명된 클레임 파싱
                .getPayload();                          // 페이로드 추출
        return Long.parseLong(claims.getSubject());     // 주제(사용자 ID) 반환
    }

    /**
     * JWT 토큰에서 사용자 이메일 추출
     * 
     * @param token JWT 토큰 문자열
     * @return 사용자 이메일
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())            // 서명 키로 검증
                .build()
                .parseSignedClaims(token)               // 서명된 클레임 파싱
                .getPayload();                          // 페이로드 추출
        return claims.get("email", String.class);      // 사용자 이메일 클레임 반환
    }

    /**
     * JWT 토큰 유효성 검증
     * 
     * @param token 검증할 JWT 토큰 문자열
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())        // 서명 키로 검증
                    .build()
                    .parseSignedClaims(token);          // 토큰 파싱 시도
            return true;                                // 파싱 성공 시 유효한 토큰
        } catch (Exception e) {
            return false;                               // 파싱 실패 시 유효하지 않은 토큰
        }
    }
}

