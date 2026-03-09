import { useNavigate } from 'react-router-dom'
import cjLogo from '../assets/logo/CJ_Group_White Wordtype.png'
import styles from './AppHeader.module.css'

export default function AppHeader() {
  const navigate = useNavigate()

  return (
    <header className={styles.header} onClick={() => navigate('/stocks')} style={{ cursor: 'pointer' }}>
      <img src={cjLogo} alt="CJ" className={styles.logo} />
      <h1 className={styles.title}>2026 ONLYONE FAIR</h1>
    </header>
  )
}
