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

  // 메모
  const [memoOpen, setMemoOpen] = useState(false)
  const [memo, setMemo] = useState('')
  const [memoSaved, setMemoSaved] = useState('')

  const loadData = useCallback(() => {
    if (!id) return
    boothApi.getById(Number(id)).then(res => setBooth(res.data))
    userApi.getMe().then(res => setBalance(res.data.balance))
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 메모 로드
  useEffect(() => {
    if (!id) return
    const saved = localStorage.getItem(`booth_memo_${id}`) || ''
    setMemo(saved)
    setMemoSaved(saved)
  }, [id])

  const handleMemoSave = () => {
    if (!id) return
    localStorage.setItem(`booth_memo_${id}`, memo)
    setMemoSaved(memo)
    setMemoOpen(false)
  }

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

  const hasInvestment = booth.myInvestment > 0

  return (
    <div className={styles.container}>
      {/* 종목 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
              <h2 className={styles.name}>{booth.name}</h2>
              <span className={styles.category}>{booth.category}</span>
            </div>
          </div>
        </div>
        <button
          className={`${styles.memoBtn} ${memoSaved ? styles.memoBtnActive : ''}`}
          onClick={() => setMemoOpen(true)}
        >
          메모
        </button>
      </div>

      {/* 소개 */}
      {booth.description && (
        <div className={styles.description}>
          <p className={styles.descText}>{booth.description}</p>
        </div>
      )}

      {/* 내 투자금 행 */}
      <div className={styles.myInvestRow}>
        <span className={styles.myInvestLabel}>내 투자금</span>
        <span className={styles.myInvestValue}>
          {formatKorean(booth.myInvestment)}원
          <span className={styles.myInvestArrow}> ›</span>
        </span>
      </div>

      {/* 투자하기 / 철회하기 버튼 */}
      <div className={styles.tradeSection}>
        {hasInvestment ? (
          <div className={styles.tradeBtnRow}>
            <button
              className={styles.withdrawBtn}
              onClick={() => setModal('withdraw')}
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
        ) : (
          <button
            className={styles.investBtnFull}
            onClick={() => setModal('invest')}
            disabled={balance === 0}
          >
            투자하기
          </button>
        )}
      </div>

      {/* 투자/철회 모달 */}
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

      {/* 메모 팝업 */}
      {memoOpen && (
        <div className={styles.memoOverlay} onClick={() => { setMemo(memoSaved); setMemoOpen(false) }}>
          <div className={styles.memoPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.memoPopupHeader}>
              <h3 className={styles.memoPopupTitle}>메모</h3>
              <button className={styles.memoCloseBtn} onClick={() => { setMemo(memoSaved); setMemoOpen(false) }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <textarea
              className={styles.memoTextarea}
              placeholder="이 부스에 대한 메모를 작성하세요..."
              value={memo}
              onChange={e => setMemo(e.target.value)}
              autoFocus
            />
            <div className={styles.memoActions}>
              {memoSaved && (
                <button
                  className={styles.memoDeleteBtn}
                  onClick={() => { setMemo(''); localStorage.removeItem(`booth_memo_${id}`); setMemoSaved(''); setMemoOpen(false) }}
                >
                  삭제
                </button>
              )}
              <button className={styles.memoSaveBtn} onClick={handleMemoSave}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
