import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './FloatingMenu.module.css'

export default function FloatingMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigate = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const isMapActive = location.pathname.startsWith('/map')
  const isBoothsActive = location.pathname.startsWith('/booths')

  return (
    <div className={styles.container}>
      {/* 서브 버튼들 */}
      <div className={`${styles.subButtons} ${open ? styles.subButtonsOpen : ''}`}>
        <button
          className={`${styles.subButton} ${isMapActive ? styles.subButtonActive : ''}`}
          onClick={() => handleNavigate('/map')}
          aria-label="지도"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 2L3 5V22L9 19L15 22L21 19V2L15 5L9 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9 2V19" stroke="white" strokeWidth="2" />
            <path d="M15 5V22" stroke="white" strokeWidth="2" />
          </svg>
        </button>
        <button
          className={`${styles.subButton} ${isBoothsActive ? styles.subButtonActive : ''}`}
          onClick={() => handleNavigate('/booths')}
          aria-label="부스 목록"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* 메인 토글 버튼 */}
      <button
        className={`${styles.mainButton} ${open ? styles.mainButtonOpen : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="#17171C" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 6L18 18" stroke="#17171C" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="2" fill="#17171C" />
            <circle cx="12" cy="12" r="2" fill="#17171C" />
            <circle cx="12" cy="18" r="2" fill="#17171C" />
          </svg>
        )}
      </button>
    </div>
  )
}
