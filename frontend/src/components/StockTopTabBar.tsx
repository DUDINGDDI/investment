import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { stockApi } from '../api'
import styles from './StockTopTabBar.module.css'

const tabs = [
  { path: '/stocks', label: '홈' },
  { path: '/stocks/booths', label: '종목' },
  { path: '/stocks/history', label: '이력' },
]

function formatStockAmount(n: number): string {
  return n.toLocaleString('ko-KR')
}

export default function StockTopTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number | null>(null)
  const [totalHolding, setTotalHolding] = useState(0)
  const userName = localStorage.getItem('userName') || ''

  useEffect(() => {
    stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
    stockApi.getMy().then(res => {
      const total = res.data.reduce((sum: number, h: { amount: number }) => sum + h.amount, 0)
      setTotalHolding(total)
    }).catch(() => {})
  }, [location.pathname])

  const isActive = (path: string) => {
    if (path === '/stocks/booths') return location.pathname.startsWith('/stocks/booths')
    if (path === '/stocks') return location.pathname === '/stocks'
    return location.pathname === path
  }

  // /stocks로 시작하는 경로에서만 표시
  if (!location.pathname.startsWith('/stocks')) return null

  const totalAsset = (balance || 0) + totalHolding

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.greeting}>{userName}님의 주식</p>
        <p className={styles.balanceValue}>
          {balance !== null ? formatStockAmount(balance) : '-'}
          <span className={styles.unit}> 원</span>
        </p>
      </div>

      <div className={styles.assetBox}>
        <div className={styles.assetRow}>
          <span className={styles.assetLabel}>총 자산</span>
          <span className={styles.assetValue}>{formatStockAmount(totalAsset)}원</span>
        </div>
        <div className={styles.assetDetail}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>보유 잔액</span>
            <span className={styles.detailValue}>{formatStockAmount(balance || 0)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>보유 금액</span>
            <span className={styles.detailValue}>{formatStockAmount(totalHolding)}</span>
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
