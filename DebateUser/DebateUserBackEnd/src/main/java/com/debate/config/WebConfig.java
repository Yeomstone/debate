package com.debate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * 웹 설정 클래스
 * 정적 리소스 핸들러를 설정합니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.upload-url-prefix:/uploads}")
    private String uploadUrlPrefix;

    @Value("${file.profile-upload-dir:uploads/profile}")
    private String profileUploadDir;

    @Value("${file.profile-upload-url-prefix:/files/user/profile}")
    private String profileUploadUrlPrefix;

    /**
     * 정적 리소스 핸들러 등록
     * 업로드된 파일을 제공하기 위한 핸들러를 추가합니다.
     * 
     * @param registry ResourceHandlerRegistry
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // 에디터 이미지 파일을 제공하는 핸들러 등록 (절대 경로로 변환)
        String uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize().toString().replace("\\", "/");
        
        registry.addResourceHandler(uploadUrlPrefix + "/**")
                .addResourceLocations("file:" + uploadPath + "/");

        // 프로필 이미지 파일을 제공하는 핸들러 등록 (절대 경로로 변환)
        String profileUploadPath = Paths.get(profileUploadDir).toAbsolutePath().normalize().toString().replace("\\", "/");
        
        // 프로필 이미지 경로는 새 경로와 기존 경로(에디터 이미지 경로) 모두 지원
        // 기존 프로필 이미지가 /files/editor/images/에 있을 수 있으므로
        registry.addResourceHandler(profileUploadUrlPrefix + "/**")
                .addResourceLocations(
                    "file:" + profileUploadPath + "/",
                    "file:" + uploadPath + "/"  // 기존 프로필 이미지 접근을 위한 fallback
                );
    }
}

