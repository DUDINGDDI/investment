import { useEffect, useState } from 'react'
import { adminApi } from '../api'
import { formatKorean } from '../utils/format'
import type { ExecutiveInvestmentResponse } from '../types'
import { PageBackButton } from '../components/PageBackButton'
import styles from './AdminExecutivePage.module.css'

type ViewTab = 'executives' | 'booths'

export default function AdminExecutivePage() {
  const [data, setData] = useState<ExecutiveInvestmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ViewTab>('executives')

  useEffect(() => {
    adminApi.getExecutiveInvestments().then(res => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (!data) return <div className={styles.container}><p>데이터를 불러올 수 없습니다.</p></div>

  const investedExecutives = data.executives.filter(e => e.totalInvested > 0)
  const notInvestedExecutives = data.executives.filter(e => e.totalInvested === 0)
  const investedBooths = data.boothSummaries.filter(b => b.executiveInvestment > 0)
  const totalExecInvestment = data.executives.reduce((sum, e) => sum + e.totalInvested, 0)

  return (
    <div className={styles.container}>
      <PageBackButton to="/admin" label="관리자" style={{ paddingLeft: 0 }} />
      <div className={styles.header}>
        <h2 className={styles.title}>임원 투자 집계</h2>
        <p className={styles.subtitle}>
          임원 {data.executives.length}명 · 투자 참여 {investedExecutives.length}명 · 총 {formatKorean(totalExecInvestment)}원
        </p>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'executives' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('executives')}
        >
          임원별 내역
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'booths' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('booths')}
        >
          부스별 집계
        </button>
      </div>

      {tab === 'executives' && (
        <div className={styles.section}>
          {investedExecutives.map(exec => (
            <div key={exec.userId} className={styles.execCard}>
              <div className={styles.execHeader}>
                <div className={styles.execInfo}>
                  <span className={styles.execName}>{exec.name}</span>
                  {exec.company && <span className={styles.execCompany}>{exec.company}</span>}
                </div>
                <div className={styles.execAmount}>
                  <span className={styles.execTotal}>{formatKorean(exec.totalInvested)}원</span>
                  <span className={styles.execBalance}>잔액 {formatKorean(exec.balance)}원</span>
                </div>
              </div>
              <div className={styles.execInvestments}>
                {exec.investments.map(inv => (
                  <div key={inv.boothId} className={styles.investRow}>
                    <span className={styles.investEmoji}>{inv.logoEmoji}</span>
                    <span className={styles.investName}>{inv.boothName}</span>
                    <span className={styles.investAmount}>{formatKorean(inv.amount)}원</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {notInvestedExecutives.length > 0 && (
            <div className={styles.notInvestedSection}>
              <p className={styles.notInvestedTitle}>미투자 임원 ({notInvestedExecutives.length}명)</p>
              <div className={styles.notInvestedList}>
                {notInvestedExecutives.map(exec => (
                  <span key={exec.userId} className={styles.notInvestedItem}>
                    {exec.name} <span className={styles.notInvestedCompany}>{exec.company}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'booths' && (
        <div className={styles.section}>
          {investedBooths.map((booth, i) => (
            <div key={booth.boothId} className={styles.boothItem}>
              <span className={`${styles.boothRank} ${i < 3 ? styles.topRank : ''}`}>{i + 1}</span>
              <span className={styles.boothEmoji}>{booth.logoEmoji}</span>
              <div className={styles.boothInfo}>
                <p className={styles.boothName}>{booth.boothName}</p>
                <p className={styles.boothMeta}>임원 {booth.executiveInvestorCount}명 투자</p>
              </div>
              <span className={styles.boothAmount}>{formatKorean(booth.executiveInvestment)}원</span>
            </div>
          ))}
          {investedBooths.length === 0 && (
            <p className={styles.emptyText}>아직 임원 투자 내역이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}
