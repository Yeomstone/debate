package com.debate.controller;

import com.debate.dto.response.ApiResponse;
import com.debate.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 파일 업로드 관련 REST API 컨트롤러
 * 이미지 파일 업로드를 처리합니다.
 */
@Tag(name = "파일 업로드 API", description = "이미지 파일 업로드 관련 API")
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {
    private final SecurityUtil securityUtil;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.upload-url-prefix:/uploads}")
    private String uploadUrlPrefix;

    /**
     * 이미지 파일 업로드
     * 
     * @param file 업로드할 이미지 파일
     * @return 업로드된 이미지의 URL
     */
    @Operation(summary = "이미지 업로드", description = "이미지 파일을 업로드하고 URL을 반환합니다. 인증이 필요합니다.")
    @SecurityRequirement(name = "JWT")
    @PostMapping("/image")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }

        // 파일 검증
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("파일이 비어있습니다"));
        }

        // 이미지 파일 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("이미지 파일만 업로드 가능합니다"));
        }

        // 파일 크기 검증 (10MB 제한)
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("파일 크기는 10MB 이하여야 합니다"));
        }

        try {
            // 업로드 디렉토리 생성 (절대 경로로 변환)
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 고유한 파일명 생성 (UUID + 원본 파일명)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // 파일 저장
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 이미지 URL 생성
            String imageUrl = uploadUrlPrefix + "/" + filename;

            log.info("이미지 업로드 성공: userId={}, filename={}, url={}", userId, filename, imageUrl);

            return ResponseEntity.ok(ApiResponse.success("이미지가 업로드되었습니다", imageUrl));

        } catch (IOException e) {
            log.error("이미지 업로드 실패: userId={}, error={}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("이미지 업로드에 실패했습니다: " + e.getMessage()));
        }
    }
}

