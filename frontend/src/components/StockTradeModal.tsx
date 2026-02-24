import { useState } from 'react'
import styles from './StockTradeModal.module.css'

interface Props {
  type: 'buy' | 'sell'
  boothName: string
  maxAmount: number
  onConfirm: (amount: number) => void
  onClose: () => void
}

const AMOUNTS = [
  { label: '+1억', value: 100000000 },
  { label: '+10억', value: 1000000000 },
  { label: '+50억', value: 5000000000 },
  { label: '+100억', value: 10000000000 },
]

function formatStockAmount(n: number): string {
  if (n >= 1_0000_0000_0000) {
    return `${(n / 1_0000_0000_0000).toFixed(1)}조`
  }
  if (n >= 1_0000_0000) {
    return `${Math.floor(n / 1_0000_0000)}억`
  }
  if (n >= 1_0000) {
    return `${Math.floor(n / 1_0000)}만`
  }
  return n.toLocaleString('ko-KR')
}

export default function StockTradeModal({ type, boothName, maxAmount, onConfirm, onClose }: Props) {
  const [amount, setAmount] = useState(0)

  const isBuy = type === 'buy'
  const title = isBuy ? '매수하기' : '매도하기'
  const maxLabel = isBuy ? '보유 잔액' : '보유 금액'

  const addAmount = (value: number) => {
    setAmount(prev => Math.min(prev + value, maxAmount))
  }

  const resetAmount = () => setAmount(0)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <h3 className={styles.title}>{boothName}</h3>
        <p className={styles.subtitle}>
          {isBuy ? '매수할 금액을 선택하세요' : '매도할 금액을 선택하세요'}
        </p>
        <p className={styles.maxLabel}>
          {maxLabel}: {formatStockAmount(maxAmount)}
        </p>

        <div className={styles.amountDisplay}>
          <span className={styles.amountValue}>{formatStockAmount(amount)}</span>
          <span className={styles.amountUnit}> 원</span>
        </div>

        <div className={styles.pills}>
          {AMOUNTS.map(a => (
            <button
              key={a.value}
              className={styles.pill}
              onClick={() => addAmount(a.value)}
              disabled={amount + a.value > maxAmount}
            >
              {a.label}
            </button>
          ))}
          <button className={styles.pillReset} onClick={resetAmount}>
            초기화
          </button>
        </div>

        <button
          className={`${styles.confirmBtn} ${isBuy ? styles.buyBtn : styles.sellBtn}`}
          onClick={() => onConfirm(amount)}
          disabled={amount === 0}
        >
          {formatStockAmount(amount)} {title}
        </button>
      </div>
    </div>
  )
}
