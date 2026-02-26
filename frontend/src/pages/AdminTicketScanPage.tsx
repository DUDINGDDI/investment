import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { adminApi } from '../api'
import { useToast } from '../components/ToastContext'
import styles from './AdminTicketScanPage.module.css'

const TICKET_REGEX = /^ticket:(\d+):(\w+)$/

interface ScanResult {
  missionId: string
  userName?: string
}

export default function AdminTicketScanPage() {
  const navigate = useNavigate()
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

      const match = text.match(TICKET_REGEX)
      if (!match) {
        showToast('유효하지 않은 이용권 QR 코드입니다', 'error')
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
        '이용권 사용 처리에 실패했습니다'
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
        <button className={styles.backBtn} onClick={() => navigate('/admin')}>
          ← 돌아가기
        </button>
        <h2 className={styles.title}>이용권 스캔</h2>
        <p className={styles.subtitle}>참가자의 이용권 QR 코드를 스캔하세요</p>
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
            <p className={styles.guideText}>이용권 QR 코드를 프레임 안에 맞춰주세요</p>
          )}
        </div>
      )}

      {scanResult && (
        <div className={styles.overlay} onClick={handleCloseResult}>
          <div className={styles.successModal} onClick={e => e.stopPropagation()}>
            <div className={styles.successIcon}>✅</div>
            <h3 className={styles.successTitle}>사용 처리 완료</h3>
            <p className={styles.successDesc}>
              이용권 [{scanResult.missionId}] 이(가) 정상적으로 사용 처리되었습니다.
            </p>
            <button className={styles.successButton} onClick={handleCloseResult}>
              다음 스캔
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
