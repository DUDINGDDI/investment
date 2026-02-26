import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { resultApi } from '../api'
import styles from './FloatingMenu.module.css'

const qrItem = {
  label: 'QR',
  path: '/qr',
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="white" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="white" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="white" strokeWidth="2" />
      <rect x="16" y="16" width="3" height="3" fill="white" />
      <rect x="14" y="14" width="2" height="2" fill="white" />
      <rect x="19" y="14" width="2" height="2" fill="white" />
      <rect x="14" y="19" width="2" height="2" fill="white" />
    </svg>
  ),
  isActive: (p: string) => p === '/qr',
}

const menuItems = [
  {
    label: '마이',
    path: '/mypage',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    isActive: (p: string) => p === '/mypage',
  },
  {
    label: '미션',
    path: '/badges',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    isActive: (p: string) => p === '/badges',
  },
  {
    label: '지도',
    path: '/map',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 2L3 5V22L9 19L15 22L21 19V2L15 5L9 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 2V19" stroke="white" strokeWidth="2" />
        <path d="M15 5V22" stroke="white" strokeWidth="2" />
      </svg>
    ),
    isActive: (p: string) => p.startsWith('/map'),
  },
  {
    label: '주식',
    path: '/stocks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 17L9 11L13 15L21 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7H21V11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    isActive: (p: string) => p.startsWith('/stocks'),
  },
  {
    label: '투자',
    path: '/home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7V10C2 16.08 6.16 21.74 12 23C17.84 21.74 22 16.08 22 10V7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 8V14M9 11H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    isActive: (p: string) =>
      ['/home', '/booths', '/history', '/result'].some(r =>
        r === '/booths' ? p.startsWith('/booths') : p === r
      ),
  },
]

export default function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const [investmentEnabled, setInvestmentEnabled] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    resultApi.getInvestmentStatus()
      .then(res => setInvestmentEnabled(res.data.enabled))
      .catch(() => {})
  }, [])

  const handleNavigate = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const visibleMenuItems = menuItems.filter(item => investmentEnabled || item.path !== '/home')

  return (
    <div className={styles.container}>
      {/* 서브 메뉴 (열릴 때만 보임) */}
      <div className={`${styles.subButtons} ${open ? styles.subButtonsOpen : ''}`}>
        {visibleMenuItems.map((item) => (
          <div key={item.path} className={styles.subRow}>
            <span className={styles.subLabel}>{item.label}</span>
            <button
              className={`${styles.subButton} ${item.isActive(location.pathname) ? styles.subButtonActive : ''}`}
              onClick={() => handleNavigate(item.path)}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          </div>
        ))}
      </div>

      {/* QR 버튼 — 항상 보이고, 열리면 위로 올라감 */}
      <div className={`${styles.qrRow} ${open ? styles.qrRowOpen : ''}`}>
        <span className={`${styles.qrLabel} ${open ? styles.qrLabelOpen : ''}`}>{qrItem.label}</span>
        <button
          className={`${styles.subButton} ${qrItem.isActive(location.pathname) ? styles.subButtonActive : ''}`}
          onClick={() => handleNavigate(qrItem.path)}
          aria-label={qrItem.label}
        >
          {qrItem.icon}
        </button>
      </div>

      {/* 메인 토글 버튼 */}
      <button
        className={`${styles.mainButton} ${open ? styles.mainButtonOpen : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="#17171C" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 6L18 18" stroke="#17171C" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="2" fill="#17171C" />
            <circle cx="12" cy="12" r="2" fill="#17171C" />
            <circle cx="12" cy="18" r="2" fill="#17171C" />
          </svg>
        )}
      </button>
    </div>
  )
}
