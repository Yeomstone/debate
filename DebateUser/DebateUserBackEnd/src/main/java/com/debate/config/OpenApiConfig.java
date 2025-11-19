package com.debate.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger) 설정 클래스
 * API 문서화를 위한 설정을 관리합니다.
 */
@Configuration
public class OpenApiConfig {

    /**
     * OpenAPI 설정 빈 등록
     * Swagger UI에서 API 문서를 확인할 수 있도록 설정합니다.
     * 
     * @return OpenAPI 인스턴스
     */
    @Bean
    public OpenAPI openAPI() {
        // JWT 인증을 위한 보안 스키마 정의
        String jwt = "JWT";
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwt);
        Components components = new Components().addSecuritySchemes(jwt, new SecurityScheme()
                .name(jwt)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
        );

        return new OpenAPI()
                .info(new Info()
                        .title("토론 플랫폼 API 문서")
                        .description("토론(Debate) 플랫폼 사용자 백엔드 API 문서입니다.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Debate Team")
                                .email("support@debate.com")))
                .addSecurityItem(securityRequirement)
                .components(components);
    }
}

