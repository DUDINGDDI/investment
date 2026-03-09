import { useState } from 'react'
import { formatKorean } from '../utils/format'
import styles from './StockTradeModal.module.css'

interface Props {
  type: 'buy' | 'sell'
  boothName: string
  maxAmount: number
  currentHolding?: number
  onConfirm: (amount: number) => void
  onClose: () => void
}

const QUICK_AMOUNTS = [
  { label: '500', value: 5_000_000 },
  { label: '1000', value: 10_000_000 },
  { label: '2000', value: 20_000_000 },
  { label: '3000', value: 30_000_000 },
]

const MAX_PER_BOOTH = 30_000_000

export default function StockTradeModal({ type, boothName, maxAmount, currentHolding = 0, onConfirm, onClose }: Props) {
  const [inputValue, setInputValue] = useState('')
  const amount = (parseInt(inputValue, 10) || 0) * 10_000

  const isBuy = type === 'buy'
  const title = isBuy ? '투자하기' : '철회하기'
  const overMax = amount > maxAmount
  const overLimit = isBuy && (currentHolding + amount) > MAX_PER_BOOTH

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(v)
  }

  const handleQuick = (value: number) => {
    const manwon = value / 10_000
    const current = parseInt(inputValue, 10) || 0
    const next = current + manwon

    if (isBuy) {
      const maxManwon = Math.floor(Math.min(maxAmount, MAX_PER_BOOTH - currentHolding) / 10_000)
      setInputValue(String(Math.min(next, maxManwon)))
    } else {
      const maxManwon = Math.floor(maxAmount / 10_000)
      setInputValue(String(Math.min(next, maxManwon)))
    }
  }

  const isDisabled = amount === 0 || overMax || overLimit

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <h3 className={styles.title}>{boothName}</h3>
        <p className={styles.subtitle}>
          {isBuy ? '투자할 금액을 입력하세요' : '철회할 금액을 입력하세요'}
        </p>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{isBuy ? '투자 가능' : '철회 가능'}</span>
          <span className={styles.infoValue}>{formatKorean(maxAmount)}원</span>
        </div>
        {isBuy && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>현재 투자금</span>
            <span className={styles.infoValue}>{formatKorean(currentHolding)}원</span>
          </div>
        )}

        <div className={styles.inputArea}>
          <div className={styles.inputWrap}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.amountInput}
              placeholder="0"
              value={inputValue}
              onChange={handleInput}
              autoFocus
            />
            <span className={styles.inputUnit}>만원</span>
          </div>
          {amount > 0 && (
            <p className={styles.amountPreview}>{formatKorean(amount)}원</p>
          )}
          {overMax && (
            <p className={styles.errorText}>
              {isBuy ? '잔액이 부족합니다' : '철회 가능 금액을 초과했습니다'}
            </p>
          )}
          {!overMax && overLimit && (
            <p className={styles.errorText}>
              부스당 최대 투자 금액은 3,000만원입니다
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
          className={`${styles.confirmBtn} ${isBuy ? styles.buyBtn : styles.sellBtn}`}
          onClick={() => onConfirm(amount)}
          disabled={isDisabled}
        >
          {amount > 0 ? `${formatKorean(amount)}원 ${title}` : title}
        </button>
      </div>
    </div>
  )
}
