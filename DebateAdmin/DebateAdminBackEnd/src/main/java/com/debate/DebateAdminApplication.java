package com.debate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Spring Boot 애플리케이션의 진입점.
 * <p>
 * {@link SpringBootApplication} 어노테이션은 컴포넌트 스캔, 자동 설정, 설정 클래스를 한 번에 활성화한다.
 * {@link EnableJpaAuditing}은 엔티티의 생성/수정 시각을 자동으로 채우도록 JPA 감사 기능을 켠다.
 */
@SpringBootApplication
@EnableJpaAuditing
public class DebateAdminApplication {

    /**
     * 애플리케이션을 부트스트랩하는 main 함수.
     * Spring Boot는 내장 WAS를 띄우고 빈 초기화를 수행한 뒤 REST API를 실행 상태로 만든다.
     *
     * @param args 커맨드라인 인자
     */
    public static void main(String[] args) {
        SpringApplication.run(DebateAdminApplication.class, args);
    }
}

