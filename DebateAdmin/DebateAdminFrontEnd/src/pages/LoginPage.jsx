/**
 * 관리자 로그인 페이지
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import debateLogoLight from '../assets/debate-onlylogo.png'
import debateLogoDark from '../assets/debate-logo-dark.png'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const currentLogo = theme === 'dark' ? debateLogoDark : debateLogoLight

  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.adminId, formData.password)
      navigate('/')
    } catch (error) {
      setError(error.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="login-box">
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="테마 전환"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <div className="login-logo">
          <img 
            src={currentLogo}
            alt="Debate Logo" 
            className="login-logo-image"
          />
          <span className="logo-text">DEBATE</span>
        </div>
        <h2>관리자 로그인</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label className="form-label">관리자 아이디</label>
            <input
              type="text"
              className="form-input"
              placeholder="admin@example.com"
              value={formData.adminId}
              onChange={(e) =>
                setFormData({ ...formData, adminId: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

