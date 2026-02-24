import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockApi } from '../api'
import type { StockBoothResponse } from '../types'
import styles from './StockBoothListPage.module.css'

function formatStockAmount(n: number) {
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1) + '조'
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(0) + '억'
  if (n >= 10_000) return (n / 10_000).toFixed(0) + '만'
  return n.toLocaleString('ko-KR')
}

export default function StockBoothListPage() {
  const [booths, setBooths] = useState<StockBoothResponse[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    stockApi.getBooths().then(res => setBooths(res.data))
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>주식 종목</h2>
        <p className={styles.subtitle}>투자할 종목을 선택하세요</p>
      </div>

      <div className={styles.list}>
        {booths.map((booth, i) => (
          <div
            key={booth.id}
            className={`${styles.item} stagger-item`}
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => navigate(`/stocks/booths/${booth.id}`)}
          >
            <div className={styles.icon} style={{ background: booth.themeColor + '30' }}>
              <span>{booth.logoEmoji}</span>
            </div>
            <div className={styles.info}>
              <p className={styles.name}>{booth.name}</p>
              <p className={styles.category}>{booth.category}</p>
            </div>
            <div className={styles.priceArea}>
              <p className={styles.currentPrice}>{formatStockAmount(booth.currentPrice)}원</p>
              <p className={styles.totalHolding}>총 {formatStockAmount(booth.totalHolding)}원</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
