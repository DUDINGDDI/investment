import { useNavigate, useLocation } from 'react-router-dom'
import styles from './BottomNavBar.module.css'

const navItems = [
  {
    label: 'AM 투자',
    path: '/stocks',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7V12L9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    isActive: (p: string) => p.startsWith('/stocks'),
  },
  {
    label: 'PM 투자',
    path: '/home',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    isActive: (p: string) =>
      ['/home', '/booths', '/history', '/result'].some(r =>
        r === '/booths' ? p.startsWith('/booths') : p === r
      ),
  },
  {
    label: 'QR',
    path: '/qr',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <rect x="16" y="16" width="3" height="3" fill="currentColor" />
        <rect x="14" y="14" width="2" height="2" fill="currentColor" />
        <rect x="19" y="14" width="2" height="2" fill="currentColor" />
        <rect x="14" y="19" width="2" height="2" fill="currentColor" />
      </svg>
    ),
    isActive: (p: string) => p === '/qr',
    isCenter: true,
  },
  {
    label: '지도',
    path: '/map',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 2L3 5V22L9 19L15 22L21 19V2L15 5L9 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 2V19" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 5V22" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    isActive: (p: string) => p.startsWith('/map'),
  },
  {
    label: '마이페이지',
    path: '/mypage',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    isActive: (p: string) => p === '/mypage',
  },
]

export default function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className={styles.navBar}>
      {navItems.map((item) => {
        const active = item.isActive(location.pathname)
        return (
          <button
            key={item.path}
            className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${item.isCenter ? styles.navItemCenter : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            {item.isCenter ? (
              <div className={styles.centerButton}>
                {item.icon}
              </div>
            ) : (
              <>
                <div className={styles.navIcon}>{item.icon}</div>
                <span className={styles.navLabel}>{item.label}</span>
              </>
            )}
          </button>
        )
      })}
    </nav>
  )
}
