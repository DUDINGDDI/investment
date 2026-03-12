import { useNavigate } from 'react-router-dom'
import cjLogoDark from '../assets/logo/CJ_Group_White Wordtype.png'
import styles from './AppHeader.module.css'

const cjLogoLight = '/CJ_Group_Full Color.png'

export default function AppHeader() {
  const navigate = useNavigate()

  return (
    <header className={styles.header} onClick={() => navigate('/stocks')} style={{ cursor: 'pointer' }}>
      <picture>
        <source srcSet={cjLogoLight} media="(prefers-color-scheme: light)" />
        <img src={cjLogoDark} alt="CJ" className={styles.logo} />
      </picture>
      <h1 className={styles.title}>2026 ONLYONE FAIR</h1>
    </header>
  )
}
