import { useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { boothApi, investmentApi, userApi, resultApi } from '../api'
import { formatKorean } from '../utils/format'
import type { BoothResponse, StockRatingResponse, BoothReviewResponse } from '../types'
import InvestModal from '../components/InvestModal'
import PageBackButton from '../components/PageBackButton'
import { useToast } from '../components/ToastContext'
import styles from './BoothDetailPage.module.css'

type TabType = 'review'

const RATING_CRITERIA = [
  { key: 'scoreFirst', label: '최초' },
  { key: 'scoreBest', label: '최고' },
  { key: 'scoreDifferent', label: '차별화' },
  { key: 'scoreNumberOne', label: '일등' },
  { key: 'scoreGap', label: '초격차' },
  { key: 'scoreGlobal', label: '글로벌' },
] as const

type ScoreKey = typeof RATING_CRITERIA[number]['key']

function formatCommentTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간전`
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function BoothDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const fromPortfolio = (location.state as { from?: string })?.from === 'portfolio'
  const { showToast } = useToast()
  const [booth, setBooth] = useState<BoothResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [modal, setModal] = useState<'invest' | 'withdraw' | null>(null)
  const [investmentEnabled, setInvestmentEnabled] = useState(true)
  const [activeTab] = useState<TabType>('review')

  // 메모
  const [memoOpen, setMemoOpen] = useState(false)
  const initialMemo = id ? (localStorage.getItem(`booth_memo_${id}`) || '') : ''
  const [memo, setMemo] = useState(initialMemo)
  const [memoSaved, setMemoSaved] = useState(initialMemo)

  // 평가 탭
  const [myRating, setMyRating] = useState<StockRatingResponse | null>(null)
  const [ratingLoaded, setRatingLoaded] = useState(false)
  const [ratingScores, setRatingScores] = useState<Record<ScoreKey, number>>({
    scoreFirst: 0, scoreBest: 0, scoreDifferent: 0,
    scoreNumberOne: 0, scoreGap: 0, scoreGlobal: 0,
  })
  const [reviewText, setReviewText] = useState('')
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [boothReviews, setBoothReviews] = useState<BoothReviewResponse[]>([])
  const [reviewsLoaded, setReviewsLoaded] = useState(false)

  const loadData = useCallback(() => {
    if (!id) return
    boothApi.getById(Number(id)).then(res => setBooth(res.data))
    userApi.getMe().then(res => setBalance(res.data.balance))
    resultApi.getInvestmentStatus().then(res => setInvestmentEnabled(res.data.enabled))
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 탭 전환 시 평가 데이터 로드
  useEffect(() => {
    if (!id) return
    if (activeTab === 'review' && !ratingLoaded) {
      boothApi.getMyRating(Number(id)).then(res => {
        if (res.status === 200 && res.data) {
          setMyRating(res.data)
          setRatingScores({
            scoreFirst: res.data.scoreFirst,
            scoreBest: res.data.scoreBest,
            scoreDifferent: res.data.scoreDifferent,
            scoreNumberOne: res.data.scoreNumberOne,
            scoreGap: res.data.scoreGap,
            scoreGlobal: res.data.scoreGlobal,
          })
          setReviewText(res.data.review || '')
        }
        setRatingLoaded(true)
      }).catch(() => setRatingLoaded(true))
    }
    if (activeTab === 'review' && !reviewsLoaded) {
      const loadReviews = async () => {
        try {
          const res = await boothApi.getBoothReviews(Number(id))
          setBoothReviews(res.data)
        } catch { /* ignore */ }
        setReviewsLoaded(true)
      }
      loadReviews()
    }
  }, [activeTab, id, ratingLoaded, reviewsLoaded])

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

  const handleSubmitRating = async () => {
    if (!id || ratingSubmitting) return
    const allScored = (Object.values(ratingScores) as number[]).every(v => v >= 1 && v <= 5)
    if (!allScored) {
      showToast('모든 평가 항목을 입력해주세요', 'error')
      return
    }
    if (reviewText.trim().length > 0 && reviewText.trim().length < 20) {
      showToast('리뷰는 최소 20자 이상 입력해주세요', 'error')
      return
    }
    setRatingSubmitting(true)
    try {
      const res = await boothApi.submitRating(Number(id), {
        ...ratingScores,
        review: reviewText.trim() || undefined,
      })
      setMyRating(res.data)
      setIsEditingRating(false)
      setReviewsLoaded(false)
      loadData()
      showToast(myRating ? '평가가 수정되었습니다!' : '평가가 완료되었습니다!', 'success')
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '평가에 실패했습니다', 'error')
    } finally {
      setRatingSubmitting(false)
    }
  }

  const handleEditRating = () => {
    setIsEditingRating(true)
  }

  const handleCancelEdit = () => {
    if (myRating) {
      setRatingScores({
        scoreFirst: myRating.scoreFirst,
        scoreBest: myRating.scoreBest,
        scoreDifferent: myRating.scoreDifferent,
        scoreNumberOne: myRating.scoreNumberOne,
        scoreGap: myRating.scoreGap,
        scoreGlobal: myRating.scoreGlobal,
      })
      setReviewText(myRating.review || '')
    }
    setIsEditingRating(false)
  }

  const handleDeleteReview = async () => {
    if (!id) return
    try {
      await boothApi.deleteReview(Number(id))
      setReviewText('')
      if (myRating) {
        setMyRating({ ...myRating, review: null })
      }
      setReviewsLoaded(false)
      showToast('리뷰가 삭제되었습니다', 'success')
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '리뷰 삭제에 실패했습니다', 'error')
    }
  }

  if (!booth) return null

  const hasInvestment = booth.myInvestment > 0

  return (
    <div className={styles.container}>
      <PageBackButton to={fromPortfolio ? '/booths?tab=portfolio' : '/home'} label={fromPortfolio ? '나의 투자정보' : '대표작 투자'} style={{ paddingLeft: 20 }} />

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

      {/* 평가 콘텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === 'review' && (
          <div className={styles.ratingContainer}>
            {/* 안내 배너 */}
            <div className={styles.ratingBanner}>
              <span className={styles.ratingBannerIcon}>&#x1F4A1;</span>
              <p className={styles.ratingBannerText}>
                투자자의 관점에서 부스를 평가해주세요.
              </p>
            </div>

            {/* 평가 항목 카드들 */}
            {RATING_CRITERIA.map(({ key, label }) => (
              <div key={key} className={styles.ratingCard}>
                <div className={styles.ratingCardLabel}>
                  <span className={styles.ratingCheckIcon}>
                    {ratingScores[key] > 0 ? '✅' : '⬜'}
                  </span>
                  <span className={styles.ratingLabelText}>{label}</span>
                </div>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.star} ${ratingScores[key] >= star ? styles.starActive : ''}`}
                      onClick={() => {
                        if (!myRating || isEditingRating) {
                          setRatingScores((prev: Record<ScoreKey, number>) => ({ ...prev, [key]: star }))
                        }
                      }}
                      disabled={!!myRating && !isEditingRating}
                    >
                      &#9733;
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* 리뷰 텍스트 영역 */}
            <div className={styles.reviewSection}>
              <textarea
                className={styles.reviewInput}
                placeholder="리뷰를 작성해주세요 (선택)"
                value={reviewText}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)}
                maxLength={500}
                disabled={!!myRating && !isEditingRating}
              />
              <div className={styles.charCount}>
                {reviewText.trim().length > 0 && reviewText.trim().length < 20
                  ? `${reviewText.trim().length}/20 (최소 20자)`
                  : `${reviewText.length} / 500`}
              </div>
            </div>

            {/* 제출/수정 버튼 */}
            {myRating && !isEditingRating ? (
              <div>
                <div className={styles.ratingCompleted}>
                  <span>평가 완료 (총점: {myRating.totalScore}/30)</span>
                </div>
                <div className={styles.ratingActionRow}>
                  <button className={styles.submitBtn} onClick={handleEditRating}>
                    평가 수정
                  </button>
                  {myRating.review && (
                    <button
                      className={`${styles.submitBtn} ${styles.submitBtnDanger}`}
                      onClick={handleDeleteReview}
                    >
                      리뷰 삭제
                    </button>
                  )}
                </div>
              </div>
            ) : isEditingRating ? (
              <div className={styles.ratingActionRow}>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmitRating}
                  disabled={ratingSubmitting || Object.values(ratingScores).some(v => v === 0)}
                >
                  {ratingSubmitting ? '저장 중...' : '수정 완료'}
                </button>
                <button
                  className={`${styles.submitBtn} ${styles.submitBtnSecondary}`}
                  onClick={handleCancelEdit}
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                className={styles.submitBtnFull}
                onClick={handleSubmitRating}
                disabled={ratingSubmitting || Object.values(ratingScores).some(v => v === 0)}
              >
                {ratingSubmitting ? '제출 중...' : '완료하기'}
              </button>
            )}

            {/* 전체 리뷰 목록 */}
            {boothReviews.length > 0 && (
              <div className={styles.reviewList}>
                <h4 className={styles.reviewListTitle}>리뷰 ({boothReviews.length})</h4>
                {boothReviews.map((r: BoothReviewResponse) => (
                  <div key={r.id} className={styles.reviewItem}>
                    <div className={styles.reviewItemHeader}>
                      <span className={styles.reviewItemAuthor}>
                        {r.userName}{r.userCompany ? ` · ${r.userCompany}` : ''}
                      </span>
                      <span className={styles.reviewItemTime}>{formatCommentTime(r.updatedAt)}</span>
                    </div>
                    <p className={styles.reviewItemText}>{r.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
