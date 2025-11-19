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

    /**
     * 정적 리소스 핸들러 등록
     * 업로드된 파일을 제공하기 위한 핸들러를 추가합니다.
     * 
     * @param registry ResourceHandlerRegistry
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // 업로드된 파일을 제공하는 핸들러 등록 (절대 경로로 변환)
        String uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize().toString().replace("\\", "/");
        
        registry.addResourceHandler(uploadUrlPrefix + "/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}

