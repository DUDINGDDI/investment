import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { stockApi } from '../api'
import { formatKorean } from '../utils/format'
import PriceChart from '../components/PriceChart'
import type { StockBoothResponse, StockHoldingResponse, CospiResponse } from '../types'
import styles from './StockBoothListPage.module.css'

const COLORS = ['#6C5CE7', '#4593FC', '#00D68F', '#F5C842', '#F04452', '#FF8A65', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6']

export default function StockBoothListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'portfolio' ? 'portfolio' : 'all'
  const [booths, setBooths] = useState<StockBoothResponse[]>([])
  const [cospi, setCospi] = useState<CospiResponse | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [holdings, setHoldings] = useState<StockHoldingResponse[]>([])
  const [boothPage, setBoothPage] = useState(0)
  const PAGE_SIZE = 10
  const navigate = useNavigate()

  useEffect(() => {
    stockApi.getBooths().then(res => setBooths(res.data))
    stockApi.getCospi().then(res => setCospi(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'portfolio') {
      stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
      stockApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
    }
  }, [activeTab])

  useEffect(() => {
    const handler = () => {
      stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
      stockApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
    }
    window.addEventListener('balance-changed', handler)
    return () => window.removeEventListener('balance-changed', handler)
  }, [])

  const switchTab = (tab: 'all' | 'portfolio') => {
    setSearchParams(tab === 'portfolio' ? { tab: 'portfolio' } : {})
  }

  const getChangeClass = () => {
    if (!cospi) return styles.changeNeutral
    if (cospi.change > 0) return styles.changeUp
    if (cospi.change < 0) return styles.changeDown
    return styles.changeNeutral
  }

  const getChangeText = () => {
    if (!cospi) return ''
    if (cospi.change > 0) return `▲ ${formatKorean(cospi.change)}원(+${cospi.changeRate}%)`
    if (cospi.change < 0) return `▼ ${formatKorean(Math.abs(cospi.change))}원(${cospi.changeRate}%)`
    return '변동 없음'
  }

  // 포트폴리오 계산
  const totalHolding = holdings.reduce((sum, h) => sum + h.amount, 0)
  const totalAsset = balance + totalHolding
  const holdingPct = totalAsset > 0 ? Math.round((totalHolding / totalAsset) * 100) : 0

  const donutSegments = holdings
    .filter(h => h.amount > 0)
    .map((h, i) => ({
      ...h,
      color: COLORS[i % COLORS.length],
      pct: totalHolding > 0 ? (h.amount / totalHolding) * 100 : 0,
    }))

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const segmentOffsets: number[] = []
  for (let i = 0; i < donutSegments.length; i++) {
    segmentOffsets.push(i === 0 ? 0 : segmentOffsets[i - 1] + (donutSegments[i - 1].pct / 100) * circumference)
  }

  return (
    <div className={styles.container}>
      {/* 탭 */}
      <div className={styles.tabsChip}>
        <button
          className={`${styles.chipTab} ${activeTab === 'all' ? styles.chipActive : ''}`}
          onClick={() => switchTab('all')}
        >
          주식 종목 전체
        </button>
        <button
          className={`${styles.chipTab} ${activeTab === 'portfolio' ? styles.chipActive : ''}`}
          onClick={() => switchTab('portfolio')}
        >
          나의 투자 정보
        </button>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* COSPI 배너 */}
          <div className={styles.cospiBanner}>
            <div className={styles.cospiIcon}>📈</div>
            <div className={styles.cospiContent}>
              <p className={styles.cospiFull}>CJ ONLYONE Stock Price Index</p>
              <p className={styles.cospiTitle}>COSPI</p>
              <p className={styles.cospiDesc}>
                모든 부스의 투자금 총합을 나타내는 지수입니다. 시장 전체의 흐름을 한눈에 확인하세요.
              </p>
            </div>
          </div>

          {/* COSPI 지수 + 차트 */}
          {cospi && (
            <>
              <div className={styles.cospiPriceRow}>
                <span className={styles.cospiLabel}>COSPI 지수</span>
                <span className={styles.cospiValue}>{formatKorean(cospi.currentTotal)}원</span>
                <span className={getChangeClass()}>{getChangeText()}</span>
              </div>

              <div className={styles.chartArea}>
                <PriceChart
                  priceHistory={cospi.history}
                  themeColor={cospi.change >= 0 ? '#ef4444' : '#3b82f6'}
                />
              </div>
            </>
          )}

          {/* 주식 종목 리스트 */}
          <div className={styles.stockSection}>
            <h3 className={styles.stockSectionTitle}>투자 종목</h3>
            <p className={styles.stockSectionSubtitle}>여러 투자 종목을 살펴보고 관심 있는 종목에 투자하세요.</p>

            <div className={styles.list}>
              {booths.slice(boothPage * PAGE_SIZE, (boothPage + 1) * PAGE_SIZE).map((booth, i) => (
                <div
                  key={booth.id}
                  className={`${styles.item} stagger-item`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/stocks/booths/${booth.id}`)}
                >
                  <div className={styles.info}>
                    <p className={styles.name}>{booth.name}</p>
                    <p className={styles.category}>{booth.category}</p>
                  </div>
                  <div className={styles.arrow}>›</div>
                </div>
              ))}
            </div>

            {(
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={boothPage === 0}
                  onClick={() => setBoothPage(boothPage - 1)}
                >
                  ‹ 이전
                </button>
                <span className={styles.pageInfo}>
                  {boothPage + 1} / {Math.ceil(booths.length / PAGE_SIZE) || 1}
                </span>
                <button
                  className={styles.pageBtn}
                  disabled={(boothPage + 1) * PAGE_SIZE >= booths.length}
                  onClick={() => setBoothPage(boothPage + 1)}
                >
                  다음 ›
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
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
                  <circle
                    cx="90" cy="90" r={radius}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth="16"
                  />
                  {donutSegments.map((seg, i) => {
                    const dashLength = (seg.pct / 100) * circumference
                    const dashGap = circumference - dashLength
                    const offset = segmentOffsets[i]

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
