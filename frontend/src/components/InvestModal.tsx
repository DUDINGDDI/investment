import { useState } from 'react'
import styles from './InvestModal.module.css'

interface Props {
  type: 'invest' | 'withdraw'
  boothName: string
  maxAmount: number
  onConfirm: (amount: number) => void
  onClose: () => void
}

const AMOUNTS = [
  { label: '+1만', value: 10000 },
  { label: '+5만', value: 50000 },
  { label: '+10만', value: 100000 },
  { label: '+50만', value: 500000 },
]

function formatNumber(n: number) {
  return n.toLocaleString('ko-KR')
}

export default function InvestModal({ type, boothName, maxAmount, onConfirm, onClose }: Props) {
  const [amount, setAmount] = useState(0)

  const isInvest = type === 'invest'
  const title = isInvest ? '투자하기' : '철회하기'

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
          {isInvest ? '투자할 금액을 선택하세요' : '철회할 금액을 선택하세요'}
        </p>
        <p className={styles.maxLabel}>
          {isInvest ? '보유 잔액' : '투자 금액'}: {formatNumber(maxAmount)}원
        </p>

        <div className={styles.amountDisplay}>
          <span className={styles.amountValue}>{formatNumber(amount)}</span>
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
          className={`${styles.confirmBtn} ${isInvest ? styles.investBtn : styles.withdrawBtn}`}
          onClick={() => onConfirm(amount)}
          disabled={amount === 0}
        >
          {formatNumber(amount)}원 {title}
        </button>
      </div>
    </div>
  )
}
