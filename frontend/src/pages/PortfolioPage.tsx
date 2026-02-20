import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, investmentApi } from '../api'
import type { UserResponse, InvestmentResponse } from '../types'
import styles from './PortfolioPage.module.css'

function formatCoin(n: number) {
  return n.toLocaleString('ko-KR')
}

function DonutChart({ investments }: { investments: InvestmentResponse[] }) {
  const total = investments.reduce((sum, inv) => sum + inv.amount, 0)
  if (total === 0) return null

  const size = 180
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let accumulated = 0
  const segments = investments.map(inv => {
    const ratio = inv.amount / total
    const offset = accumulated
    accumulated += ratio
    return { ...inv, ratio, offset }
  })

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
        <p className={styles.chartTotal}>{formatCoin(total)}</p>
        <p className={styles.chartLabel}>총 투자</p>
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [investments, setInvestments] = useState<InvestmentResponse[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    userApi.getMe().then(res => setUser(res.data))
    investmentApi.getMy().then(res => setInvestments(res.data))
  }, [])

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalAsset = (user?.balance || 0) + totalInvested
  const sorted = [...investments].sort((a, b) => b.amount - a.amount)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>포트폴리오</h2>
      </div>

      <div className={styles.assetSummary}>
        <div className={styles.assetRow}>
          <span className={styles.assetLabel}>총 자산</span>
          <span className={styles.assetValue}>{formatCoin(totalAsset)} 코인</span>
        </div>
        <div className={styles.assetDetail}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>보유 코인</span>
            <span className={styles.detailValue}>{formatCoin(user?.balance || 0)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>투자 코인</span>
            <span className={styles.detailValue}>{formatCoin(totalInvested)}</span>
          </div>
        </div>
      </div>

      {sorted.length > 0 && <DonutChart investments={sorted} />}

      <div className={styles.list}>
        {sorted.length === 0 ? (
          <div className={styles.emptyState}>
            <p>투자 내역이 없습니다</p>
          </div>
        ) : (
          sorted.map((inv, i) => {
            const ratio = totalInvested > 0 ? ((inv.amount / totalInvested) * 100).toFixed(1) : '0'
            return (
              <div
                key={inv.boothId}
                className={`${styles.item} stagger-item`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/booths/${inv.boothId}`)}
              >
                <div className={styles.colorDot} style={{ background: inv.themeColor }} />
                <div className={styles.icon} style={{ background: inv.themeColor + '20' }}>
                  <span>{inv.logoEmoji}</span>
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{inv.boothName}</p>
                  <p className={styles.ratio}>{ratio}%</p>
                </div>
                <p className={styles.amount}>{formatCoin(inv.amount)} 코인</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
