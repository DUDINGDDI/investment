import { useState } from 'react'
import { formatKorean } from '../utils/format'
import styles from './InvestModal.module.css'

interface Props {
  type: 'invest' | 'withdraw'
  boothName: string
  maxAmount: number
  onConfirm: (amount: number) => void
  onClose: () => void
}

const UNIT = 5_000_000

export default function InvestModal({ type, boothName, maxAmount, onConfirm, onClose }: Props) {
  const maxSteps = Math.floor(maxAmount / UNIT)
  const [steps, setSteps] = useState(maxSteps > 0 ? 1 : 0)
  const amount = steps * UNIT

  const isInvest = type === 'invest'
  const title = isInvest ? '투자하기' : '철회하기'

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <h3 className={styles.title}>{boothName}</h3>
        <p className={styles.subtitle}>
          {isInvest ? '투자할 금액을 선택하세요' : '철회할 금액을 선택하세요'}
        </p>
        <p className={styles.maxLabel}>
          {isInvest ? '보유 잔액' : '투자 금액'}: {formatKorean(maxAmount)}원
        </p>

        <div className={styles.stepper}>
          <button
            className={styles.stepperBtn}
            onClick={() => setSteps(prev => prev - 1)}
            disabled={steps <= 1}
          >
            −
          </button>
          <span className={styles.stepperValue}>
            {formatKorean(amount)}원
          </span>
          <button
            className={styles.stepperBtn}
            onClick={() => setSteps(prev => prev + 1)}
            disabled={steps >= maxSteps}
          >
            +
          </button>
        </div>

        <button
          className={`${styles.confirmBtn} ${isInvest ? styles.investBtn : styles.withdrawBtn}`}
          onClick={() => onConfirm(amount)}
          disabled={amount === 0}
        >
          {formatKorean(amount)}원 {title}
        </button>
      </div>
    </div>
  )
}
