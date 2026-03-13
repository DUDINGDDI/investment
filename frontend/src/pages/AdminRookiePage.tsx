import { useEffect, useState, useMemo } from 'react'
import { adminApi } from '../api'
import { formatKorean } from '../utils/format'
import type { RookieInvestmentResponse } from '../types'
import ReportAuthGate from '../components/ReportAuthGate'
import styles from './AdminExecutivePage.module.css'

type TabType = 'booth' | 'rookie'

export default function AdminRookiePage() {
  const [data, setData] = useState<RookieInvestmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('booth')

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const prevWidth = root.style.width
    const prevZoom = (root.style as CSSStyleDeclaration & { zoom: string }).zoom
    root.style.width = '100%'
    ;(root.style as CSSStyleDeclaration & { zoom: string }).zoom = '1'
    return () => {
      root.style.width = prevWidth
      ;(root.style as CSSStyleDeclaration & { zoom: string }).zoom = prevZoom
    }
  }, [])

  useEffect(() => {
    adminApi.getRookieSnapshot().then(res => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

  const boothInvestorMap = useMemo(() => {
    if (!data) return new Map<number, { name: string; company: string | null; amount: number }[]>()
    const map = new Map<number, { name: string; company: string | null; amount: number }[]>()
    for (const rookie of data.rookies) {
      for (const inv of rookie.investments) {
        if (!map.has(inv.boothId)) map.set(inv.boothId, [])
        map.get(inv.boothId)!.push({
          name: rookie.name,
          company: rookie.company,
          amount: inv.amount,
        })
      }
    }
    for (const [, investors] of map) {
      investors.sort((a, b) => b.amount - a.amount)
    }
    return map
  }, [data])

  if (loading) return <ReportAuthGate><div className={styles.page}><p className={styles.loadingText}>보고서 생성 중...</p></div></ReportAuthGate>
  if (!data) return <ReportAuthGate><div className={styles.page}><p className={styles.loadingText}>데이터를 불러올 수 없습니다.</p></div></ReportAuthGate>

  const investedRookies = data.rookies.filter(r => r.totalInvested > 0)
  const notInvestedRookies = data.rookies.filter(r => r.totalInvested === 0)
  const investedBooths = [...data.boothSummaries].sort((a, b) => b.rookieInvestment - a.rookieInvestment)
  const totalInvestment = data.rookies.reduce((sum, r) => sum + r.totalInvested, 0)
  const now = new Date()
  const dateStr = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`

  return (
    <ReportAuthGate>
    <div className={styles.page}>
      <div className={styles.reportHeader}>
        <p className={styles.reportLabel}>2026 ONLYONE FAIR</p>
        <h1 className={styles.reportTitle}>신입사원 투자 집계 보고서</h1>
        <p className={styles.reportDate}>{dateStr}</p>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>전체 신입사원</p>
          <p className={styles.summaryValue}>{data.rookies.length}<span className={styles.summaryUnit}>명</span></p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>투자 참여</p>
          <p className={styles.summaryValue}>{investedRookies.length}<span className={styles.summaryUnit}>명</span></p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>총 투자금</p>
          <p className={styles.summaryValue}>{formatKorean(totalInvestment)}<span className={styles.summaryUnit}>원</span></p>
        </div>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'booth' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('booth')}
        >
          부스별 투자 현황
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'rookie' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('rookie')}
        >
          신입사원별 투자 상세
        </button>
      </div>

      {tab === 'booth' ? (
        <>
          {investedBooths.map((booth, i) => (
            <div key={booth.boothId} className={styles.boothBlock}>
              <div className={styles.boothBlockHeader}>
                <span className={styles.boothRankBadge}>{i + 1}</span>
                <div className={styles.boothBlockInfo}>
                  <span className={styles.boothBlockName}>{booth.boothName} <span className={styles.boothCategory}>{booth.category}</span></span>
                  <span className={styles.boothBlockMeta}>
                    신입 {booth.rookieInvestorCount}명 · {formatKorean(booth.rookieInvestment)}원
                  </span>
                </div>
              </div>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th className={styles.thNameCol}>이름</th>
                    <th className={styles.thCompanyCol}>소속</th>
                    <th className={styles.thAmountCol}>투자 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {(boothInvestorMap.get(booth.boothId) || []).map((inv, j) => (
                    <tr key={j}>
                      <td className={styles.tdNameCol}>{inv.name}님</td>
                      <td className={styles.tdCompanyCol}>{inv.company || '-'}</td>
                      <td className={styles.tdAmountCol}>{formatKorean(inv.amount)}원</td>
                    </tr>
                  ))}
                  <tr className={styles.subTotalRow}>
                    <td colSpan={2}>합계</td>
                    <td className={styles.tdAmountCol}>{formatKorean(booth.rookieInvestment)}원</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          {investedBooths.length === 0 && (
            <p className={styles.loadingText}>투자 내역이 없습니다.</p>
          )}
        </>
      ) : (
        <>
          {investedRookies.map((rookie, idx) => (
            <div key={rookie.userId} className={styles.execBlock}>
              <div className={styles.execBlockHeader}>
                <span className={styles.execNum}>{idx + 1}</span>
                <div className={styles.execIdentity}>
                  <span className={styles.execName}>{rookie.name}님</span>
                  {rookie.company && <span className={styles.execCompany}>{rookie.company}</span>}
                </div>
                <div className={styles.execSummary}>
                  <span className={styles.execInvested}>투자 {formatKorean(rookie.totalInvested)}원</span>
                  <span className={styles.execBalance}>잔액 {formatKorean(rookie.balance)}원</span>
                </div>
              </div>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th>투자 부스</th>
                    <th className={styles.thAmountCol}>투자 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {rookie.investments.map(inv => (
                    <tr key={inv.boothId}>
                      <td>{inv.boothName} <span className={styles.boothCategory}>{inv.category}</span></td>
                      <td className={styles.tdAmountCol}>{formatKorean(inv.amount)}원</td>
                    </tr>
                  ))}
                  <tr className={styles.subTotalRow}>
                    <td>합계</td>
                    <td className={styles.tdAmountCol}>{formatKorean(rookie.totalInvested)}원</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {notInvestedRookies.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>미투자 신입사원</h2>
                <p className={styles.sectionDesc}>{notInvestedRookies.length}명의 신입사원이 아직 투자하지 않았습니다.</p>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thRank}>번호</th>
                    <th className={styles.thName}>이름</th>
                    <th className={styles.thAmount}>소속</th>
                  </tr>
                </thead>
                <tbody>
                  {notInvestedRookies.map((rookie, i) => (
                    <tr key={rookie.userId}>
                      <td className={styles.tdRank}>{i + 1}</td>
                      <td className={styles.tdName}>{rookie.name}님</td>
                      <td className={styles.tdAmount}>{rookie.company || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className={styles.footer}>
        <p>본 보고서는 실시간 데이터를 기반으로 자동 생성되었습니다.</p>
      </div>
    </div>
    </ReportAuthGate>
  )
}
