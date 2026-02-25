import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { userApi, investmentApi } from '../api'
import styles from './TopTabBar.module.css'

const tabs = [
  { path: '/home', label: '홈' },
  { path: '/booths', label: '부스' },
  { path: '/history', label: '이력' },
  { path: '/result', label: '결과' },
]

function formatWon(n: number) {
  return n.toLocaleString('ko-KR')
}

export default function TopTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)
  const userName = sessionStorage.getItem('userName') || ''

  useEffect(() => {
    userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
    investmentApi.getMy().then(res => {
      const total = res.data.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
      setTotalInvested(total)
    }).catch(() => {})
  }, [location.pathname])

  const isActive = (path: string) => {
    if (path === '/booths') return location.pathname.startsWith('/booths')
    return location.pathname === path
  }

  // 투자 관련 페이지에서만 표시
  const investPaths = ['/home', '/booths', '/history', '/result']
  const show = investPaths.some(p =>
    p === '/booths' ? location.pathname.startsWith('/booths') : location.pathname === p
  )
  if (!show) return null

  const totalAsset = (balance || 0) + totalInvested

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.greeting}>{userName}님의 투자</p>
        <p className={styles.balanceValue}>
          {balance !== null ? formatWon(balance) : '-'}
          <span className={styles.unit}> 원</span>
        </p>
      </div>

      <div className={styles.assetBox}>
        <div className={styles.assetRow}>
          <span className={styles.assetLabel}>총 자산</span>
          <span className={styles.assetValue}>{formatWon(totalAsset)}원</span>
        </div>
        <div className={styles.assetDetail}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>보유 금액</span>
            <span className={styles.detailValue}>{formatWon(balance || 0)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>투자 금액</span>
            <span className={styles.detailValue}>{formatWon(totalInvested)}</span>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.path}
            className={`${styles.tab} ${isActive(tab.path) ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
