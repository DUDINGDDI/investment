import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { stockApi, ideaBoardApi, userApi } from '../api'
import { formatKorean } from '../utils/format'
import PriceChart from '../components/PriceChart'
import PageBackButton from '../components/PageBackButton'
import type { StockBoothResponse, StockHoldingResponse, CospiResponse, MyStockVisitResponse } from '../types'
import styles from './StockBoothListPage.module.css'

const COLORS = ['#6C5CE7', '#4593FC', '#00D68F', '#F5C842', '#F04452', '#FF8A65', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6']

function formatVisitTime(dateStr: string) {
  const d = new Date(dateStr)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${ampm} ${h12}:${m}`
}

interface VisitTableRow {
  boothId: number
  boothName: string
  visitedAt: string
  hasReview: boolean
  hasIdeaContent: boolean
  investmentAmount: number
}

export default function StockBoothListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'portfolio' ? 'portfolio' : 'all'
  const [booths, setBooths] = useState<StockBoothResponse[]>([])
  const [cospi, setCospi] = useState<CospiResponse | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [holdings, setHoldings] = useState<StockHoldingResponse[]>([])
  const [boothPage, setBoothPage] = useState(0)
  const [tableData, setTableData] = useState<VisitTableRow[]>([])
  const [tableLoading, setTableLoading] = useState(true)
  const [visitedBoothIds, setVisitedBoothIds] = useState<Set<number>>(new Set())
  const PAGE_SIZE = 10
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      stockApi.getBooths(),
      stockApi.getMyVisits().catch(() => ({ data: [] })),
    ]).then(([boothsRes, visitsRes]) => {
      const visited = new Set(visitsRes.data.map((v: MyStockVisitResponse) => v.boothId))
      setVisitedBoothIds(visited)
      const sorted = [...boothsRes.data].sort((a, b) => {
        const aVisited = visited.has(a.id) ? 0 : 1
        const bVisited = visited.has(b.id) ? 0 : 1
        if (aVisited !== bVisited) return aVisited - bVisited
        return b.totalHolding - a.totalHolding || a.displayOrder - b.displayOrder
      })
      setBooths(sorted)
    })
    stockApi.getCospi().then(res => setCospi(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'portfolio') {
      stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
      stockApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
      loadTableData()
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

  async function loadTableData() {
    try {
      setTableLoading(true)
      const [visitsRes, holdingsRes, userRes] = await Promise.all([
        stockApi.getMyVisits(),
        stockApi.getMy(),
        userApi.getMe(),
      ])

      const visits: MyStockVisitResponse[] = visitsRes.data
      const holdingsList: StockHoldingResponse[] = holdingsRes.data
      const userId = userRes.data.userId
      const holdingsMap = new Map(holdingsList.map((h: StockHoldingResponse) => [h.boothId, h.amount]))

      const rows: VisitTableRow[] = await Promise.all(
        visits.map(async (visit: MyStockVisitResponse) => {
          let hasReview = false
          let hasIdeaContent = false

          try {
            const ratingRes = await stockApi.getMyRating(visit.boothId)
            hasReview = !!(ratingRes.data?.review)
          } catch { /* no rating */ }

          try {
            const boardRes = await ideaBoardApi.getBoard(visit.boothId)
            hasIdeaContent = boardRes.data.comments.some((c: { userId: number }) => c.userId === userId)
          } catch { /* no board */ }

          return {
            boothId: visit.boothId,
            boothName: visit.boothName,
            visitedAt: visit.visitedAt,
            hasReview,
            hasIdeaContent,
            investmentAmount: holdingsMap.get(visit.boothId) || 0,
          }
        })
      )

      rows.sort((a: VisitTableRow, b: VisitTableRow) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime())
      setTableData(rows)
    } catch (err) {
      console.error('Failed to load table data', err)
    } finally {
      setTableLoading(false)
    }
  }

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
      <PageBackButton to="/stocks" label="하고잡이 투자" />

      {/* 탭 */}
      <div className={styles.tabsChip}>
        <button
          className={`${styles.chipTab} ${activeTab === 'all' ? styles.chipActive : ''}`}
          onClick={() => switchTab('all')}
        >
          투자 종목 전체
        </button>
        <button
          className={`${styles.chipTab} ${activeTab === 'portfolio' ? styles.chipActive : ''}`}
          onClick={() => switchTab('portfolio')}
        >
          나의 활동 정보
        </button>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* COSPI 배너 */}
          <div className={styles.cospiBanner}>
            <div className={styles.cospiIcon}>📈</div>
            <div className={styles.cospiContent}>
              <p className={styles.cospiFull}><span className={styles.cospiHighlight}>C</span>J <span className={styles.cospiHighlight}>O</span>NLYONE <span className={styles.cospiHighlight}>S</span>tock <span className={styles.cospiHighlight}>P</span>rice <span className={styles.cospiHighlight}>I</span>ndex</p>
              <p className={styles.cospiTitle}>COSPI</p>
              <p className={styles.cospiDesc}>
                모든 부스의 투자금 총합을 나타내는 지수입니다.<br />시장 전체의 흐름을 한눈에 확인하세요.
              </p>
            </div>
          </div>

          {/* COSPI 지수 + 차트 */}
          {cospi && (
            <div className={styles.cospiCard}>
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
            </div>
          )}

          {/* 주식 종목 리스트 */}
          <div className={styles.stockSection}>
            <h3 className={styles.stockSectionTitle}>투자 종목 <span className={styles.visitCount}>{visitedBoothIds.size}/{booths.length}</span></h3>
            <p className={styles.stockSectionSubtitle}>여러 부스를 살펴보고 관심있는 아이디어에 투자하세요.</p>

            <div className={styles.list}>
              {booths.slice(boothPage * PAGE_SIZE, (boothPage + 1) * PAGE_SIZE).map((booth, i) => {
                const visited = visitedBoothIds.has(booth.id)
                return (
                  <div
                    key={booth.id}
                    className={`${styles.item} ${!visited ? styles.itemDisabled : ''} stagger-item`}
                    style={{ animationDelay: `${i * 0.02}s` }}
                    onClick={() => navigate(`/stocks/booths/${booth.id}`)}
                  >
                    <div className={styles.info}>
                      <p className={styles.name}>{booth.name}</p>
                      <p className={styles.category}>{booth.category}</p>
                    </div>
                    <div className={styles.itemRight}>
                      {booth.zoneName && <span className={styles.locationBadge}>{booth.zoneName}</span>}
                      {visited ? <div className={styles.arrow}>›</div> : <span className={styles.visitBadge}>🔒 미방문</span>}
                    </div>
                  </div>
                )
              })}
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
          {/* 나의 투자 포트폴리오 카드 */}
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <h3 className={styles.statusTitle}>나의 투자 포트폴리오</h3>
              <button className={styles.historyLink} onClick={() => navigate('/stocks/history')}>
                투자 이력 보기 ›
              </button>
            </div>

            {/* 도넛 차트 */}
            <div className={styles.chartWrapLarge}>
              <svg viewBox="-10 -10 200 200" className={styles.donutSvg}>
                {donutSegments.map((seg, i) => {
                  const dashLength = (seg.pct / 100) * circumference + 0.5
                  const dashGap = circumference - dashLength
                  const offset = segmentOffsets[i]
                  return (
                    <circle
                      key={seg.boothId}
                      cx="90" cy="90" r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="16"
                      strokeDasharray={`${dashLength} ${Math.max(0, dashGap)}`}
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

          {/* 투자 종목 테이블 */}
          <div className={styles.holdingSection}>
            <h3 className={styles.holdingSectionTitle}>투자 종목</h3>

            {tableLoading ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>불러오는 중...</p>
              </div>
            ) : tableData.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>아직 방문한 부스가 없습니다</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.visitTable}>
                  <thead>
                    <tr>
                      <th className={styles.thBooth}>방문 부스</th>
                      <th className={styles.thCenter}>진정성 있게</th>
                      <th className={styles.thCenter}>내일 더 새롭게</th>
                      <th className={styles.thRight}>투자금</th>
                      <th className={styles.thRight}>방문 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row: VisitTableRow, i: number) => (
                      <tr
                        key={row.boothId}
                        className={`${styles.tableRow} stagger-item`}
                        style={{ animationDelay: `${i * 0.02}s` }}
                      >
                        <td
                          className={styles.tdBooth}
                          onClick={() => navigate(`/stocks/booths/${row.boothId}`, { state: { from: 'portfolio' } })}
                        >
                          {row.boothName}
                        </td>
                        <td
                          className={styles.tdCenter}
                          onClick={() => navigate(`/stocks/booths/${row.boothId}?tab=sincere`, { state: { from: 'portfolio' } })}
                        >
                          <span className={row.hasReview ? styles.checkDone : styles.checkNone}>
                            {row.hasReview ? 'O' : 'X'}
                          </span>
                        </td>
                        <td
                          className={styles.tdCenter}
                          onClick={() => navigate(`/stocks/booths/${row.boothId}?tab=develop`, { state: { from: 'portfolio' } })}
                        >
                          <span className={row.hasIdeaContent ? styles.checkDone : styles.checkNone}>
                            {row.hasIdeaContent ? 'O' : 'X'}
                          </span>
                        </td>
                        <td
                          className={styles.tdRight}
                          onClick={() => navigate(`/stocks/booths/${row.boothId}?tab=invest`, { state: { from: 'portfolio' } })}
                        >
                          {row.investmentAmount > 0 ? formatKorean(row.investmentAmount) + '원' : '-'}
                        </td>
                        <td className={styles.tdTime}>
                          {formatVisitTime(row.visitedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
