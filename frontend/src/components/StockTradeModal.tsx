import { useState } from 'react'
import styles from './StockTradeModal.module.css'

interface Props {
  type: 'buy' | 'sell'
  boothName: string
  maxAmount: number
  onConfirm: (amount: number) => void
  onClose: () => void
}

const UNIT = 10_000_000

const AMOUNTS = [
  { label: '+1천만', value: UNIT },
  { label: '+2천만', value: UNIT * 2 },
  { label: '+5천만', value: UNIT * 5 },
  { label: '+1억', value: UNIT * 10 },
]

function formatStockAmount(n: number): string {
  return n.toLocaleString('ko-KR')
}

export default function StockTradeModal({ type, boothName, maxAmount, onConfirm, onClose }: Props) {
  const [amount, setAmount] = useState(0)
  const [inputValue, setInputValue] = useState('')

  const isBuy = type === 'buy'
  const title = isBuy ? '투자하기' : '철회하기'
  const maxLabel = isBuy ? '보유 잔액' : '투자 금액'

  const addAmount = (value: number) => {
    setAmount(prev => Math.min(prev + value, maxAmount))
  }

  const resetAmount = () => {
    setAmount(0)
    setInputValue('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(raw)
  }

  const handleInputApply = () => {
    const n = parseInt(inputValue, 10)
    if (!n || n <= 0) return
    const value = n * UNIT
    if (value > maxAmount) {
      setAmount(maxAmount - (maxAmount % UNIT))
    } else {
      setAmount(value)
    }
    setInputValue('')
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleInputApply()
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <h3 className={styles.title}>{boothName}</h3>
        <p className={styles.subtitle}>
          {isBuy ? '투자할 금액을 선택하세요' : '철회할 금액을 선택하세요'}
        </p>
        <p className={styles.maxLabel}>
          {maxLabel}: {formatStockAmount(maxAmount)}원
        </p>

        <div className={styles.amountDisplay}>
          <span className={styles.amountValue}>{formatStockAmount(amount)}</span>
          <span className={styles.amountUnit}> 원</span>
        </div>

        <div className={styles.directInput}>
          <input
            type="text"
            inputMode="numeric"
            className={styles.input}
            placeholder="직접 입력"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          <span className={styles.inputSuffix}>천만원</span>
          <button className={styles.inputBtn} onClick={handleInputApply} disabled={!inputValue}>
            적용
          </button>
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
          {formatStockAmount(amount)}원 {title}
        </button>
      </div>
    </div>
  )
}
