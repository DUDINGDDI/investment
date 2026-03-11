import { useEffect, useState, useMemo } from 'react'
import { adminApi } from '../api'
import { formatKorean } from '../utils/format'
import type { ExecutiveInvestmentResponse } from '../types'
import styles from './AdminExecutivePage.module.css'

type TabType = 'booth' | 'executive'

export default function AdminExecutivePage() {
  const [data, setData] = useState<ExecutiveInvestmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('booth')

  useEffect(() => {
    adminApi.getExecutiveInvestments().then(res => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

  // 부스별 투자자 상세 (임원 데이터에서 역으로 구성)
  const boothInvestorMap = useMemo(() => {
    if (!data) return new Map<number, { name: string; company: string | null; amount: number; memo: string | null }[]>()
    const map = new Map<number, { name: string; company: string | null; amount: number; memo: string | null }[]>()
    for (const exec of data.executives) {
      for (const inv of exec.investments) {
        if (!map.has(inv.boothId)) map.set(inv.boothId, [])
        map.get(inv.boothId)!.push({
          name: exec.name,
          company: exec.company,
          amount: inv.amount,
          memo: inv.memo,
        })
      }
    }
    // 각 부스 내에서 투자금 내림차순 정렬
    for (const [, investors] of map) {
      investors.sort((a, b) => b.amount - a.amount)
    }
    return map
  }, [data])

  if (loading) return <div className={styles.page}><p className={styles.loadingText}>보고서 생성 중...</p></div>
  if (!data) return <div className={styles.page}><p className={styles.loadingText}>데이터를 불러올 수 없습니다.</p></div>

  const investedExecutives = data.executives.filter(e => e.totalInvested > 0)
  const notInvestedExecutives = data.executives.filter(e => e.totalInvested === 0)
  const investedBooths = data.boothSummaries.filter(b => b.executiveInvestment > 0)
  const totalExecInvestment = data.executives.reduce((sum, e) => sum + e.totalInvested, 0)
  const now = new Date()
  const dateStr = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`

  return (
    <div className={styles.page}>
      {/* 보고서 헤더 */}
      <div className={styles.reportHeader}>
        <p className={styles.reportLabel}>2026 ONLYONE FAIR</p>
        <h1 className={styles.reportTitle}>임원 투자 집계 보고서</h1>
        <p className={styles.reportDate}>{dateStr}</p>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>전체 임원</p>
          <p className={styles.summaryValue}>{data.executives.length}<span className={styles.summaryUnit}>명</span></p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>투자 참여</p>
          <p className={styles.summaryValue}>{investedExecutives.length}<span className={styles.summaryUnit}>명</span></p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>총 투자금</p>
          <p className={styles.summaryValue}>{formatKorean(totalExecInvestment)}<span className={styles.summaryUnit}>원</span></p>
        </div>
      </div>

      {/* 탭 전환 */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'booth' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('booth')}
        >
          부스별 투자 현황
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'executive' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('executive')}
        >
          임원별 투자 상세
        </button>
      </div>

      {tab === 'booth' ? (
        <>
          {/* 부스별 임원 투자 현황 */}
          {investedBooths.map((booth, i) => (
            <div key={booth.boothId} className={styles.boothBlock}>
              <div className={styles.boothBlockHeader}>
                <span className={styles.boothRankBadge}>{i + 1}</span>
                <div className={styles.boothBlockInfo}>
                  <span className={styles.boothBlockName}>{booth.boothName} <span className={styles.boothCategory}>{booth.category}</span></span>
                  <span className={styles.boothBlockMeta}>
                    임원 {booth.executiveInvestorCount}명 · {formatKorean(booth.executiveInvestment)}원
                  </span>
                </div>
              </div>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th>임원</th>
                    <th>소속</th>
                    <th>투자 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {(boothInvestorMap.get(booth.boothId) || []).map((inv, j) => (
                    <tr key={j}>
                      <td>
                        {inv.name}님
                        {inv.memo && <p className={styles.memoText}>{inv.memo}</p>}
                      </td>
                      <td className={styles.subTdCompany}>{inv.company || '-'}</td>
                      <td className={styles.subTdAmount}>{formatKorean(inv.amount)}원</td>
                    </tr>
                  ))}
                  <tr className={styles.subTotalRow}>
                    <td colSpan={2}>합계</td>
                    <td className={styles.subTdAmount}>{formatKorean(booth.executiveInvestment)}원</td>
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
          {/* 임원별 투자 상세 */}
          {investedExecutives.map((exec, idx) => (
            <div key={exec.userId} className={styles.execBlock}>
              <div className={styles.execBlockHeader}>
                <span className={styles.execNum}>{idx + 1}</span>
                <div className={styles.execIdentity}>
                  <span className={styles.execName}>{exec.name}님</span>
                  {exec.company && <span className={styles.execCompany}>{exec.company}</span>}
                </div>
                <div className={styles.execSummary}>
                  <span className={styles.execInvested}>투자 {formatKorean(exec.totalInvested)}원</span>
                  <span className={styles.execBalance}>잔액 {formatKorean(exec.balance)}원</span>
                </div>
              </div>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th>투자 부스</th>
                    <th>투자 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {exec.investments.map(inv => (
                    <tr key={inv.boothId}>
                      <td>
                        {inv.boothName} <span className={styles.boothCategory}>{inv.category}</span>
                        {inv.memo && <p className={styles.memoText}>{inv.memo}</p>}
                      </td>
                      <td className={styles.subTdAmount}>{formatKorean(inv.amount)}원</td>
                    </tr>
                  ))}
                  <tr className={styles.subTotalRow}>
                    <td>합계</td>
                    <td className={styles.subTdAmount}>{formatKorean(exec.totalInvested)}원</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* 미투자 임원 */}
          {notInvestedExecutives.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>미투자 임원</h2>
                <p className={styles.sectionDesc}>{notInvestedExecutives.length}명의 임원이 아직 투자하지 않았습니다.</p>
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
                  {notInvestedExecutives.map((exec, i) => (
                    <tr key={exec.userId}>
                      <td className={styles.tdRank}>{i + 1}</td>
                      <td className={styles.tdName}>{exec.name}님</td>
                      <td className={styles.tdAmount}>{exec.company || '-'}</td>
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
  )
}
