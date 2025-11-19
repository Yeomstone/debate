package com.debate.config;

import com.debate.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.http.HttpMethod;
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
 * Spring Security 설정 클래스
 * JWT 기반 인증 및 CORS 설정을 관리합니다.
 */
@Configuration
@EnableWebSecurity                    // Spring Security 활성화
@EnableMethodSecurity                 // 메서드 레벨 보안 활성화
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;  // JWT 인증 필터

    /**
     * 비밀번호 암호화 인코더 빈 등록
     * BCrypt 알고리즘을 사용하여 비밀번호를 해시화합니다.
     * 
     * @return BCryptPasswordEncoder 인스턴스
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 인증 관리자 빈 등록
     * 사용자 인증을 처리하는 AuthenticationManager를 생성합니다.
     * 
     * @param config 인증 설정
     * @return AuthenticationManager 인스턴스
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * 보안 필터 체인 설정
     * HTTP 요청에 대한 보안 규칙을 정의합니다.
     * 
     * @param http HttpSecurity 객체
     * @return SecurityFilterChain 인스턴스
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // CSRF 보호 비활성화 (REST API이므로 불필요)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // CORS 설정 적용
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // 세션 사용 안 함 (JWT 사용)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()        // 인증 관련 API는 모두 허용
                        .requestMatchers("/api/categories/**").permitAll()  // 카테고리 API는 모두 허용
                        .requestMatchers(HttpMethod.GET, "/api/debate/**").permitAll()       // 토론 조회 API는 모두 허용 (GET)
                        .requestMatchers(HttpMethod.POST, "/api/debate").authenticated()     // 토론 생성은 인증 필요 (POST)
                        .requestMatchers(HttpMethod.PUT, "/api/debate/**").authenticated()  // 토론 수정은 인증 필요 (PUT)
                        .requestMatchers(HttpMethod.DELETE, "/api/debate/**").authenticated() // 토론 삭제는 인증 필요 (DELETE)
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()   // 댓글 조회 API는 모두 허용 (GET)
                        .requestMatchers(HttpMethod.POST, "/api/comments").authenticated() // 댓글 작성은 인증 필요 (POST)
                        .requestMatchers(HttpMethod.DELETE, "/api/comments/**").authenticated() // 댓글 삭제는 인증 필요 (DELETE)
                        .requestMatchers(HttpMethod.GET, "/api/opinions/**").permitAll()  // 의견 조회 API는 모두 허용 (GET)
                        .requestMatchers(HttpMethod.POST, "/api/opinions").authenticated() // 의견 작성은 인증 필요 (POST)
                        .requestMatchers("/files/**").permitAll()         // 업로드된 파일 접근 허용
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()  // Swagger UI 허용
                        .requestMatchers("/api-docs/**", "/v3/api-docs/**").permitAll()     // API 문서 허용
                        // Actuator 엔드포인트: 개발 환경에서는 허용, 프로덕션에서는 인증 필요하도록 설정 가능
                        .requestMatchers("/actuator/health", "/actuator/info", "/actuator/loggers/**").permitAll()  // 개발용: 인증 없이 접근 가능 (loggers 하위 경로 포함)
                        // 프로덕션에서는 아래 주석을 해제하고 위의 permitAll()을 제거하세요:
                        // .requestMatchers("/actuator/health", "/actuator/info", "/actuator/loggers/**").authenticated()  // 프로덕션용: 인증 필요
                        .anyRequest().authenticated()                       // 그 외 모든 요청은 인증 필요
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);  // JWT 필터를 인증 필터 전에 추가

        return http.build();
    }

    /**
     * CORS (Cross-Origin Resource Sharing) 설정
     * 프론트엔드와의 통신을 위한 CORS 정책을 정의합니다.
     * 
     * @return CorsConfigurationSource 인스턴스
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 Origin (프론트엔드 주소)
        //configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedOrigins(List.of("http://localhost:9002"));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // 허용할 HTTP 헤더
        configuration.setAllowedHeaders(List.of("*"));
        
        // 인증 정보(쿠키 등) 허용
        configuration.setAllowCredentials(true);

        // 모든 경로에 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

