import { useNavigate } from 'react-router-dom'
import styles from './PageBackButton.module.css'

interface Props {
  to?: string
  label?: string
  style?: React.CSSProperties
}

export default function PageBackButton({ to, label = '뒤로', style }: Props) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button className={styles.btn} style={style} onClick={handleClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  )
}
