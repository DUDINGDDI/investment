import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { boothApi, investmentApi, userApi } from '../api'
import { formatKorean } from '../utils/format'
import PageBackButton from '../components/PageBackButton'
import type { BoothResponse, InvestmentResponse } from '../types'
import styles from './BoothListPage.module.css'

const COLORS = ['#6C5CE7', '#4593FC', '#00D68F', '#F5C842', '#F04452', '#FF8A65', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6']

export default function BoothListPage() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'portfolio' ? 'portfolio' : 'all'
  const [booths, setBooths] = useState<BoothResponse[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [holdings, setHoldings] = useState<InvestmentResponse[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    boothApi.getAll().then(res => {
      const sorted = [...res.data].sort((a, b) =>
        b.totalInvestment - a.totalInvestment || a.displayOrder - b.displayOrder
      )
      setBooths(sorted)
    })
  }, [])

  useEffect(() => {
    if (activeTab === 'portfolio') {
      userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
      investmentApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
    }
  }, [activeTab])

  useEffect(() => {
    const handler = () => {
      userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
      investmentApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
    }
    window.addEventListener('balance-changed', handler)
    return () => window.removeEventListener('balance-changed', handler)
  }, [])

  // 포트폴리오 계산
  const totalHolding = holdings.reduce((sum, h) => sum + h.amount, 0)
  const totalAsset = balance + totalHolding
  const holdingPct = totalAsset > 0 ? Math.round((totalHolding / totalAsset) * 100) : 0

  const investedSegments = [...holdings]
    .filter(h => h.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((h, i) => ({
      ...h,
      color: COLORS[i % COLORS.length],
      pct: totalAsset > 0 ? (h.amount / totalAsset) * 100 : 0,
    }))
  const balancePct = totalAsset > 0 ? (balance / totalAsset) * 100 : 100
  const donutSegments = [
    ...investedSegments,
    { boothId: -1, color: '#888888', pct: balancePct },
  ]

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const segmentOffsets: number[] = []
  for (let i = 0; i < donutSegments.length; i++) {
    segmentOffsets.push(i === 0 ? 0 : segmentOffsets[i - 1] + (donutSegments[i - 1].pct / 100) * circumference)
  }

  return (
    <div className={styles.container}>
      <PageBackButton to="/home" label="대표작 투자" />

      {activeTab === 'all' ? (
        <>
          {/* 투자 종목 리스트 */}
          <div className={styles.stockSection}>
            <h3 className={styles.stockSectionTitle}>투자 종목</h3>
            <p className={styles.stockSectionSubtitle}>대표작 발표를 듣고 온리원 아이디어에 투자하세요.</p>

            <div className={styles.list}>
              {booths.map((booth, i) => (
                <div
                  key={booth.id}
                  className={`${styles.item} stagger-item`}
                  style={{ animationDelay: `${i * 0.02}s` }}
                  onClick={() => navigate(`/booths/${booth.id}`)}
                >
                  <div className={styles.info}>
                    <p className={styles.name}>{booth.name}</p>
                    <p className={styles.category}>{booth.category}</p>
                  </div>
                  <span className={styles.investChip}>투자하기</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 나의 투자 포트폴리오 카드 */}
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <h3 className={styles.statusTitle}>나의 투자 포트폴리오</h3>
              <button className={styles.historyLink} onClick={() => navigate('/history')}>
                투자 이력 보기 ›
              </button>
            </div>

            {/* 도넛 차트 + 범례 */}
            <div className={styles.chartRow}>
              <div className={styles.chartWrapLarge}>
                <svg viewBox="0 0 200 200" className={styles.donutSvg} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <clipPath id="pmDonutClip">
                      <rect x="0" y="0" width="200" height="200" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#pmDonutClip)">
                    {donutSegments.map((seg, i) => {
                      const dashLength = (seg.pct / 100) * circumference + 0.5
                      const dashGap = circumference - dashLength
                      const offset = segmentOffsets[i]
                      return (
                        <circle
                          key={seg.boothId}
                          cx="100" cy="100" r="70"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="16"
                          strokeDasharray={`${dashLength} ${Math.max(0, dashGap)}`}
                          strokeDashoffset={-offset}
                          strokeLinecap="butt"
                          transform="rotate(-90 100 100)"
                        />
                      )
                    })}
                    <text x="100" y="95" textAnchor="middle" className={styles.donutLabel}>투자 비중</text>
                    <text x="100" y="115" textAnchor="middle" className={styles.donutValue}>{holdingPct}%</text>
                  </g>
                </svg>
              </div>
              <div className={styles.chartLegend}>
                {investedSegments.map(seg => (
                  <div key={seg.boothId} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: seg.color }} />
                    <span className={styles.legendName}>{seg.boothName}</span>
                  </div>
                ))}
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#888888' }} />
                  <span className={styles.legendName}>잔액</span>
                </div>
              </div>
            </div>

            {/* 자산 정보 */}
            <div className={styles.assetBelow}>
              <div className={styles.assetBelowItem}>
                <span className={styles.assetLabel}>투자 금액</span>
                <p className={styles.assetValue}>{formatKorean(totalHolding)}원</p>
              </div>
              <div className={styles.assetBelowItem}>
                <span className={styles.assetLabel}>잔여 금액</span>
                <p className={styles.assetValue}>{formatKorean(balance)}원</p>
              </div>
              <div className={styles.assetBelowItem}>
                <span className={styles.assetLabel}>총 자산</span>
                <p className={styles.assetValueLarge}>{formatKorean(totalAsset)}원</p>
              </div>
            </div>
          </div>

          {/* 투자 종목 리스트 */}
          <div className={styles.holdingSection}>
            <h3 className={styles.holdingSectionTitle}>투자 종목</h3>

            {holdings.filter(h => h.amount > 0).length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>아직 투자한 아이디어가 없습니다</p>
              </div>
            ) : (
              <div className={styles.holdingList}>
                {[...holdings].filter(h => h.amount > 0).sort((a, b) => b.amount - a.amount).map((h, i) => (
                  <div
                    key={h.boothId}
                    className={`${styles.holdingItem} stagger-item`}
                    style={{ animationDelay: `${i * 0.02}s` }}
                    onClick={() => navigate(`/booths/${h.boothId}`, { state: { from: 'portfolio' } })}
                  >
                    <div className={styles.holdingInfo}>
                      <p className={styles.holdingName}>{h.boothName}</p>
                    </div>
                    <div className={styles.holdingAmountWrap}>
                      <span className={styles.amountBadge} style={{ background: COLORS[i % COLORS.length] + '30', color: COLORS[i % COLORS.length] }}>
                        {formatKorean(h.amount)}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
