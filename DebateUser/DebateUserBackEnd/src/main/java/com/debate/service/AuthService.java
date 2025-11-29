package com.debate.service;

import com.debate.dto.request.LoginRequest;
import com.debate.dto.request.RegisterRequest;
import com.debate.dto.response.AuthResponse;
import com.debate.dto.response.UserResponse;
import com.debate.entity.User;
import com.debate.exception.BadRequestException;
import com.debate.exception.UnauthorizedException;
import com.debate.repository.UserRepository;
import com.debate.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 인증(Authentication) 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 회원가입, 로그인, JWT 토큰 생성 등의 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;      // 사용자 데이터 접근 리포지토리
    private final PasswordEncoder passwordEncoder;     // 비밀번호 암호화 인코더
    private final JwtUtil jwtUtil;                     // JWT 토큰 유틸리티

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.upload-url-prefix:/uploads}")
    private String uploadUrlPrefix;

    /**
     * 회원가입 처리
     * 
     * @param request 회원가입 요청 데이터
     * @return 인증 응답 (JWT 토큰 및 사용자 정보)
     * @throws BadRequestException 이메일 또는 아이디가 이미 사용 중인 경우
     */
    @Transactional
    public AuthResponse register(RegisterRequest request, MultipartFile profileImage) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다");
        }

        String profileImagePath = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                profileImagePath = saveProfileImage(profileImage);
            } catch (IOException e) {
                throw new RuntimeException("프로필 이미지 저장 중 오류가 발생했습니다", e);
            }
        }


        // 사용자 엔티티 생성
        User user = User.builder()
                .email(request.getEmail())                                    // 이메일
                .password(passwordEncoder.encode(request.getPassword()))      // 비밀번호 암호화
                .nickname(request.getNickname())                              // 닉네임
                .bio(request.getBio())                                        // 자기소개
                .profileImage(profileImagePath)                               // 프로필 이미지
                .status(User.UserStatus.ACTIVE)                               // 상태: 활성
                .emailVerified(false)                                         // 이메일 인증: 미인증
                .build();

        // 사용자 저장
        user = userRepository.save(user);

        // JWT 토큰 생성
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        // 인증 응답 생성
        return AuthResponse.builder()
                .token(token)                          // JWT 토큰
                .user(UserResponse.from(user))          // 사용자 정보
                .build();
    }

    // [추가] 이메일 중복 확인 (true면 중복)
    public boolean isEmailDuplicate(String email) {
        return userRepository.existsByEmail(email);
    }

    // [추가] 닉네임 중복 확인 (true면 중복)
    public boolean isNicknameDuplicate(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    /**
     * 로그인 처리
     * 이메일과 비밀번호로 인증합니다.
     *
     * @param request 로그인 요청 데이터
     * @return 인증 응답 (JWT 토큰 및 사용자 정보)
     * @throws UnauthorizedException 이메일 또는 비밀번호가 올바르지 않거나 계정이 비활성화된 경우
     */
    public AuthResponse login(LoginRequest request) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다"));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        // 계정 상태 확인 (활성화된 계정만 로그인 가능)
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new UnauthorizedException("비활성화된 계정입니다");
        }

        // JWT 토큰 생성
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        // 인증 응답 생성
        return AuthResponse.builder()
                .token(token)                          // JWT 토큰
                .user(UserResponse.from(user))          // 사용자 정보
                .build();
    }

    private String saveProfileImage(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일명 생성 (UUID)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path targetLocation = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // URL 반환
        return uploadUrlPrefix + "/" + filename;
    }
}

