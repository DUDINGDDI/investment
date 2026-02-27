import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, investmentApi, boothApi, stockApi } from '../api'
import { formatKorean } from '../utils/format'
import PriceChart from '../components/PriceChart'
import type { BoothResponse, CospiResponse } from '../types'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''
  const userCompany = localStorage.getItem('userCompany') || ''
  const [balance, setBalance] = useState<number | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)
  const [booths, setBooths] = useState<BoothResponse[]>([])
  const [cospi, setCospi] = useState<CospiResponse | null>(null)

  useEffect(() => {
    userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
    investmentApi.getMy().then(res => {
      const total = res.data.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
      setTotalInvested(total)
    }).catch(() => {})
    boothApi.getAll().then(res => setBooths(res.data)).catch(() => {})
    stockApi.getCospi().then(res => setCospi(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = () => {
      userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
      investmentApi.getMy().then(res => {
        const total = res.data.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
        setTotalInvested(total)
      }).catch(() => {})
    }
    window.addEventListener('balance-changed', handler)
    return () => window.removeEventListener('balance-changed', handler)
  }, [])

  const [boothPage, setBoothPage] = useState(0)
  const PAGE_SIZE = 10

  const totalAsset = (balance || 0) + totalInvested

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

  return (
    <div className={styles.container}>
      {/* 유저 정보 + 투자 금액 카드 */}
      <div className={styles.investCard}>
        <div className={styles.cardTop}>
          <p className={styles.cardCompany}>{userCompany || 'ONLYONE FAIR'}</p>
          <p className={styles.cardGreeting}>{userName}님의 현재 투자 금액</p>
          <div className={styles.cardAmountRow}>
            <p className={styles.cardAmount}>{formatKorean(totalInvested)}원</p>
            <button className={styles.cardBtn} onClick={() => navigate('/booths?tab=portfolio')}>나의 투자 정보</button>
          </div>
        </div>
        <div className={styles.cardBottom}>
          <div className={styles.cardBottomItem}>
            <div className={styles.cardAssetDot} style={{ background: '#4FC3F7' }} />
            <span className={styles.cardAssetLabel}>총 보유 자산</span>
            <span className={styles.cardAssetValue}>{formatKorean(totalAsset)}원</span>
          </div>
          <div className={styles.cardBottomItem}>
            <div className={styles.cardAssetDot} style={{ background: '#FFB74D' }} />
            <span className={styles.cardAssetLabel}>투자 금액</span>
            <span className={styles.cardAssetValue}>{formatKorean(totalInvested)}원</span>
          </div>
        </div>
      </div>

      {/* 주식 종목 전체 (인라인) */}
      <div className={styles.boothSection}>
        {/* COSPI 배너 */}
        <div className={styles.cospiBanner}>
          <div className={styles.cospiIcon}>📈</div>
          <div className={styles.cospiContent}>
            <p className={styles.cospiFull}>CJ ONLYONE Stock Price Index</p>
            <p className={styles.cospiTitle}>COSPI</p>
            <p className={styles.cospiDesc}>
              모든 부스의 투자금 총합을 나타내는 지수입니다. 시장 전체의 흐름을 한눈에 확인하세요.
            </p>
          </div>
        </div>

        {/* COSPI 지수 + 차트 */}
        {cospi && (
          <>
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
          </>
        )}

        {/* 주식 종목 리스트 */}
        <div className={styles.stockSection}>
          <h3 className={styles.stockSectionTitle}>주식 종목</h3>
          <p className={styles.stockSectionSubtitle}>여러 주식 종목을 살펴보고 관심 있는 종목에 투자하세요.</p>

          <div className={styles.list}>
            {booths.slice(boothPage * PAGE_SIZE, (boothPage + 1) * PAGE_SIZE).map((booth, i) => (
              <div
                key={booth.id}
                className={`${styles.boothItem} stagger-item`}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => navigate(`/booths/${booth.id}`)}
              >
                <div className={styles.boothInfo}>
                  <p className={styles.boothName}>{booth.name}</p>
                  <p className={styles.boothCategory}>{booth.category}</p>
                </div>
                <div className={styles.boothArrow}>›</div>
              </div>
            ))}
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
                {boothPage + 1} / {Math.ceil(booths.length / PAGE_SIZE)}
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
      </div>
    </div>
  )
}
