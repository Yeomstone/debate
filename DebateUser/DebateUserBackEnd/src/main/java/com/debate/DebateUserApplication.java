package com.debate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling; // 추가

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling // 스케줄링 활성화 추가
public class    DebateUserApplication {
    public static void main(String[] args) {
        SpringApplication.run(DebateUserApplication.class, args);
    }
}

