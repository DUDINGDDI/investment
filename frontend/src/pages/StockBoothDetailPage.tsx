import { useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { useParams, useSearchParams, useLocation } from 'react-router-dom'
import { stockApi, resultApi } from '../api'
import { formatKorean } from '../utils/format'
import type { StockBoothResponse, StockCommentResponse, StockRatingResponse, BoothReviewResponse } from '../types'
import StockTradeModal from '../components/StockTradeModal'
import PageBackButton from '../components/PageBackButton'
import { useToast } from '../components/ToastContext'
import { useMissions } from '../components/MissionContext'
import styles from './StockBoothDetailPage.module.css'

type TabType = 'rating' | 'invest' | 'sincere' | 'develop'

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

export default function StockBoothDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const fromPortfolio = (location.state as { from?: string })?.from === 'portfolio'
  const { showToast } = useToast()
  const { syncFromServer } = useMissions()
  const [booth, setBooth] = useState<StockBoothResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [modal, setModal] = useState<'buy' | 'sell' | null>(null)
  const [stockEnabled, setStockEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'rating' || tab === 'invest' || tab === 'sincere' || tab === 'develop') return tab
    return 'rating'
  })

  // 메모
  const [memoOpen, setMemoOpen] = useState(() => searchParams.get('memo') === 'open')
  const [memo, setMemo] = useState('')
  const [memoSaved, setMemoSaved] = useState('')

  // 종목토론방 탭
  const [comments, setComments] = useState<StockCommentResponse[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const currentUserId = Number(localStorage.getItem('userId') || '0')
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
    stockApi.getBoothById(Number(id)).then(res => setBooth(res.data))
    stockApi.getAccount().then(res => setBalance(res.data.balance))
    resultApi.getStockStatus().then(res => setStockEnabled(res.data.enabled))
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 메모 로드
  useEffect(() => {
    if (!id) return
    const saved = localStorage.getItem(`stock_memo_${id}`) || ''
    setMemo(saved)
    setMemoSaved(saved)
  }, [id])

  const handleMemoSave = () => {
    if (!id) return
    localStorage.setItem(`stock_memo_${id}`, memo)
    setMemoSaved(memo)
    setMemoOpen(false)
  }

  // 탭 전환 시 데이터 로드
  useEffect(() => {
    if (!id) return
    if (activeTab === 'develop' && !commentsLoaded) {
      stockApi.getComments(Number(id)).then(res => {
        setComments(res.data)
        setCommentsLoaded(true)
      })
    }
    if ((activeTab === 'rating' || activeTab === 'sincere') && !ratingLoaded) {
      stockApi.getMyRating(Number(id)).then(res => {
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
    if (activeTab === 'sincere' && !reviewsLoaded) {
      const loadReviews = async () => {
        try {
          const res = await stockApi.getBoothReviews(Number(id))
          setBoothReviews(res.data)
        } catch { /* ignore */ }
        setReviewsLoaded(true)
      }
      loadReviews()
    }
  }, [activeTab, id, commentsLoaded, ratingLoaded, reviewsLoaded])

  const handleBuy = async (amount: number) => {
    try {
      await stockApi.buy({ boothId: Number(id), amount })
      showToast(`${formatKorean(amount)}원 투자 완료!`, 'success')
      setModal(null)
      loadData()
      window.dispatchEvent(new Event('balance-changed'))
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '투자에 실패했습니다', 'error')
    }
  }

  const handleSell = async (amount: number) => {
    try {
      await stockApi.sell({ boothId: Number(id), amount })
      showToast(`${formatKorean(amount)}원 철회 완료!`, 'success')
      setModal(null)
      loadData()
      window.dispatchEvent(new Event('balance-changed'))
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '철회에 실패했습니다', 'error')
    }
  }

  const handleAddComment = async () => {
    if (!id || !commentInput.trim() || submitting) return
    if (commentInput.trim().length < 70) {
      showToast('최소 70자 이상 입력해주세요', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await stockApi.addComment(Number(id), commentInput.trim())
      setComments(prev => [res.data, ...prev])
      setCommentInput('')
      showToast('제안이 등록되었습니다!', 'success')
      syncFromServer()
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '제안 등록에 실패했습니다', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: number) => {
    if (!id || !editContent.trim() || submitting) return
    if (editContent.trim().length < 70) {
      showToast('최소 70자 이상 입력해주세요', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await stockApi.updateComment(Number(id), commentId, editContent.trim())
      setComments(prev => prev.map(c => c.id === commentId ? res.data : c))
      setEditingId(null)
      setEditContent('')
      showToast('수정되었습니다', 'success')
      syncFromServer()
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '수정에 실패했습니다', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!id || !confirm('정말 삭제하시겠습니까?')) return
    try {
      await stockApi.deleteComment(Number(id), commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      showToast('삭제되었습니다', 'success')
      syncFromServer()
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '삭제에 실패했습니다', 'error')
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
      const res = await stockApi.submitRating(Number(id), {
        ...ratingScores,
        review: reviewText.trim() || undefined,
      })
      setMyRating(res.data)
      setIsEditingRating(false)
      setReviewsLoaded(false)
      showToast(myRating ? '평가가 수정되었습니다!' : '평가가 완료되었습니다!', 'success')
      loadData()
      syncFromServer()
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
      await stockApi.deleteReview(Number(id))
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

  const canTrade = booth.hasVisited && booth.hasRated
  const hasHolding = booth.myHolding > 0

  return (
    <div className={styles.container}>
      <PageBackButton to={fromPortfolio ? '/stocks/booths?tab=portfolio' : '/stocks/booths'} label={fromPortfolio ? '나의 투자정보' : '주식 종목'} style={{ paddingLeft: 20 }} />

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

      {/* 칩 탭: 평가 / 투자 / 진정성 있게 / 내일 더 새롭게 */}
      <div className={styles.chipTabBar}>
        {([
          { key: 'rating' as TabType, label: '평가' },
          { key: 'invest' as TabType, label: '투자' },
          { key: 'sincere' as TabType, label: '진정성 있게' },
          { key: 'develop' as TabType, label: '내일 더 새롭게' },
        ]).map(tab => (
          <button
            key={tab.key}
            className={`${styles.chipTab} ${activeTab === tab.key ? styles.chipTabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className={styles.tabContent}>
        {/* 평가 탭 - 별점만 */}
        {activeTab === 'rating' && (
          <div className={styles.ratingContainer}>
            {!booth.hasVisited ? (
              <div className={styles.inputLocked}>
                <span className={styles.lockIcon}>&#x1F512;</span>
                <p className={styles.lockTitle}>부스를 방문한 후에 평가할 수 있습니다</p>
              </div>
            ) : (
              <>
                <div className={styles.discussionBanner}>
                  <span className={styles.discussionBannerIcon}>&#x1F4A1;</span>
                  <p className={styles.discussionBannerText}>
                    투자자의 관점에서 아이디어를 평가하고 미션을 완료하세요.
                  </p>
                </div>

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

                {myRating && !isEditingRating ? (
                  <div>
                    <div className={styles.ratingCompleted}>
                      <span>평가 완료 (총점: {myRating.totalScore}/30)</span>
                    </div>
                    <div className={styles.ratingActionRow}>
                      <button className={styles.submitBtn} onClick={handleEditRating}>
                        평가 수정
                      </button>
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
              </>
            )}
          </div>
        )}

        {/* 투자 탭 */}
        {activeTab === 'invest' && (
          <div className={styles.ratingContainer}>
            {/* 내 투자금 행 */}
            <div className={styles.myInvestRow}>
              <span className={styles.myInvestLabel}>금액</span>
              <span className={styles.myInvestValue}>
                {formatKorean(booth.myHolding)}원
              </span>
            </div>

            <div className={styles.tradeSection}>
              {!stockEnabled ? (
                <button className={styles.investBtnFull} disabled>
                  현재 하고잡이 투자가 중지된 상태입니다
                </button>
              ) : (
                <>
                  {!canTrade && (
                    <p className={styles.tradeGuide}>
                      {!booth.hasVisited
                        ? 'QR 스캔으로 부스를 방문해주세요'
                        : '평가를 완료하면 투자/철회가 가능합니다'}
                    </p>
                  )}
                  {hasHolding ? (
                    <div className={styles.tradeBtnRow}>
                      <button
                        className={styles.withdrawBtn}
                        onClick={() => setModal('sell')}
                        disabled={!canTrade}
                      >
                        철회하기
                      </button>
                      <button
                        className={styles.investBtn}
                        onClick={() => setModal('buy')}
                        disabled={!canTrade || balance === 0 || booth.myHolding >= 30_000_000}
                      >
                        투자하기
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.investBtnFull}
                      onClick={() => setModal('buy')}
                      disabled={!canTrade || balance === 0}
                    >
                      투자하기
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 진정성 있게 탭 - 리뷰 작성 */}
        {activeTab === 'sincere' && (
          <div className={styles.ratingContainer}>
            {!booth.hasVisited ? (
              <div className={styles.inputLocked}>
                <span className={styles.lockIcon}>&#x1F512;</span>
                <p className={styles.lockTitle}>부스를 방문한 후에 리뷰를 작성할 수 있습니다</p>
              </div>
            ) : (
              <>
                <div className={styles.reviewSection}>
                  <textarea
                    className={styles.reviewInput}
                    placeholder="리뷰를 작성해주세요 (최소 20자)"
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

                {myRating && myRating.review && !isEditingRating ? (
                  <div className={styles.ratingActionRow}>
                    <button className={styles.submitBtn} onClick={handleEditRating}>
                      리뷰 수정
                    </button>
                    <button
                      className={`${styles.submitBtn} ${styles.submitBtnDanger}`}
                      onClick={handleDeleteReview}
                    >
                      리뷰 삭제
                    </button>
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
                    disabled={!myRating || ratingSubmitting || Object.values(ratingScores).some(v => v === 0)}
                  >
                    {!myRating ? '평가 탭에서 별점을 먼저 완료해주세요' : ratingSubmitting ? '제출 중...' : '리뷰 저장'}
                  </button>
                )}

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
              </>
            )}
          </div>
        )}

        {/* 내일 더 새롭게 탭 - 아이디어 Develop Zone */}
        {activeTab === 'develop' && (
          <div className={styles.ratingContainer}>
            {!booth.hasVisited ? (
              <div className={styles.inputLocked}>
                <span className={styles.lockIcon}>&#x1F512;</span>
                <p className={styles.lockTitle}>부스를 방문한 후에 제안을 남길 수 있습니다</p>
              </div>
            ) : (
              <>
                <div className={styles.reviewSection}>
                  <textarea
                    className={styles.reviewInput}
                    placeholder="개선 아이디어를 제안해주세요 (최소 70자)"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    maxLength={500}
                    disabled={submitting}
                  />
                  <div className={styles.charCount}>
                    {commentInput.trim().length > 0 && commentInput.trim().length < 70
                      ? `${commentInput.trim().length}/70 (최소 70자)`
                      : `${commentInput.length} / 500`}
                  </div>
                </div>

                <button
                  className={styles.submitBtnFull}
                  onClick={handleAddComment}
                  disabled={!commentInput.trim() || commentInput.trim().length < 70 || submitting}
                >
                  {submitting ? '제출 중...' : '아이디어 제안하기'}
                </button>
              </>
            )}

            {comments.length > 0 && (
              <div className={styles.reviewList}>
                <h4 className={styles.reviewListTitle}>전체 아이디어 ({comments.length})</h4>
                {comments.map((comment, index) => (
                  <div key={comment.id} className={`${styles.reviewItem} stagger-item`} style={{ animationDelay: `${index * 0.02}s` }}>
                    <div className={styles.reviewItemHeader}>
                      <span className={styles.reviewItemAuthor}>
                        {comment.userName}{comment.userCompany ? ` · ${comment.userCompany}` : ''}
                      </span>
                      <span className={styles.reviewItemTime}>
                        {formatCommentTime(comment.createdAt)}
                        {comment.userId === currentUserId && editingId !== comment.id && (
                          <>
                            <button className={styles.commentActionBtn} onClick={() => { setEditingId(comment.id); setEditContent(comment.content) }}>수정</button>
                            <button className={`${styles.commentActionBtn} ${styles.commentDeleteBtn}`} onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                          </>
                        )}
                      </span>
                    </div>
                    {editingId === comment.id ? (
                      <div className={styles.reviewSection}>
                        <textarea
                          className={styles.reviewInput}
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          maxLength={500}
                          rows={3}
                        />
                        <div className={styles.charCount}>{editContent.trim().length}/70</div>
                        <div className={styles.ratingActionRow}>
                          <button
                            className={styles.submitBtn}
                            onClick={() => handleEditComment(comment.id)}
                            disabled={!editContent.trim() || editContent.trim().length < 70 || submitting}
                          >{submitting ? '저장 중...' : '저장'}</button>
                          <button
                            className={`${styles.submitBtn} ${styles.submitBtnSecondary}`}
                            onClick={() => { setEditingId(null); setEditContent('') }}
                          >취소</button>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.reviewItemText}>{comment.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {comments.length === 0 && booth.hasVisited && (
              <div className={styles.reviewList}>
                <h4 className={styles.reviewListTitle}>전체 아이디어 (0)</h4>
                <p className={styles.emptyText} style={{ textAlign: 'center', padding: '20px 0' }}>아직 제안이 없습니다. 첫 번째 멘토가 되어주세요!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 투자/철회 모달 */}
      {modal === 'buy' && (
        <StockTradeModal
          type="buy"
          boothName={booth.name}
          maxAmount={Math.min(balance, 30_000_000 - booth.myHolding)}
          onConfirm={handleBuy}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'sell' && (
        <StockTradeModal
          type="sell"
          boothName={booth.name}
          maxAmount={booth.myHolding}
          onConfirm={handleSell}
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
              placeholder="이 종목에 대한 메모를 작성하세요..."
              value={memo}
              onChange={e => setMemo(e.target.value)}
              autoFocus
            />
            <div className={styles.memoActions}>
              {memoSaved && (
                <button
                  className={styles.memoDeleteBtn}
                  onClick={() => { setMemo(''); localStorage.removeItem(`stock_memo_${id}`); setMemoSaved(''); setMemoOpen(false) }}
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
