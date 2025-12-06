package com.debate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket 설정 클래스
 * STOMP 프로토콜을 사용한 실시간 채팅 기능 지원
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * 메시지 브로커 설정
     * - /topic: 구독 목적지 (브로드캐스트)
     * - /app: 애플리케이션 메시지 목적지
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트에서 구독할 목적지 prefix 설정
        config.enableSimpleBroker("/topic");
        // 클라이언트에서 메시지를 보낼 목적지 prefix 설정
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * STOMP 엔드포인트 등록
     * 클라이언트는 /ws 엔드포인트로 WebSocket 연결
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // CORS 허용
                .withSockJS();  // SockJS 폴백 지원
    }
}
