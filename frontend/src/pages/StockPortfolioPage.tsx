import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockApi } from '../api'
import { formatKorean } from '../utils/format'
import type { StockHoldingResponse } from '../types'
import styles from './StockPortfolioPage.module.css'

const COLORS = ['#6C5CE7', '#4593FC', '#00D68F', '#F5C842', '#F04452', '#FF8A65', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6']

export default function StockPortfolioPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number>(0)
  const [holdings, setHoldings] = useState<StockHoldingResponse[]>([])

  useEffect(() => {
    stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
    stockApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = () => {
      stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
      stockApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
    }
    window.addEventListener('balance-changed', handler)
    return () => window.removeEventListener('balance-changed', handler)
  }, [])

  const totalHolding = holdings.reduce((sum, h) => sum + h.amount, 0)
  const totalAsset = balance + totalHolding
  const holdingPct = totalAsset > 0 ? Math.round((totalHolding / totalAsset) * 100) : 0

  // 도넛 차트 데이터
  const donutSegments = holdings
    .filter(h => h.amount > 0)
    .map((h, i) => ({
      ...h,
      color: COLORS[i % COLORS.length],
      pct: totalHolding > 0 ? (h.amount / totalHolding) * 100 : 0,
    }))

  // SVG 도넛 차트 계산
  const radius = 70
  const circumference = 2 * Math.PI * radius
  let cumulativeOffset = 0

  return (
    <div className={styles.container}>
      {/* 나의 투자 현황 카드 */}
      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <h3 className={styles.statusTitle}>나의 투자 현황</h3>
          <button className={styles.historyLink} onClick={() => navigate('/stocks/history')}>
            투자 이력 보기 ›
          </button>
        </div>

        <div className={styles.statusBody}>
          {/* 도넛 차트 */}
          <div className={styles.chartWrap}>
            <svg viewBox="0 0 180 180" className={styles.donutSvg}>
              {/* 배경 원 */}
              <circle
                cx="90" cy="90" r={radius}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="16"
              />
              {/* 투자 세그먼트 */}
              {donutSegments.map((seg) => {
                const dashLength = (seg.pct / 100) * circumference
                const dashGap = circumference - dashLength
                const offset = cumulativeOffset
                cumulativeOffset += dashLength

                return (
                  <circle
                    key={seg.boothId}
                    cx="90" cy="90" r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={`${dashLength} ${dashGap}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
                  />
                )
              })}
              {/* 가운데 텍스트 */}
              <text x="90" y="85" textAnchor="middle" className={styles.donutLabel}>투자 비중</text>
              <text x="90" y="105" textAnchor="middle" className={styles.donutValue}>{holdingPct}%</text>
            </svg>
          </div>

          {/* 자산 정보 */}
          <div className={styles.assetInfo}>
            <div className={styles.assetRow}>
              <div className={styles.assetDot} style={{ background: '#4FC3F7' }} />
              <span className={styles.assetLabel}>총 보유 자산</span>
            </div>
            <p className={styles.assetValue}>{formatKorean(totalAsset)}원</p>

            <div className={styles.assetRow} style={{ marginTop: 12 }}>
              <div className={styles.assetDot} style={{ background: '#FFB74D' }} />
              <span className={styles.assetLabel}>투자 금액</span>
            </div>
            <p className={styles.assetValueSub}>
              {formatKorean(totalHolding)}원
              <span className={styles.assetPct}> ({holdingPct}%)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 투자 종목 리스트 */}
      <div className={styles.holdingSection}>
        <h3 className={styles.holdingSectionTitle}>투자 종목</h3>

        {holdings.filter(h => h.amount > 0).length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>아직 투자한 종목이 없습니다</p>
          </div>
        ) : (
          <div className={styles.holdingList}>
            {holdings.filter(h => h.amount > 0).map((h, i) => (
              <div
                key={h.boothId}
                className={`${styles.holdingItem} stagger-item`}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => navigate(`/stocks/booths/${h.boothId}`)}
              >
                <div className={styles.holdingInfo}>
                  <p className={styles.holdingName}>{h.boothName}</p>
                </div>
                <div className={styles.holdingAmount}>
                  <span className={styles.amountBadge} style={{ background: COLORS[i % COLORS.length] + '30', color: COLORS[i % COLORS.length] }}>
                    {formatKorean(h.amount)}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
