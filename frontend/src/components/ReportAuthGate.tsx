import { useState } from 'react'

const REPORT_AUTH_KEY = 'report_authenticated'

export default function ReportAuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(REPORT_AUTH_KEY) === 'true')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (authenticated) return <>{children}</>

  const handleAuth = () => {
    if (password === '1953') {
      sessionStorage.setItem(REPORT_AUTH_KEY, 'true')
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#ffffff' }}>
      <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🔒</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#1a1a1a' }}>보고서 인증</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>비밀번호를 입력해주세요</p>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          placeholder="비밀번호"
          autoFocus
          style={{
            width: '100%', padding: '14px 16px', border: '1px solid #ddd', borderRadius: 12,
            fontSize: 15, background: '#f5f5f7', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
        />
        {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 4 }}>비밀번호가 올바르지 않습니다</p>}
        <button
          onClick={handleAuth}
          style={{
            width: '100%', padding: 14, background: '#6C5CE7', color: '#fff', border: 'none',
            borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
          }}
        >
          확인
        </button>
      </div>
    </div>
  )
}
