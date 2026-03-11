import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockApi, ideaBoardApi, userApi } from '../api'
import { formatKorean } from '../utils/format'
import type { StockHoldingResponse } from '../types'
import styles from './StockPortfolioPage.module.css'

const COLORS = ['#6C5CE7', '#4593FC', '#00D68F', '#F5C842', '#F04452', '#FF8A65', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6']

interface VisitTableRow {
  boothId: number
  boothName: string
  visitedAt: string
  hasReview: boolean
  hasIdeaContent: boolean
  investmentAmount: number
}

export default function StockPortfolioPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number>(0)
  const [holdings, setHoldings] = useState<StockHoldingResponse[]>([])
  const [tableData, setTableData] = useState<VisitTableRow[]>([])
  const [tableLoading, setTableLoading] = useState(true)

  useEffect(() => {
    stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
    stockApi.getMy().then(res => setHoldings(res.data)).catch(() => {})
    loadTableData()
  }, [])

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

      const visits = visitsRes.data
      const holdingsList = holdingsRes.data
      const userId = userRes.data.userId

      const holdingsMap = new Map(holdingsList.map(h => [h.boothId, h.amount]))

      const rows = await Promise.all(
        visits.map(async (visit) => {
          let hasReview = false
          let hasIdeaContent = false

          try {
            const ratingRes = await stockApi.getMyRating(visit.boothId)
            hasReview = !!(ratingRes.data?.review)
          } catch { /* no rating */ }

          try {
            const boardRes = await ideaBoardApi.getBoard(visit.boothId)
            hasIdeaContent = boardRes.data.comments.some(c => c.userId === userId)
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

      rows.sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime())
      setTableData(rows)
    } catch (err) {
      console.error('Failed to load table data', err)
    } finally {
      setTableLoading(false)
    }
  }

  const totalHolding = holdings.reduce((sum, h) => sum + h.amount, 0)
  const totalAsset = balance + totalHolding
  const holdingPct = totalAsset > 0 ? Math.round((totalHolding / totalAsset) * 100) : 0

  // 도넛 차트 데이터 (총 자산 대비 비율)
  const investedSegments = holdings
    .filter(h => h.amount > 0)
    .map((h, i) => ({
      ...h,
      color: COLORS[i % COLORS.length],
      pct: totalAsset > 0 ? (h.amount / totalAsset) * 100 : 0,
    }))
  const balancePct = totalAsset > 0 ? (balance / totalAsset) * 100 : 100
  const donutSegments = [
    ...investedSegments,
    { boothId: -1, color: 'var(--border-color)', pct: balancePct },
  ]

  // SVG 도넛 차트 계산
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const segmentOffsets: number[] = []
  for (let i = 0; i < donutSegments.length; i++) {
    segmentOffsets.push(i === 0 ? 0 : segmentOffsets[i - 1] + (donutSegments[i - 1].pct / 100) * circumference)
  }

  return (
    <div className={styles.container}>
      {/* 나의 투자 포트폴리오 카드 */}
      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <h3 className={styles.statusTitle}>나의 투자 포트폴리오</h3>
          <button className={styles.historyLink} onClick={() => navigate('/stocks/history')}>
            투자 이력 보기 ›
          </button>
        </div>

        <div className={styles.statusBody}>
          {/* 도넛 차트 + 범례 */}
          <div className={styles.chartRow}>
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
                {/* 가운데 텍스트 */}
                <text x="90" y="85" textAnchor="middle" className={styles.donutLabel}>투자 비중</text>
                <text x="90" y="105" textAnchor="middle" className={styles.donutValue}>{holdingPct}%</text>
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
                <span className={styles.legendDot} style={{ background: 'var(--border-color)' }} />
                <span className={styles.legendName}>잔액</span>
              </div>
            </div>
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
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr
                    key={row.boothId}
                    className={`${styles.tableRow} stagger-item`}
                    style={{ animationDelay: `${i * 0.02}s` }}
                    onClick={() => navigate(`/stocks/booths/${row.boothId}`)}
                  >
                    <td className={styles.tdBooth}>{row.boothName}</td>
                    <td className={styles.tdCenter}>
                      <span className={row.hasReview ? styles.checkDone : styles.checkNone}>
                        {row.hasReview ? 'O' : 'X'}
                      </span>
                    </td>
                    <td className={styles.tdCenter}>
                      <span className={row.hasIdeaContent ? styles.checkDone : styles.checkNone}>
                        {row.hasIdeaContent ? 'O' : 'X'}
                      </span>
                    </td>
                    <td className={styles.tdRight}>
                      {row.investmentAmount > 0 ? formatKorean(row.investmentAmount) + '원' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
