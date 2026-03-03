import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { userApi, investmentApi } from '../api'
import { formatKorean } from '../utils/format'
import styles from './TopTabBar.module.css'

const tabs = [
  { path: '/home', label: '홈' },
  { path: '/booths', label: '부스' },
  { path: '/history', label: '이력' },
  { path: '/result', label: '결과' },
]

export default function TopTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)
  const userName = localStorage.getItem('userName') || ''

  const fetchData = useCallback(() => {
    userApi.getMe().then(res => setBalance(res.data.balance)).catch(() => {})
    investmentApi.getMy().then(res => {
      const total = res.data.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
      setTotalInvested(total)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetchData()
  }, [location.pathname, fetchData])

  useEffect(() => {
    window.addEventListener('balance-changed', fetchData)
    return () => window.removeEventListener('balance-changed', fetchData)
  }, [fetchData])

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
        <p className={styles.greeting}>{userName}님의 현재 투자 금액</p>
        <p className={styles.balanceValue}>
          {formatKorean(totalInvested)}
          <span className={styles.unit}> 원</span>
        </p>
        <div className={styles.subRow}>
          <span className={styles.subItem}>잔여 투자 금액 <strong>{formatKorean(balance || 0)}</strong>원</span>
          <span className={styles.subDivider}>|</span>
          <span className={styles.subItem}>총 자산 <strong>{formatKorean(totalAsset)}</strong>원</span>
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
