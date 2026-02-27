import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useToast } from '../components/ToastContext'
import cjLogo from '../assets/logo/CJ_Group_White Wordtype.png'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [uniqueCode, setUniqueCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleLogin = async () => {
    if (!uniqueCode.trim() || !name.trim()) {
      showToast('고유 코드와 이름을 입력해주세요', 'error')
      return
    }

    setLoading(true)
    try {
      const { data } = await authApi.login({ uniqueCode: uniqueCode.trim(), name: name.trim() })
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', String(data.userId))
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userCompany', data.company || '')
      navigate('/stocks', { replace: true })
    } catch {
      showToast('로그인에 실패했습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={cjLogo} alt="CJ" className={styles.logo} />
        <h1 className={styles.title}>2026 ONLYONE FAIR</h1>
        <p className={styles.subtitle}>나만의 투자 포트폴리오를 만들어보세요</p>
      </div>

      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>고유 코드 (사번)</label>
          <input
            className={styles.input}
            type="text"
            placeholder="예: 2024001"
            value={uniqueCode}
            onChange={e => setUniqueCode(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>이름</label>
          <input
            className={styles.input}
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.loginBtn}
          onClick={handleLogin}
          disabled={loading || !uniqueCode.trim() || !name.trim()}
        >
          {loading ? '입장 중...' : '입장하기'}
        </button>
      </div>
    </div>
  )
}
