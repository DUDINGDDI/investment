import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { boothApi, investmentApi, userApi, resultApi } from '../api'
import { formatKorean } from '../utils/format'
import type { BoothResponse } from '../types'
import InvestModal from '../components/InvestModal'
import PageBackButton from '../components/PageBackButton'
import { useToast } from '../components/ToastContext'
import styles from './BoothDetailPage.module.css'

export default function BoothDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const fromState = (location.state as { from?: string })?.from
  const fromPortfolio = fromState === 'portfolio'
  const fromMemo = fromState === 'memo'
  const { showToast } = useToast()
  const [booth, setBooth] = useState<BoothResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [modal, setModal] = useState<'invest' | 'withdraw' | null>(null)
  const [investmentEnabled, setInvestmentEnabled] = useState(true)

  // 메모
  const [memo, setMemo] = useState('')
  const [memoSaved, setMemoSaved] = useState('')

  const loadData = useCallback(() => {
    if (!id) return
    boothApi.getById(Number(id)).then(res => setBooth(res.data))
    userApi.getMe().then(res => setBalance(res.data.balance))
    resultApi.getInvestmentStatus().then(res => setInvestmentEnabled(res.data.enabled))
    boothApi.getMemo(Number(id)).then(res => {
      setMemo(res.data.content || '')
      setMemoSaved(res.data.content || '')
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMemoSave = () => {
    if (!id) return
    boothApi.saveMemo(Number(id), memo).then(() => {
      setMemoSaved(memo)
    }).catch(() => {})
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
      <PageBackButton to={fromMemo ? '/mypage?tab=memos' : fromPortfolio ? '/booths?tab=portfolio' : '/home'} label={fromMemo ? '메모 목록' : fromPortfolio ? '나의 투자정보' : '대표작 투자'} style={{ paddingLeft: 20 }} />

      {/* 종목 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
              <h2 className={styles.name}>{booth.name}</h2>
              <span className={styles.category}>{booth.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 소개 */}
      {booth.description && (
        <div className={styles.description}>
          <p className={styles.descText}>{booth.description}</p>
        </div>
      )}

      {/* 내 투자금 행 */}
      <div className={styles.myInvestRow}>
        <span className={styles.myInvestLabel}>금액</span>
        <span className={styles.myInvestValue}>
          {formatKorean(booth.myInvestment)}원
        </span>
      </div>

      {/* 투자하기 / 철회하기 버튼 */}
      <div className={styles.tradeSection}>
        {!investmentEnabled ? (
          <button className={styles.investBtnFull} disabled>
            현재 투자가 중지된 상태입니다
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* 메모 */}
      <div className={styles.memoSection}>
        <h4 className={styles.memoSectionTitle}>메모</h4>
        <p className={styles.memoSectionDesc}>해당 아이디어에 투자한 이유를 적어주세요</p>
        <textarea
          className={styles.memoTextarea}
          placeholder=""
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
        <div className={styles.memoActions}>
          {memoSaved && (
            <button
              className={styles.memoDeleteBtn}
              onClick={() => { setMemo(''); boothApi.deleteMemo(Number(id)).catch(() => {}); setMemoSaved(''); }}
            >
              삭제
            </button>
          )}
          <button className={styles.memoSaveBtn} onClick={handleMemoSave}>
            저장
          </button>
        </div>
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
    </div>
  )
}
