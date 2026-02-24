import { useEffect, useState, useRef, useCallback } from 'react'
import styles from './AnnouncementBanner.module.css'

const DISMISS_KEY = 'announcement_dismissed_at'

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    // AudioContext 사용 불가 시 무시
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function showBrowserNotification(msg: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('📢 공지사항', { body: msg, tag: 'announcement' })
  }
}

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
  const isFirstLoad = useRef(true)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const notify = useCallback((msg: string) => {
    playNotificationSound()
    showBrowserNotification(msg)
  }, [])

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
          const alreadyDismissed = dismissedAt === ua
          setDismissed(alreadyDismissed)

          // 새 공지일 때만 알림 (첫 로드의 기존 공지는 제외)
          if (!isFirstLoad.current && !alreadyDismissed) {
            notify(msg)
          }
        } else {
          setDismissed(false)
        }
        isFirstLoad.current = false
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
