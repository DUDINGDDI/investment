import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockApi } from '../api'
import type { StockHoldingResponse } from '../types'
import styles from './StockHomePage.module.css'

function formatStockAmount(n: number) {
  return n.toLocaleString('ko-KR')
}

function DonutChart({ holdings }: { holdings: StockHoldingResponse[] }) {
  const total = holdings.reduce((sum, h) => sum + h.amount, 0)
  if (total === 0) return null

  const size = 180
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const segments = holdings.reduce<(StockHoldingResponse & { ratio: number; offset: number })[]>((acc, h) => {
    const ratio = h.amount / total
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].ratio : 0
    acc.push({ ...h, ratio, offset })
    return acc
  }, [])

  return (
    <div className={styles.chartContainer}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.themeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.ratio * circumference} ${circumference}`}
            strokeDashoffset={-seg.offset * circumference}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        ))}
      </svg>
      <div className={styles.chartCenter}>
        <p className={styles.chartTotal}>{formatStockAmount(total)}</p>
        <p className={styles.chartLabel}>총 보유</p>
      </div>
    </div>
  )
}

export default function StockHomePage() {
  const [holdings, setHoldings] = useState<StockHoldingResponse[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    stockApi.getMy().then(res => setHoldings(res.data))
  }, [])

  const totalHolding = holdings.reduce((sum, h) => sum + h.amount, 0)
  const sorted = [...holdings].sort((a, b) => b.amount - a.amount)

  return (
    <div className={styles.container}>
      {sorted.length > 0 && <DonutChart holdings={sorted} />}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>내 주식 현황</h3>
        </div>

        {sorted.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>아직 보유한 주식이 없어요</p>
            <button className={styles.startBtn} onClick={() => navigate('/stocks/booths')}>
              부스 둘러보기
            </button>
          </div>
        ) : (
          <div className={styles.investList}>
            {sorted.map((h, i) => {
              const ratio = totalHolding > 0 ? ((h.amount / totalHolding) * 100).toFixed(1) : '0'
              return (
                <div
                  key={h.boothId}
                  className={`${styles.investItem} stagger-item`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => navigate(`/stocks/booths/${h.boothId}`)}
                >
                  <div className={styles.colorDot} style={{ background: h.themeColor }} />
                  <div className={styles.boothIcon} style={{ background: h.themeColor + '30' }}>
                    <span>{h.logoEmoji}</span>
                  </div>
                  <div className={styles.investInfo}>
                    <p className={styles.boothName}>{h.boothName}</p>
                    <p className={styles.ratio}>{ratio}%</p>
                  </div>
                  <p className={styles.investAmount}>{formatStockAmount(h.amount)}원</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
