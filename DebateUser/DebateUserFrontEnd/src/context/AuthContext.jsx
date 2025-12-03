/**
 * AuthContext - 인증 관리 컨텍스트
 *
 * 애플리케이션 전역에서 사용자 인증 상태를 관리합니다.
 * 로그인, 로그아웃, 회원가입, 토큰 관리 등의 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 사용자 인증 상태 관리
 * 2. JWT 토큰 관리 (localStorage)
 * 3. 로그인/로그아웃 처리
 * 4. 회원가입 처리 (프로필 이미지 포함)
 * 5. 자동 로그인 (토큰 검증)
 * 6. Axios 인터셉터 설정
 *
 * @component
 */

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { authService } from "../services/authService";
// ========================================
// Context 생성
// ========================================

/**
 * AuthContext 생성
 * 인증 관련 상태와 함수를 제공하는 컨텍스트
 */
const AuthContext = createContext(null);

// ========================================
// API 기본 URL 설정
// ========================================

// 환경 변수 VITE_API_BASE_URL이 있으면 사용, 없으면 /api 사용 (Vite 프록시 또는 상대 경로)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Axios 기본 설정
axios.defaults.baseURL = API_BASE_URL;

// ========================================
// AuthProvider 컴포넌트
// ========================================

/**
 * AuthProvider - 인증 컨텍스트 제공자
 *
 * 애플리케이션의 최상위에 래핑하여 모든 하위 컴포넌트에서
 * 인증 상태와 함수를 사용할 수 있도록 합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 */
export const AuthProvider = ({ children }) => {
  // ========================================
  // 상태 관리
  // ========================================

  /**
   * 사용자 정보 상태
   * @type {Object|null} user - 로그인된 사용자 정보 (null이면 로그인하지 않음)
   */
  const [user, setUser] = useState(null);

  /**
   * 인증 상태
   * @type {boolean} isAuthenticated - 로그인 여부
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * 로딩 상태
   * @type {boolean} loading - 초기 로딩 중 여부 (토큰 검증 중)
   */
  const [loading, setLoading] = useState(true);

  // ========================================
  // Axios 인터셉터 설정
  // ========================================

  useEffect(() => {
    /**
     * 요청 인터셉터
     * 모든 요청에 Authorization 헤더 자동 추가
     */
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    /**
     * 응답 인터셉터
     * 401 에러 시 자동 로그아웃 처리
     */
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 토큰이 만료되었거나 유효하지 않은 경우
          logout();
        }
        return Promise.reject(error);
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ========================================
  // 초기 로딩 시 토큰 검증
  // ========================================

  useEffect(() => {
    /**
     * 저장된 토큰으로 자동 로그인 시도
     * 페이지 새로고침 시에도 로그인 상태 유지
     */
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // ✅ authService 사용 및 데이터 추출 경로 수정
        const response = await authService.getCurrentUser();

        // 응답이 성공이고 데이터가 있는지 확인
        if (response && response.success && response.data) {
          setUser(response.data); // ✅ 알맹이(사용자 정보)만 저장
          setIsAuthenticated(true);
        } else {
          throw new Error("사용자 정보 로드 실패");
        }
      } catch (error) {
        console.error("토큰 검증 실패:", error);
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ========================================
  // 로그인 함수
  // ========================================

  /**
   * 로그인 처리
   *
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<Object>} 로그인된 사용자 정보
   * @throws {Error} 로그인 실패 시 에러
   */
  const login = async (email, password) => {
    try {
      // ✅ authService 사용
      const response = await authService.login(email, password);

      // ✅ success 확인 및 data 내부에서 token 추출
      if (response.success && response.data) {
        const { token, user: userData } = response.data; // ✅ data 안에서 꺼냄

        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else {
        throw new Error(response.message || "로그인 실패");
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  };

  // ========================================
  // 회원가입 함수 (프로필 이미지 포함)
  // ========================================

  /**
   * 회원가입 처리
   * 프로필 이미지를 포함한 회원가입 지원
   *
   * @param {FormData|Object} data - 회원가입 데이터
   *   FormData인 경우: 프로필 이미지 포함 가능
   *   Object인 경우: { email, password, nickname, bio }
   * @returns {Promise<Object>} 생성된 사용자 정보
   * @throws {Error} 회원가입 실패 시 에러
   */
  const register = async (data) => {
    try {
      // ✅ authService가 FormData 처리까지 알아서 함
      const response = await authService.register(data);

      if (response.success && response.data) {
        const { token, user: userData } = response.data; // ✅ data 안에서 꺼냄

        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else {
        throw new Error(response.message || "회원가입 실패");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      throw error;
    }
  };

  // ========================================
  // 로그아웃 함수
  // ========================================

  /**
   * 로그아웃 처리
   * 토큰 제거 및 사용자 정보 초기화
   */
  const logout = () => {
    // 토큰 제거
    localStorage.removeItem("token");

    // Axios 기본 헤더에서 토큰 제거
    delete axios.defaults.headers.common["Authorization"];

    // 사용자 정보 초기화
    setUser(null);
    setIsAuthenticated(false);
  };

  // ========================================
  // 사용자 정보 업데이트 함수
  // ========================================

  /**
   * 사용자 정보 업데이트
   * 프로필 수정 후 Context의 사용자 정보를 갱신할 때 사용
   *
   * @param {Object} updatedUser - 업데이트된 사용자 정보
   */
  const updateUser = (updatedUser) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  // ========================================
  // 사용자 정보 새로고침 함수
  // ========================================

  /**
   * 서버에서 최신 사용자 정보를 가져와 업데이트
   * 프로필 수정 후 전체 정보를 다시 불러올 때 사용
   *
   * @returns {Promise<Object>} 최신 사용자 정보
   * @throws {Error} 요청 실패 시 에러
   */
  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();

      if (response.success && response.data) {
        setUser(response.data); // ✅ 알맹이만 저장
        return response.data;
      }
    } catch (error) {
      console.error("사용자 정보 새로고침 실패:", error);
      throw error;
    }
  };
  // ========================================
  // Context 값 정의
  // ========================================

  /**
   * Context를 통해 제공될 값
   * 모든 하위 컴포넌트에서 useAuth() 훅으로 접근 가능
   */
  const value = {
    // 상태
    user, // 현재 로그인된 사용자 정보
    isAuthenticated, // 로그인 여부
    loading, // 초기 로딩 중 여부

    // 함수
    login, // 로그인 함수
    register, // 회원가입 함수 (프로필 이미지 지원)
    logout, // 로그아웃 함수
    updateUser, // 사용자 정보 부분 업데이트
    refreshUser, // 사용자 정보 전체 새로고침
  };

  // ========================================
  // 렌더링
  // ========================================

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ========================================
// useAuth 커스텀 훅
// ========================================

/**
 * useAuth - 인증 컨텍스트 접근 훅
 *
 * AuthContext의 값을 쉽게 사용할 수 있도록 하는 커스텀 훅
 *
 * 사용 예시:
 * ```javascript
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 *
 * @returns {Object} AuthContext의 값
 * @throws {Error} AuthProvider 외부에서 사용 시 에러
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }

  return context;
};

// ========================================
// Export
// ========================================

export default AuthContext;
