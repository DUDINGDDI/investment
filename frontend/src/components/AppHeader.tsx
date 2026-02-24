import { useNavigate } from 'react-router-dom'
import cjLogo from '../assets/logo/CJ_Group_White Wordtype.png'
import styles from './AppHeader.module.css'

export default function AppHeader() {
  const navigate = useNavigate()

  return (
    <header className={styles.header}>
      <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <img src={cjLogo} alt="CJ" className={styles.logo} />
      <h1 className={styles.title}>ONLYONE FAIR</h1>
    </header>
  )
}
