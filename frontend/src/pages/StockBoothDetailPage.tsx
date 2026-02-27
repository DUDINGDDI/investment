import { useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { stockApi } from '../api'
import { formatKorean } from '../utils/format'
import type { StockBoothResponse, StockCommentResponse, StockRatingResponse, BoothReviewResponse } from '../types'
import StockTradeModal from '../components/StockTradeModal'
import { useToast } from '../components/ToastContext'
import styles from './StockBoothDetailPage.module.css'

type TabType = 'discussion' | 'review'

const PRESET_TAGS = ['수익성', '성장가능성', '현실성'] as const

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
  const { showToast } = useToast()
  const [booth, setBooth] = useState<StockBoothResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [modal, setModal] = useState<'buy' | 'sell' | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'review' || tab === 'discussion') return tab
    return 'discussion'
  })

  // 메모
  const [memoOpen, setMemoOpen] = useState(false)
  const [memo, setMemo] = useState('')
  const [memoSaved, setMemoSaved] = useState('')

  // 종목토론방 탭
  const [comments, setComments] = useState<StockCommentResponse[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [customTag, setCustomTag] = useState('')
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
  const [showReviews, setShowReviews] = useState(false)

  const loadData = useCallback(() => {
    if (!id) return
    stockApi.getBoothById(Number(id)).then(res => setBooth(res.data))
    stockApi.getAccount().then(res => setBalance(res.data.balance))
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
    if (activeTab === 'discussion' && !commentsLoaded) {
      stockApi.getComments(Number(id)).then(res => {
        setComments(res.data)
        setCommentsLoaded(true)
      })
    }
    if (activeTab === 'review' && !ratingLoaded) {
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
    if (activeTab === 'review' && !reviewsLoaded) {
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

  const getActiveTag = () => {
    if (showCustomTagInput && customTag.trim()) return customTag.trim()
    if (selectedTag) return selectedTag
    return undefined
  }

  const handleTagSelect = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag('')
    } else {
      setSelectedTag(tag)
      setShowCustomTagInput(false)
      setCustomTag('')
    }
  }

  const handleCustomTagToggle = () => {
    if (showCustomTagInput) {
      setShowCustomTagInput(false)
      setCustomTag('')
    } else {
      setShowCustomTagInput(true)
      setSelectedTag('')
    }
  }

  const handleAddComment = async () => {
    if (!id || !commentInput.trim() || submitting) return
    setSubmitting(true)
    try {
      const tag = getActiveTag()
      const res = await stockApi.addComment(Number(id), commentInput.trim(), tag)
      setComments(prev => [res.data, ...prev])
      setCommentInput('')
      setSelectedTag('')
      setCustomTag('')
      setShowCustomTagInput(false)
      showToast('제안이 등록되었습니다!', 'success')
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { error?: string } } }).response?.data?.error || '제안 등록에 실패했습니다', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!id || ratingSubmitting) return
    const allScored = (Object.values(ratingScores) as number[]).every(v => v >= 1 && v <= 5)
    if (!allScored) {
      showToast('모든 평가 항목을 입력해주세요', 'error')
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
        <span className={styles.myInvestLabel}>내 투자금</span>
        <span className={styles.myInvestValue}>
          {formatKorean(booth.myHolding)}원
          <span className={styles.myInvestArrow}> ›</span>
        </span>
      </div>

      {/* 투자하기 / 철회하기 버튼 */}
      <div className={styles.tradeSection}>
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
      </div>

      {/* 칩 탭: 아이디어 Develop Zone / 평가 */}
      <div className={styles.chipTabBar}>
        <button
          className={`${styles.chipTab} ${activeTab === 'discussion' ? styles.chipTabActive : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          아이디어 Develop Zone
        </button>
        <button
          className={`${styles.chipTab} ${activeTab === 'review' ? styles.chipTabActive : ''}`}
          onClick={() => setActiveTab('review')}
        >
          평가
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className={styles.tabContent}>
        {/* 종목토론방 탭 - Develop Zone */}
        {activeTab === 'discussion' && (
          <div className={styles.discussionContainer}>
            {/* 안내 배너 */}
            <div className={styles.discussionBanner}>
              <span className={styles.discussionBannerIcon}>&#x2139;&#xFE0F;</span>
              <p className={styles.discussionBannerText}>
                아이디어를 발전시킬 제안을 남기고 미션을 완료하세요.
              </p>
            </div>

            {/* 댓글 리스트 */}
            <div className={styles.commentList}>
              {comments.length === 0 ? (
                <div className={styles.emptyDevelop}>
                  <p className={styles.emptyText}>아직 제안이 없습니다. 첫 번째 멘토가 되어주세요!</p>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={`${styles.commentItem} stagger-item`}
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <div className={styles.commentHeader}>
                      <div className={styles.commentAuthorRow}>
                        <span className={styles.commentAuthor}>{comment.userName}</span>
                        {comment.userCompany && <span className={styles.commentCompany}>{comment.userCompany}</span>}
                      </div>
                      <span className={styles.commentTime}>{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    {comment.tag && <span className={styles.commentTag}>{comment.tag}</span>}
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* 입력 영역 */}
            {!booth.hasVisited ? (
              <div className={styles.inputLocked}>
                <span className={styles.lockIcon}>&#x1F512;</span>
                <p className={styles.lockTitle}>부스를 방문한 후에 제안을 남길 수 있습니다</p>
              </div>
            ) : (
              <div className={styles.commentInputArea}>
                <div className={styles.tagSection}>
                  <span className={styles.tagLabel}>태그</span>
                  <div className={styles.tagChips}>
                    {PRESET_TAGS.map(tag => (
                      <button
                        key={tag}
                        className={`${styles.tagChip} ${selectedTag === tag ? styles.tagChipActive : ''}`}
                        onClick={() => handleTagSelect(tag)}
                        disabled={submitting}
                      >
                        {tag}
                      </button>
                    ))}
                    <button
                      className={`${styles.tagChip} ${showCustomTagInput ? styles.tagChipActive : ''}`}
                      onClick={handleCustomTagToggle}
                      disabled={submitting}
                    >
                      + 직접입력
                    </button>
                  </div>
                  {showCustomTagInput && (
                    <input
                      className={styles.customTagInput}
                      type="text"
                      placeholder="태그를 입력하세요"
                      value={customTag}
                      onChange={e => setCustomTag(e.target.value)}
                      maxLength={20}
                      disabled={submitting}
                    />
                  )}
                </div>
                <div className={styles.inputRow}>
                  <textarea
                    className={styles.commentTextarea}
                    placeholder="개선 아이디어를 제안해주세요."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment()
                      }
                    }}
                    disabled={submitting}
                    rows={1}
                  />
                  <button
                    className={styles.commentSendBtn}
                    onClick={handleAddComment}
                    disabled={!commentInput.trim() || submitting}
                  >
                    아이디어 제안하기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 평가 탭 */}
        {activeTab === 'review' && (
          <div className={styles.ratingContainer}>
            {!booth.hasVisited ? (
              <div className={styles.inputLocked}>
                <span className={styles.lockIcon}>&#x1F512;</span>
                <p className={styles.lockTitle}>부스를 방문한 후에 평가할 수 있습니다</p>
              </div>
            ) : (
              <>
                {/* 안내 배너 */}
                <div className={styles.discussionBanner}>
                  <span className={styles.discussionBannerIcon}>&#x2139;&#xFE0F;</span>
                  <p className={styles.discussionBannerText}>
                    투자자의 관점에서 아이디어를 평가하고 미션을 완료하세요.
                  </p>
                </div>

                {/* 리뷰 보기 링크 */}
                {boothReviews.length > 0 && (
                  <div className={styles.reviewLinkRow}>
                    <button className={styles.reviewLink} onClick={() => setShowReviews(!showReviews)}>
                      리뷰 보기 ›
                    </button>
                  </div>
                )}

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
                  <div className={styles.charCount}>{reviewText.length} / 500</div>
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
                {showReviews && boothReviews.length > 0 && (
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
