import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, investmentApi } from '../api'
import type { UserResponse, InvestmentResponse } from '../types'
import styles from './HomePage.module.css'

function formatWon(n: number) {
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
        <p className={styles.chartTotal}>{formatWon(total)}</p>
        <p className={styles.chartLabel}>총 투자</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [investments, setInvestments] = useState<InvestmentResponse[]>([])
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''

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
        <p className={styles.greeting}>{userName}님의 투자</p>
        <div className={styles.balanceSection}>
          <p className={styles.balanceLabel}>보유 잔액</p>
          <p className={styles.balanceValue}>
            {user ? formatWon(user.balance) : '-'} <span className={styles.unit}>원</span>
          </p>
        </div>
      </div>

      <div className={styles.assetSummary}>
        <div className={styles.assetRow}>
          <span className={styles.assetLabel}>총 자산</span>
          <span className={styles.assetValue}>{formatWon(totalAsset)}원</span>
        </div>
        <div className={styles.assetDetail}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>보유 금액</span>
            <span className={styles.detailValue}>{formatWon(user?.balance || 0)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>투자 금액</span>
            <span className={styles.detailValue}>{formatWon(totalInvested)}</span>
          </div>
        </div>
      </div>

      {sorted.length > 0 && <DonutChart investments={sorted} />}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>내 투자 현황</h3>
        </div>

        {sorted.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>아직 투자한 부스가 없어요</p>
            <button className={styles.startBtn} onClick={() => navigate('/booths')}>
              부스 둘러보기
            </button>
          </div>
        ) : (
          <div className={styles.investList}>
            {sorted.map((inv, i) => {
              const ratio = totalInvested > 0 ? ((inv.amount / totalInvested) * 100).toFixed(1) : '0'
              return (
                <div
                  key={inv.boothId}
                  className={`${styles.investItem} stagger-item`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => navigate(`/booths/${inv.boothId}`)}
                >
                  <div className={styles.colorDot} style={{ background: inv.themeColor }} />
                  <div className={styles.boothIcon} style={{ background: inv.themeColor + '30' }}>
                    <span>{inv.logoEmoji}</span>
                  </div>
                  <div className={styles.investInfo}>
                    <p className={styles.boothName}>{inv.boothName}</p>
                    <p className={styles.ratio}>{ratio}%</p>
                  </div>
                  <p className={styles.investAmount}>{formatWon(inv.amount)}원</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
