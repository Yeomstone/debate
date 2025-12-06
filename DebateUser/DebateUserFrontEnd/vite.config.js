/**
 * Vite 설정 파일
 * 
 * Vite는 빠른 개발 서버와 빌드 도구입니다.
 * 
 * 주요 설정:
 * - React 플러그인 사용
 * - 개발 서버 포트: 9002
 * - API 프록시 설정: /api 요청을 백엔드 서버(9001)로 전달
 * 
 * 참고: https://vitejs.dev/config/
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite 설정
 * 
 * @returns {import('vite').UserConfig} Vite 설정 객체
 */
export default defineConfig({
  // React 플러그인: JSX 변환 및 Fast Refresh 지원
  plugins: [react()],
  
  // SockJS-client를 위한 global 변수 정의 (Node.js 호환성)
  define: {
    global: 'globalThis',
  },
  
  // 개발 서버 설정
  server: {
    // 개발 서버 포트 번호
    port: 9002,
    
    // 프록시 설정
    // /api로 시작하는 요청을 백엔드 서버로 전달
    proxy: {
      '/api': {
        // 백엔드 서버 주소 (Spring Boot)
        target: 'http://localhost:9001',
        // Origin 헤더를 타겟 서버의 호스트로 변경 (CORS 우회)
        changeOrigin: true,
        // 경로 재작성 설정
        // 백엔드가 /api/auth/login을 기대하면 rewrite를 주석 처리
        // 백엔드가 /auth/login을 기대하면 rewrite를 활성화
        // 예: /api/auth/login -> http://localhost:9001/api/auth/login (rewrite 없음)
        // 예: /api/auth/login -> http://localhost:9001/auth/login (rewrite 있음)
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // SSL 인증서 검증 비활성화 (개발 환경용)
        secure: false,
        // WebSocket 프록시 설정
        ws: true,
        // 프록시 요청/응답 로깅 (디버깅용)
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('프록시 에러:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('프록시 요청:', req.method, req.url, '->', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('프록시 응답:', proxyRes.statusCode, req.url)
          })
        },
      },
      // 업로드된 파일 접근을 위한 프록시 설정
      '/files': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket 프록시 설정 (실시간 채팅)
      '/ws': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        secure: false,
        ws: true,  // WebSocket 지원 활성화
      }
    }
  }
})

