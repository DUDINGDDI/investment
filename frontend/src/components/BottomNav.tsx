import { useLocation, useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

const tabs = [
  { path: '/home', label: '홈', icon: 'home' },
  { path: '/booths', label: '부스', icon: 'booths' },
  { path: '/history', label: '이력', icon: 'history' },
  { path: '/result', label: '결과', icon: 'result' },
]

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? '#4593FC' : '#8C8C96'

  switch (icon) {
    case 'home':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={active ? color + '30' : 'none'} />
        </svg>
      )
    case 'booths':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill={active ? color + '30' : 'none'} />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill={active ? color + '30' : 'none'} />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill={active ? color + '30' : 'none'} />
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill={active ? color + '30' : 'none'} />
        </svg>
      )
    case 'history':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={active ? color + '30' : 'none'} />
          <path d="M12 7V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'result':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8 21V14H4L12 3L20 14H16V21H8Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={active ? color + '30' : 'none'} />
        </svg>
      )
    default:
      return null
  }
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/booths') {
      return location.pathname.startsWith('/booths')
    }
    return location.pathname === path
  }

  return (
    <nav className={styles.nav}>
      {tabs.map(tab => (
        <button
          key={tab.path}
          className={`${styles.tab} ${isActive(tab.path) ? styles.active : ''}`}
          onClick={() => navigate(tab.path)}
        >
          <NavIcon icon={tab.icon} active={isActive(tab.path)} />
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
