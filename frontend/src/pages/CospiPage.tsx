import { useEffect, useState } from 'react'
import { stockApi } from '../api'
import { formatKorean } from '../utils/format'
import PriceChart from '../components/PriceChart'
import type { CospiResponse } from '../types'
import styles from './CospiPage.module.css'

export default function CospiPage() {
  const [data, setData] = useState<CospiResponse | null>(null)

  useEffect(() => {
    stockApi.getCospi().then(res => setData(res.data)).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📈</div>
          <p className={styles.emptyText}>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const { currentTotal, change, changeRate, history } = data

  const getChangeClass = () => {
    if (change > 0) return styles.changeUp
    if (change < 0) return styles.changeDown
    return styles.changeNeutral
  }

  const getChangeText = () => {
    if (change > 0) return `▲ ${formatKorean(change)}원 (+${changeRate}%)`
    if (change < 0) return `▼ ${formatKorean(Math.abs(change))}원 (${changeRate}%)`
    return '변동 없음'
  }

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerIcon}>📈</div>
        <div className={styles.bannerContent}>
          <div className={styles.bannerTitle}>COSPI</div>
          <div className={styles.bannerFull}>CJ One Stock Price Index</div>
          <div className={styles.bannerDesc}>
            모든 부스의 투자금 총합을 나타내는 지수입니다.
            시장 전체의 흐름을 한눈에 확인하세요.
          </div>
        </div>
      </div>

      <div className={styles.priceCard}>
        <p className={styles.priceLabel}>COSPI 지수</p>
        <div className={styles.priceRight}>
          <p className={styles.priceValue}>
            {formatKorean(currentTotal)}
            <span className={styles.priceUnit}>원</span>
          </p>
          <span className={getChangeClass()}>{getChangeText()}</span>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>지수 추이</h3>
        <PriceChart priceHistory={history} themeColor={change >= 0 ? '#ef4444' : '#3b82f6'} />
      </div>
    </div>
  )
}
