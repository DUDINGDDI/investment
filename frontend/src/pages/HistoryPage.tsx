import { useEffect, useState } from 'react'
import { investmentApi } from '../api'
import type { InvestmentHistoryResponse } from '../types'
import styles from './HistoryPage.module.css'

function formatWon(n: number) {
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

export default function HistoryPage() {
  const [history, setHistory] = useState<InvestmentHistoryResponse[]>([])

  useEffect(() => {
    investmentApi.getHistory().then(res => setHistory(res.data))
  }, [])

  // 날짜별 그룹핑
  const grouped: { label: string; items: InvestmentHistoryResponse[] }[] = []
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
        <h2 className={styles.title}>투자 이력</h2>
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <p>투자 이력이 없습니다</p>
        </div>
      ) : (
        grouped.map((group, gi) => (
          <div key={gi} className={styles.group}>
            <p className={styles.dateLabel}>{group.label}</p>
            {group.items.map((item, i) => {
              const isInvest = item.type === 'INVEST'
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
                      <span className={`${styles.typeBadge} ${isInvest ? styles.investBadge : styles.withdrawBadge}`}>
                        {isInvest ? '투자' : '철회'}
                      </span>
                      <span className={styles.time}>{formatTime(item.createdAt)}</span>
                    </div>
                  </div>
                  <p className={`${styles.amount} ${isInvest ? styles.investAmount : styles.withdrawAmount}`}>
                    {isInvest ? '+' : '-'}{formatWon(item.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
