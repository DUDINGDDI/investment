import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { boothApi } from '../api'
import type { BoothResponse } from '../types'
import styles from './BoothListPage.module.css'

function formatWon(n: number) {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + '억'
  if (n >= 10_000) return (n / 10_000).toFixed(0) + '만'
  return n.toLocaleString('ko-KR')
}

export default function BoothListPage() {
  const [booths, setBooths] = useState<BoothResponse[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    boothApi.getAll().then(res => setBooths(res.data))
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>부스 목록</h2>
        <p className={styles.subtitle}>투자하고 싶은 부스를 선택하세요</p>
      </div>

      <div className={styles.list}>
        {booths.map((booth, i) => (
          <div
            key={booth.id}
            className={`${styles.item} stagger-item`}
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => navigate(`/booths/${booth.id}`)}
          >
            <div className={styles.icon} style={{ background: booth.themeColor + '30' }}>
              <span>{booth.logoEmoji}</span>
            </div>
            <div className={styles.info}>
              <p className={styles.name}>{booth.name}</p>
              <p className={styles.category}>{booth.category}</p>
            </div>
            <div className={styles.amount}>
              <p className={styles.totalAmount}>{formatWon(booth.totalInvestment)}</p>
              <p className={styles.amountLabel}>원</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
