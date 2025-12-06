/**
 * 채팅 서비스
 * WebSocket(STOMP)을 사용한 실시간 채팅 기능 제공
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from './api';

// WebSocket 기본 URL
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
  (window.location.protocol === 'https:' 
    ? `wss://${window.location.host}/ws`
    : `ws://${window.location.host}/ws`);

// API 기본 URL (SockJS 폴백용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ChatService {
  constructor() {
    this.client = null;
    this.subscription = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * WebSocket 연결
   * @param {Long} debateId - 토론 ID
   * @param {Function} onMessageReceived - 메시지 수신 콜백
   * @param {Function} onConnected - 연결 성공 콜백
   * @param {Function} onError - 에러 콜백
   */
  connect(debateId, onMessageReceived, onConnected, onError) {
    // 이미 연결되어 있으면 기존 연결 해제
    if (this.client && this.connected) {
      this.disconnect();
    }

    this.client = new Client({
      // SockJS로 WebSocket 연결
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      
      // 디버그 로그 (개발 환경에서만)
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str);
        }
      },

      // 재연결 설정
      reconnectDelay: 5000,

      // 하트비트 설정
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // 연결 성공 시
      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('[Chat] WebSocket 연결 성공');

        // 토론 채팅방 구독
        this.subscription = this.client.subscribe(
          `/topic/debate/${debateId}`,
          (message) => {
            const chatMessage = JSON.parse(message.body);
            onMessageReceived(chatMessage);
          }
        );

        if (onConnected) {
          onConnected();
        }
      },

      // 연결 에러 시
      onStompError: (frame) => {
        console.error('[Chat] STOMP 에러:', frame.headers['message']);
        this.connected = false;
        if (onError) {
          onError(frame);
        }
      },

      // WebSocket 에러 시
      onWebSocketError: (event) => {
        console.error('[Chat] WebSocket 에러:', event);
        this.connected = false;
      },

      // 연결 끊김 시
      onDisconnect: () => {
        console.log('[Chat] WebSocket 연결 종료');
        this.connected = false;
      }
    });

    // 연결 시작
    this.client.activate();
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.connected = false;
    console.log('[Chat] 연결 해제 완료');
  }

  /**
   * 채팅 메시지 전송
   * @param {Long} debateId - 토론 ID
   * @param {Object} message - 메시지 객체
   */
  sendMessage(debateId, message) {
    if (!this.client || !this.connected) {
      console.error('[Chat] 연결되지 않음. 메시지 전송 실패.');
      return false;
    }

    try {
      this.client.publish({
        destination: `/app/chat/${debateId}`,
        body: JSON.stringify(message)
      });
      return true;
    } catch (error) {
      console.error('[Chat] 메시지 전송 실패:', error);
      return false;
    }
  }

  /**
   * 이전 채팅 메시지 조회 (REST API)
   * @param {Long} debateId - 토론 ID
   * @param {number} limit - 조회할 메시지 수 (기본 50개)
   * @returns {Promise<Array>} 메시지 목록
   */
  async getMessages(debateId, limit = 50) {
    try {
      const response = await api.get(`/chat/${debateId}`, {
        params: { limit }
      });
      return response.data || [];
    } catch (error) {
      console.error('[Chat] 메시지 조회 실패:', error);
      return [];
    }
  }

  /**
   * 연결 상태 확인
   * @returns {boolean} 연결 여부
   */
  isConnected() {
    return this.connected && this.client?.connected;
  }
}

// 싱글톤 인스턴스
export const chatService = new ChatService();
export default chatService;
