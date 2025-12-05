package com.debate.config;

import com.debate.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 전역 설정.
 * <p>
 * - 세션을 STATELESS 모드로 두고 JWT 토큰 기반 인증만 허용한다.<br>
 * - Swagger, Actuator 일부 엔드포인트 등 공개해야 하는 URL을 화이트리스트로 관리한다.<br>
 * - 관리자 전용 API는 기본적으로 인증을 요구하며, 세밀한 권한 제어는 메서드 시큐리티로 확장할 수 있다.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    /** JWT 토큰 기반 인증을 처리하는 커스텀 필터 */
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * 관리자 비밀번호를 해시/검증하기 위한 {@link PasswordEncoder}.
     * <p>
     * BCrypt는 계산 비용이 높아 무차별 대입 공격을 어렵게 만든다.
     *
     * @return BCryptPasswordEncoder 인스턴스
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 인증 흐름에서 사용되는 {@link AuthenticationManager}를 노출한다.
     * <p>
     * Spring Boot 3.x에서는 {@link AuthenticationConfiguration}에서 매니저를 꺼내어 빈으로 등록하는 패턴을 권장한다.
     *
     * @param config Spring Security가 생성한 인증 설정
     * @return AuthenticationManager
     * @throws Exception 설정 초기화 실패 시
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * HTTP 보안 필터 체인을 정의한다.
     * <p>
     * - CSRF는 JWT 기반 인증 구조에서 불필요하므로 비활성화<br>
     * - CORS는 프런트엔드 도메인과 헤더 허용 범위를 명시적으로 설정<br>
     * - 세션은 STATELESS로 지정하여 서버 측 세션 저장을 방지<br>
     * - 인증이 필요 없는 경로를 화이트리스트로 지정하고 나머지는 인증 요구<br>
     * - UsernamePasswordAuthenticationFilter 앞에 JWT 필터를 배치하여 토큰을 우선 검증
     *
     * @param http Spring Security HTTP 빌더
     * @return SecurityFilterChain 인스턴스
     * @throws Exception 보안 설정 실패 시
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/auth/**").permitAll()
                        .requestMatchers("/api/admin/admins").permitAll()  // 초기 관리자 생성용 (POST만 허용 권장, 프로덕션에서는 제거)
                        .requestMatchers("/api/upload/**").authenticated()  // 이미지 업로드 API는 인증 필요
                        .requestMatchers("/files/**").permitAll()  // 업로드된 파일 접근 허용
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info", "/actuator/loggers/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 프런트엔드 애플리케이션에서 호출할 수 있도록 CORS 정책을 정의한다.
     * 필요 시 허용 도메인/헤더를 운영 환경 값으로 분리하거나, 여러 도메인을 허용하도록 수정한다.
     *
     * @return URL 패턴별 CORS 구성을 제공하는 {@link CorsConfigurationSource}
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        //configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "http://localhost:8080"));
        configuration.setAllowedOrigins(List.of("http://localhost:9102", "https://admin.debate.me.kr"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

