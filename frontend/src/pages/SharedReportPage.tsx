import { useState, useEffect } from 'react'
import { reportApi } from '../api'
import { useToast } from '../components/ToastContext'
import type { SharedReportResponse } from '../types'
import styles from './SharedReportPage.module.css'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const period = h < 12 ? '오전' : '오후'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${period} ${hour12}:${m}`
}

export default function SharedReportPage() {
  const [reports, setReports] = useState<SharedReportResponse[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    reportApi.getSharedReports()
      .then(res => setReports(res.data))
      .catch(() => showToast('공유 리포트를 불러올 수 없습니다', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>참가자들의 투자 비전</h2>
        <p className={styles.headerSub}>
          {reports.length}명의 참가자가 비전을 공유했습니다
        </p>
      </div>

      {reports.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>&#x1F4AD;</span>
          <p className={styles.emptyText}>아직 공유된 리포트가 없습니다</p>
          <p className={styles.emptySub}>첫 번째로 비전을 공유해보세요!</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {reports.map((r, i) => (
            <div
              key={r.userId}
              className={`${styles.card} ${styles.stagger}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardEmoji}>{r.tendencyEmoji}</span>
                <div className={styles.cardUserInfo}>
                  <p className={styles.cardUserName}>{r.userName}</p>
                  {r.userCompany && (
                    <p className={styles.cardCompany}>{r.userCompany}</p>
                  )}
                </div>
                <div className={styles.cardTendency}>
                  <span className={styles.cardTendencyName}>{r.tendencyName}</span>
                </div>
              </div>
              <p className={styles.cardVision}>{r.vision}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardOneLiner}>{r.tendencyOneLiner}</span>
                <span className={styles.cardTime}>{formatDate(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
