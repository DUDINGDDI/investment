import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, investmentApi } from '../api'
import { formatKorean } from '../utils/format'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const userName = sessionStorage.getItem('userName') || ''
  const userCompany = sessionStorage.getItem('userCompany') || ''
  const [balance, setBalance] = useState<number | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)

  useEffect(() => {
    userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
    investmentApi.getMy().then(res => {
      const total = res.data.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
      setTotalInvested(total)
    }).catch(() => {})
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

  const totalAsset = (balance || 0) + totalInvested

  return (
    <div className={styles.container}>
      {/* 유저 정보 + 투자 금액 카드 */}
      <div className={styles.investCard}>
        <div className={styles.cardTop}>
          <p className={styles.cardCompany}>{userCompany || 'ONLYONE FAIR'}</p>
          <p className={styles.cardGreeting}>{userName}님의 현재 투자 금액</p>
          <div className={styles.cardAmountRow}>
            <p className={styles.cardAmount}>{formatKorean(totalInvested)}원</p>
            <button className={styles.cardBtn} onClick={() => navigate('/booths')}>주식 종목 보기</button>
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
    </div>
  )
}
