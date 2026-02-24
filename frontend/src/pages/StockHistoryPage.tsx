import { useEffect, useState } from 'react'
import { stockApi } from '../api'
import type { StockTradeHistoryResponse } from '../types'
import styles from './StockHistoryPage.module.css'

function formatStockAmount(n: number) {
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1) + '조'
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(0) + '억'
  if (n >= 10_000) return (n / 10_000).toFixed(0) + '만'
  return n.toLocaleString('ko-KR')
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getDateKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const key = getDateKey(dateStr)

  if (key === todayKey) return '오늘'

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`
  if (key === yKey) return '어제'

  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function StockHistoryPage() {
  const [history, setHistory] = useState<StockTradeHistoryResponse[]>([])

  useEffect(() => {
    stockApi.getHistory().then(res => setHistory(res.data))
  }, [])

  // 날짜별 그룹핑
  const grouped: { label: string; items: StockTradeHistoryResponse[] }[] = []
  let currentKey = ''

  for (const item of history) {
    const key = getDateKey(item.createdAt)
    if (key !== currentKey) {
      currentKey = key
      grouped.push({ label: getDateLabel(item.createdAt), items: [] })
    }
    grouped[grouped.length - 1].items.push(item)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>거래 이력</h2>
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <p>거래 이력이 없습니다</p>
        </div>
      ) : (
        grouped.map((group, gi) => (
          <div key={gi} className={styles.group}>
            <p className={styles.dateLabel}>{group.label}</p>
            {group.items.map((item, i) => {
              const isBuy = item.type === 'BUY'
              return (
                <div
                  key={item.id}
                  className={`${styles.item} stagger-item`}
                  style={{ animationDelay: `${(gi * 3 + i) * 0.04}s` }}
                >
                  <div className={styles.icon} style={{ background: item.themeColor + '30' }}>
                    <span>{item.logoEmoji}</span>
                  </div>
                  <div className={styles.info}>
                    <p className={styles.name}>{item.boothName}</p>
                    <div className={styles.meta}>
                      <span className={`${styles.typeBadge} ${isBuy ? styles.buyBadge : styles.sellBadge}`}>
                        {isBuy ? '매수' : '매도'}
                      </span>
                      <span className={styles.priceAtTrade}>{formatStockAmount(item.priceAtTrade)}원</span>
                      <span className={styles.time}>{formatTime(item.createdAt)}</span>
                    </div>
                  </div>
                  <div className={styles.amountArea}>
                    <p className={`${styles.amount} ${isBuy ? styles.buyAmount : styles.sellAmount}`}>
                      {isBuy ? '+' : '-'}{formatStockAmount(item.amount)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
