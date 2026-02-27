import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, investmentApi, boothApi } from '../api'
import { formatKorean } from '../utils/format'
import type { BoothResponse } from '../types'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''
  const userCompany = localStorage.getItem('userCompany') || ''
  const [balance, setBalance] = useState<number | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)
  const [booths, setBooths] = useState<BoothResponse[]>([])

  useEffect(() => {
    userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
    investmentApi.getMy().then(res => {
      const total = res.data.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
      setTotalInvested(total)
    }).catch(() => {})
    boothApi.getAll().then(res => setBooths(res.data)).catch(() => {})
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

  return (
    <div className={styles.container}>
      {/* 유저 정보 + 투자 금액 카드 */}
      <div className={styles.investCard}>
        <div className={styles.cardTop}>
          <p className={styles.cardCompany}>{userCompany || '2026 ONLYONE FAIR'}</p>
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

      {/* 투자 종목 전체 */}
      <div className={styles.boothSection}>
        <div className={styles.stockSection}>
          <h3 className={styles.stockSectionTitle}>투자 종목</h3>
          <p className={styles.stockSectionSubtitle}>여러 종목을 살펴보고 관심 있는 종목에 투자하세요.</p>

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
