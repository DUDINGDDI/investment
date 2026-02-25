import { useEffect, useState } from 'react'
import { resultApi } from '../api'
import { formatKorean } from '../utils/format'
import type { RankingResponse } from '../types'
import styles from './ResultPage.module.css'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className={`${styles.badge} ${styles.gold}`}>1st</span>
  if (rank === 2) return <span className={`${styles.badge} ${styles.silver}`}>2nd</span>
  if (rank === 3) return <span className={`${styles.badge} ${styles.bronze}`}>3rd</span>
  return <span className={styles.rankNum}>{rank}</span>
}

export default function ResultPage() {
  const [revealed, setRevealed] = useState(false)
  const [ranking, setRanking] = useState<RankingResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const statusRes = await resultApi.getStatus()
        setRevealed(statusRes.data.revealed)
        if (statusRes.data.revealed) {
          const rankRes = await resultApi.getRanking()
          setRanking(rankRes.data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return null

  if (!revealed) {
    return (
      <div className={styles.lockedContainer}>
        <div className={styles.lockIcon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#555560" strokeWidth="2" />
            <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#555560" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className={styles.lockedTitle}>Coming Soon</h2>
        <p className={styles.lockedDesc}>투자 결과가 곧 공개됩니다</p>
        <p className={styles.lockedSub}>관리자가 결과를 공개하면 이곳에서<br />부스별 투자 순위를 확인할 수 있어요</p>
      </div>
    )
  }

  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>투자 결과</h2>
        <p className={styles.subtitle}>부스별 총 투자금액 순위</p>
      </div>

      {top3.length > 0 && (
        <div className={styles.podium}>
          {top3.map((item, i) => (
            <div
              key={item.boothId}
              className={`${styles.podiumItem} ${i === 0 ? styles.first : i === 1 ? styles.second : styles.third} stagger-item`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className={styles.podiumRank}>
                <RankBadge rank={item.rank} />
              </div>
              <div className={styles.podiumIcon} style={{ background: item.themeColor + '30', borderColor: item.themeColor }}>
                <span>{item.logoEmoji}</span>
              </div>
              <p className={styles.podiumName}>{item.boothName}</p>
              <p className={styles.podiumCategory}>{item.category}</p>
              <p className={styles.podiumAmount}>{formatKorean(item.totalInvestment)}</p>
              <p className={styles.podiumUnit}>원</p>
              <p className={styles.podiumInvestors}>{item.investorCount}명 투자</p>
            </div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className={styles.list}>
          {rest.map((item, i) => (
            <div
              key={item.boothId}
              className={`${styles.listItem} stagger-item`}
              style={{ animationDelay: `${(i + 3) * 0.06}s` }}
            >
              <span className={styles.listRank}>{item.rank}</span>
              <div className={styles.listIcon} style={{ background: item.themeColor + '30' }}>
                <span>{item.logoEmoji}</span>
              </div>
              <div className={styles.listInfo}>
                <p className={styles.listName}>{item.boothName}</p>
                <p className={styles.listCategory}>{item.category} · {item.investorCount}명</p>
              </div>
              <p className={styles.listAmount}>{formatKorean(item.totalInvestment)}원</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
