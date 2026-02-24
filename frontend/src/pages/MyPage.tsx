import styles from './MyPage.module.css'

export default function MyPage() {
  const userName = localStorage.getItem('userName') || ''

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>마이페이지</h2>
        <p className={styles.subtitle}>{userName}님, 안녕하세요</p>
      </div>
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>👤</span>
        <p className={styles.emptyText}>준비 중입니다</p>
      </div>
    </div>
  )
}
