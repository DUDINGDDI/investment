import { useEffect, useState } from 'react'
import { adminApi } from '../api'
import { formatKorean } from '../utils/format'
import type { ExecutiveInvestmentResponse } from '../types'
import styles from './AdminExecutivePage.module.css'

export default function AdminExecutivePage() {
  const [data, setData] = useState<ExecutiveInvestmentResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getExecutiveInvestments().then(res => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

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

      {/* 섹션 1: 부스별 임원 투자 현황 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>1. 부스별 임원 투자 현황</h2>
          <p className={styles.sectionDesc}>각 부스가 임원으로부터 받은 투자 금액 (내림차순)</p>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thRank}>순위</th>
              <th className={styles.thName}>부스명</th>
              <th className={styles.thCount}>투자 임원</th>
              <th className={styles.thAmount}>투자 금액</th>
            </tr>
          </thead>
          <tbody>
            {investedBooths.map((booth, i) => (
              <tr key={booth.boothId} className={i < 3 ? styles.trTop : ''}>
                <td className={styles.tdRank}>{i + 1}</td>
                <td className={styles.tdName}>{booth.boothName}</td>
                <td className={styles.tdCount}>{booth.executiveInvestorCount}명</td>
                <td className={styles.tdAmount}>{formatKorean(booth.executiveInvestment)}원</td>
              </tr>
            ))}
            {investedBooths.length === 0 && (
              <tr><td colSpan={4} className={styles.tdEmpty}>투자 내역 없음</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 섹션 2: 임원별 투자 상세 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>2. 임원별 투자 상세</h2>
          <p className={styles.sectionDesc}>임원 {investedExecutives.length}명의 개별 투자 내역</p>
        </div>

        {investedExecutives.map((exec, idx) => (
          <div key={exec.userId} className={styles.execBlock}>
            <div className={styles.execBlockHeader}>
              <span className={styles.execNum}>{idx + 1}</span>
              <div className={styles.execIdentity}>
                <span className={styles.execName}>{exec.name}</span>
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
                    <td>{inv.boothName}</td>
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
      </div>

      {/* 섹션 3: 미투자 임원 */}
      {notInvestedExecutives.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>3. 미투자 임원</h2>
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
                  <td className={styles.tdName}>{exec.name}</td>
                  <td className={styles.tdAmount}>{exec.company || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footer}>
        <p>본 보고서는 실시간 데이터를 기반으로 자동 생성되었습니다.</p>
      </div>
    </div>
  )
}
