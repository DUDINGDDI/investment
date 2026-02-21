import { useEffect, useState, useRef } from 'react'
import styles from './AnnouncementBanner.module.css'

const DISMISS_KEY = 'announcement_dismissed_at'

function getSseUrl() {
  const base = import.meta.env.VITE_API_URL || '/api'
  return `${base}/results/announce`
}

export default function AnnouncementBanner() {
  const [message, setMessage] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [dismissed, setDismissed] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(getSseUrl())
    eventSourceRef.current = es

    es.addEventListener('announcement', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        const msg = data.message || ''
        const ua = data.updatedAt || ''
        setMessage(msg)
        setUpdatedAt(ua)

        if (msg && ua) {
          const dismissedAt = localStorage.getItem(DISMISS_KEY)
          setDismissed(dismissedAt === ua)
        } else {
          setDismissed(false)
        }
      } catch {
        // 파싱 실패 시 무시
      }
    })

    es.addEventListener('cleared', () => {
      setMessage('')
      setUpdatedAt('')
      setDismissed(false)
      setPopupOpen(false)
    })

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.setItem(DISMISS_KEY, updatedAt)
    setDismissed(true)
  }

  if (!message || !updatedAt || dismissed) return null

  return (
    <>
      <div className={styles.banner} onClick={() => setPopupOpen(true)}>
        <span className={styles.icon}>📢</span>
        <p className={styles.message}>{message}</p>
        <button className={styles.closeBtn} onClick={handleDismiss} aria-label="닫기">
          ✕
        </button>
      </div>

      {popupOpen && (
        <div className={styles.overlay} onClick={() => setPopupOpen(false)}>
          <div className={styles.popup} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <span className={styles.popupIcon}>📢</span>
              <h2 className={styles.popupTitle}>공지사항</h2>
              <button className={styles.popupCloseBtn} onClick={() => setPopupOpen(false)} aria-label="닫기">
                ✕
              </button>
            </div>
            <div className={styles.popupBody}>
              <p className={styles.popupMessage}>{message}</p>
            </div>
            <button className={styles.popupConfirmBtn} onClick={() => setPopupOpen(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </>
  )
}
