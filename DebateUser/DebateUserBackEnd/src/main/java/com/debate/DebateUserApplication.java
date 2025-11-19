package com.debate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DebateUserApplication {
    public static void main(String[] args) {
        SpringApplication.run(DebateUserApplication.class, args);
    }
}

