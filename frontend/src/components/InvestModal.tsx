import { useState, useEffect, useRef } from 'react'
import { formatKorean } from '../utils/format'
import styles from './InvestModal.module.css'

interface Props {
  type: 'invest' | 'withdraw'
  boothName: string
  maxAmount: number
  onConfirm: (amount: number) => void
  onClose: () => void
}

const QUICK_AMOUNTS = [
  { label: '500', value: 5_000_000 },
  { label: '1000', value: 10_000_000 },
  { label: '2000', value: 20_000_000 },
  { label: '3000', value: 30_000_000 },
]

export default function InvestModal({ type, boothName, maxAmount, onConfirm, onClose }: Props) {
  const [inputValue, setInputValue] = useState('')
  const sheetRef = useRef<HTMLDivElement>(null)
  const amount = (parseInt(inputValue, 10) || 0) * 10_000

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const handleResize = () => {
      if (sheetRef.current) {
        const keyboardH = window.innerHeight - vv.height
        sheetRef.current.style.transform = `translateY(-${keyboardH}px)`
      }
    }
    vv.addEventListener('resize', handleResize)
    return () => vv.removeEventListener('resize', handleResize)
  }, [])

  const isInvest = type === 'invest'
  const title = isInvest ? '투자하기' : '철회하기'
  const overMax = amount > maxAmount

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(v)
  }

  const handleQuick = (value: number) => {
    const manwon = value / 10_000
    const current = parseInt(inputValue, 10) || 0
    const next = current + manwon
    const maxManwon = Math.floor(maxAmount / 10_000)
    setInputValue(String(Math.min(next, maxManwon)))
  }

  const isDisabled = amount === 0 || overMax

  return (
    <div className={styles.overlay} onMouseDown={onClose} onTouchStart={onClose}>
      <div className={styles.sheet} ref={sheetRef} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <h3 className={styles.title}>{boothName}</h3>
        <p className={styles.subtitle}>
          {isInvest ? '투자할 금액을 입력하세요' : '철회할 금액을 입력하세요'}
        </p>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{isInvest ? '투자 가능' : '철회 가능'}</span>
          <span className={styles.infoValue}>{formatKorean(maxAmount)}원</span>
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputWrap}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.amountInput}
              placeholder="0"
              value={inputValue}
              onChange={handleInput}
            />
            <span className={styles.inputUnit}>만원</span>
          </div>
          {amount > 0 && (
            <p className={styles.amountPreview}>{formatKorean(amount)}원</p>
          )}
          {overMax && (
            <p className={styles.errorText}>
              {isInvest ? '잔액이 부족합니다' : '철회 가능 금액을 초과했습니다'}
            </p>
          )}
        </div>

        <div className={styles.quickBtns}>
          {QUICK_AMOUNTS.map(q => (
            <button
              key={q.label}
              className={styles.quickBtn}
              onClick={() => handleQuick(q.value)}
            >
              +{q.label}만
            </button>
          ))}
          <button
            className={styles.quickBtnReset}
            onClick={() => setInputValue('')}
          >
            초기화
          </button>
        </div>

        <button
          className={`${styles.confirmBtn} ${isInvest ? styles.investBtn : styles.withdrawBtn}`}
          onClick={() => onConfirm(amount)}
          disabled={isDisabled}
        >
          {amount > 0 ? `${formatKorean(amount)}원 ${title}` : title}
        </button>
      </div>
    </div>
  )
}
