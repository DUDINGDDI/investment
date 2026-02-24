import styles from './QrPage.module.css'

export default function QrPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>QR 스캔</h2>
        <p className={styles.subtitle}>QR 코드를 스캔해보세요</p>
      </div>
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>📷</span>
        <p className={styles.emptyText}>준비 중입니다</p>
      </div>
    </div>
  )
}
