import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { resultApi } from '../api'

const comingSoonStyle: React.CSSProperties = {
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  textAlign: 'center',
}

const lockIconStyle: React.CSSProperties = {
  marginBottom: '20px',
  opacity: 0.6,
}

const titleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: '8px',
}

const descStyle: React.CSSProperties = {
  fontSize: '16px',
  color: 'var(--text-secondary)',
  marginBottom: '12px',
}

const subStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--text-disabled)',
  lineHeight: 1.5,
}

export function PmInvestmentGate() {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    resultApi.getInvestmentStatus().then(res => setEnabled(res.data.enabled))
  }, [])

  if (enabled === null) return null
  if (!enabled) return (
    <div style={comingSoonStyle}>
      <div style={lockIconStyle}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#555560" strokeWidth="2" />
          <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#555560" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 style={titleStyle}>Coming Soon</h2>
      <p style={descStyle}>대표작 투자가 곧 시작됩니다</p>
      <p style={subStyle}>관리자가 투자를 활성화하면<br />이곳에서 투자할 수 있어요</p>
    </div>
  )
  return <Outlet />
}
