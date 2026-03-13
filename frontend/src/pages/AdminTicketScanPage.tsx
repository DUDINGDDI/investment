import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { adminApi } from '../api'
import { useToast } from '../components/ToastContext'
import styles from './AdminTicketScanPage.module.css'

const TICKET_REGEX = /^ticket:(\d+):(\w+)$/
const TICKET_ALL_REGEX = /^ticket-all:(\d+)$/

const MISSION_LABELS: Record<string, string> = {
  renew: '내일 더 새롭게',
  dream: '꿈을 원대하게',
  result: '반드시 결과로',
  again: '안돼도 다시',
  sincere: '진정성 있게',
  together: '함께하는 하고잡이',
}

interface ScanResult {
  missionId: string
  usedCount?: number
  usedMissions?: string[]
  userName?: string
}

export default function AdminTicketScanPage() {
  const { showToast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const scanner = new Html5Qrcode('ticket-qr-reader')
    scannerRef.current = scanner

    const startPromise = scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (isProcessingRef.current) return
        isProcessingRef.current = true
        handleScan(decodedText)
      },
      () => {}
    ).then(() => {
      if (cancelled) {
        scanner.stop().then(() => scanner.clear()).catch(() => {
          try { scanner.clear() } catch { /* ignore */ }
        })
      } else {
        setIsScanning(true)
      }
    }).catch(() => {
      if (!cancelled) setError('카메라를 사용할 수 없습니다. 카메라 권한을 허용해주세요.')
    })

    return () => {
      cancelled = true
      startPromise.then(() => {}).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScan = async (text: string) => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
        setIsScanning(false)
      }

      // 모든 티켓 일괄 사용
      const allMatch = text.match(TICKET_ALL_REGEX)
      if (allMatch) {
        const userId = Number(allMatch[1])
        const res = await adminApi.useAllTickets(userId)
        setScanResult({ missionId: 'all', usedCount: res.data.usedCount, usedMissions: res.data.usedMissions })
        return
      }

      // 개별 티켓 사용
      const match = text.match(TICKET_REGEX)
      if (!match) {
        showToast('유효하지 않은 티켓 QR 코드입니다', 'error')
        isProcessingRef.current = false
        restartScanner()
        return
      }

      const userId = Number(match[1])
      const missionId = match[2]

      const res = await adminApi.useTicket(userId, missionId)
      setScanResult({ missionId: res.data.missionId })
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
        '티켓 사용 처리에 실패했습니다'
      showToast(errorMsg, 'error')
      isProcessingRef.current = false
      restartScanner()
    }
  }

  const restartScanner = () => {
    if (!scannerRef.current) return
    scannerRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (isProcessingRef.current) return
        isProcessingRef.current = true
        handleScan(decodedText)
      },
      () => {}
    ).then(() => {
      setIsScanning(true)
    }).catch(() => {})
  }

  const handleCloseResult = () => {
    setScanResult(null)
    isProcessingRef.current = false
    restartScanner()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>티켓 스캔</h2>
        <p className={styles.subtitle}>참가자의 티켓 QR 코드를 스캔하세요</p>
      </div>

      {error ? (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>📷</span>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : (
        <div className={styles.scannerWrapper}>
          <div id="ticket-qr-reader" className={styles.scanner} />
          {isScanning && (
            <p className={styles.guideText}>티켓 QR 코드를 프레임 안에 맞춰주세요</p>
          )}
        </div>
      )}

      {scanResult && (
        <div className={styles.overlay} onClick={handleCloseResult}>
          <div className={styles.successModal} onClick={e => e.stopPropagation()}>
            <div className={styles.successIcon}>✅</div>
            <h3 className={styles.successTitle}>사용 처리 완료</h3>
            <p className={styles.successDesc}>
              {scanResult.missionId === 'all'
                ? `키캡 교환권 ${scanResult.usedCount}장이 사용 처리되었습니다.`
                : `${MISSION_LABELS[scanResult.missionId] || scanResult.missionId} 교환권이 사용 처리되었습니다.`}
            </p>
            {scanResult.missionId === 'all' && scanResult.usedMissions && (
              <ul className={styles.usedList}>
                {scanResult.usedMissions.map(id => (
                  <li key={id} className={styles.usedListItem}>
                    {MISSION_LABELS[id] || id}
                  </li>
                ))}
              </ul>
            )}
            <button className={styles.successButton} onClick={handleCloseResult}>
              다음 스캔
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
