import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, investmentApi } from '../api'
import type { UserResponse, InvestmentResponse } from '../types'
import styles from './HomePage.module.css'

function formatCoin(n: number) {
  return n.toLocaleString('ko-KR')
}

export default function HomePage() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [investments, setInvestments] = useState<InvestmentResponse[]>([])
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''

  useEffect(() => {
    userApi.getMe().then(res => setUser(res.data))
    investmentApi.getMy().then(res => setInvestments(res.data))
  }, [])

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.greeting}>{userName}님의 투자</p>
        <div className={styles.balanceSection}>
          <p className={styles.balanceLabel}>보유 코인</p>
          <p className={styles.balanceValue}>
            {user ? formatCoin(user.balance) : '-'} <span className={styles.unit}>코인</span>
          </p>
        </div>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <p className={styles.cardLabel}>총 투자금액</p>
          <p className={styles.cardValue}>{formatCoin(totalInvested)} 코인</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.cardLabel}>투자 부스</p>
          <p className={styles.cardValue}>{investments.length}개</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>내 투자 현황</h3>
          {investments.length > 0 && (
            <button className={styles.moreBtn} onClick={() => navigate('/portfolio')}>
              더보기
            </button>
          )}
        </div>

        {investments.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>아직 투자한 부스가 없어요</p>
            <button className={styles.startBtn} onClick={() => navigate('/booths')}>
              부스 둘러보기
            </button>
          </div>
        ) : (
          <div className={styles.investList}>
            {investments
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((inv, i) => (
                <div
                  key={inv.boothId}
                  className={`${styles.investItem} stagger-item`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/booths/${inv.boothId}`)}
                >
                  <div className={styles.boothIcon} style={{ background: inv.themeColor + '20' }}>
                    <span>{inv.logoEmoji}</span>
                  </div>
                  <div className={styles.investInfo}>
                    <p className={styles.boothName}>{inv.boothName}</p>
                    <p className={styles.investAmount}>{formatCoin(inv.amount)} 코인</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
