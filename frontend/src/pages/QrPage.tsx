import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { visitApi, missionApi } from '../api'
import { useToast } from '../components/ToastContext'
import { useMissions } from '../components/MissionContext'
import styles from './QrPage.module.css'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TOGETHER_SPACE_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function QrPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { syncFromServer } = useMissions()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTogetherSuccess, setShowTogetherSuccess] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const scanner = new Html5Qrcode('qr-reader')
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
      startPromise.then(() => {
        // start가 완료된 후 정리 — then 내부에서 이미 처리됨
      }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScan = async (scannedUuid: string) => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
        setIsScanning(false)
      }

      if (!UUID_REGEX.test(scannedUuid)) {
        showToast('유효하지 않은 QR 코드입니다', 'error')
        isProcessingRef.current = false
        restartScanner()
        return
      }

      // 특별 공간 QR: together 미션 완료
      if (scannedUuid.toLowerCase() === TOGETHER_SPACE_UUID.toLowerCase()) {
        await missionApi.completeTogether(scannedUuid)
        await syncFromServer()
        window.dispatchEvent(new Event('balance-changed'))
        setShowTogetherSuccess(true)
        return
      }

      // 일반 부스 QR: 부스 방문 처리
      const res = await visitApi.visit({ boothUuid: scannedUuid })
      showToast(res.data.message, 'success')
      navigate(`/stocks/booths/${res.data.boothId}?tab=review`)
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
        '처리에 실패했습니다'
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>QR 스캔</h2>
        <p className={styles.subtitle}>부스의 QR 코드를 스캔하여 방문을 기록하세요</p>
      </div>

      {error ? (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>📷</span>
          <p className={styles.errorText}>{error}</p>
        </div>
      ) : (
        <div className={styles.scannerWrapper}>
          <div id="qr-reader" className={styles.scanner} />
          {isScanning && (
            <p className={styles.guideText}>QR 코드를 프레임 안에 맞춰주세요</p>
          )}
        </div>
      )}

      {/* together 미션 성공 모달 */}
      {showTogetherSuccess && (
        <div className={styles.overlay} onClick={() => { setShowTogetherSuccess(false); navigate('/stocks') }}>
          <div className={styles.successModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.successTitle}>미션 완료!</h3>
            <p className={styles.successDesc}>
              '함께하는 하고잡이' 미션을 완료했습니다
            </p>
            <p className={styles.rewardText}>
              투자금 +1억원이 추가 지급되었습니다!
            </p>
            <button
              className={styles.successButton}
              onClick={() => { setShowTogetherSuccess(false); navigate('/stocks') }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
