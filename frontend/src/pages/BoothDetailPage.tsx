import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { boothApi, investmentApi, userApi } from '../api'
import { formatKorean } from '../utils/format'
import type { BoothResponse } from '../types'
import InvestModal from '../components/InvestModal'
import { useToast } from '../components/ToastContext'
import styles from './BoothDetailPage.module.css'

export default function BoothDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [booth, setBooth] = useState<BoothResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [modal, setModal] = useState<'invest' | 'withdraw' | null>(null)

  const loadData = useCallback(() => {
    if (!id) return
    boothApi.getById(Number(id)).then(res => setBooth(res.data))
    userApi.getMe().then(res => setBalance(res.data.balance))
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleInvest = async (amount: number) => {
    try {
      await investmentApi.invest({ boothId: Number(id), amount })
      showToast(`${formatKorean(amount)}원 투자 완료!`, 'success')
      setModal(null)
      loadData()
      window.dispatchEvent(new Event('balance-changed'))
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '투자에 실패했습니다', 'error')
    }
  }

  const handleWithdraw = async (amount: number) => {
    try {
      await investmentApi.withdraw({ boothId: Number(id), amount })
      showToast(`${formatKorean(amount)}원 철회 완료!`, 'success')
      setModal(null)
      loadData()
      window.dispatchEvent(new Event('balance-changed'))
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '철회에 실패했습니다', 'error')
    }
  }

  if (!booth) return null

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#ECECEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.header}>
        <div className={styles.iconLarge} style={{ background: booth.themeColor + '30' }}>
          <span>{booth.logoEmoji}</span>
        </div>
        <h2 className={styles.name}>{booth.name}</h2>
        <span className={styles.badge} style={{ background: booth.themeColor + '30', color: booth.themeColor }}>
          {booth.category}
        </span>
      </div>

      <div className={styles.investSection}>
        <div className={styles.investRow}>
          <span className={styles.investLabel}>내 투자금</span>
          <span className={styles.investValueMy}>{formatKorean(booth.myInvestment)}원</span>
        </div>
      </div>

      <div className={styles.description}>
        <h3 className={styles.descTitle}>소개</h3>
        <p className={styles.descText}>{booth.description}</p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.withdrawBtn}
          onClick={() => setModal('withdraw')}
          disabled={booth.myInvestment === 0}
        >
          철회하기
        </button>
        <button
          className={styles.investBtn}
          onClick={() => setModal('invest')}
          disabled={balance === 0}
        >
          투자하기
        </button>
      </div>

      {modal === 'invest' && (
        <InvestModal
          type="invest"
          boothName={booth.name}
          maxAmount={balance}
          onConfirm={handleInvest}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'withdraw' && (
        <InvestModal
          type="withdraw"
          boothName={booth.name}
          maxAmount={booth.myInvestment}
          onConfirm={handleWithdraw}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
