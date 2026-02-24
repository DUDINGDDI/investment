import { useEffect, useState, useCallback, type ChangeEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { stockApi } from '../api'
import type { StockBoothResponse, StockPricePoint, StockTradeHistoryResponse, StockCommentResponse, StockRatingResponse } from '../types'
import StockTradeModal from '../components/StockTradeModal'
import PriceChart from '../components/PriceChart'
import { useToast } from '../components/ToastContext'
import styles from './StockBoothDetailPage.module.css'

type TabType = 'chart' | 'history' | 'discussion' | 'review'

const TAG_CONFIG = [
  { key: 'PROFITABILITY', label: '수익성', color: '#F0A030' },
  { key: 'TECHNOLOGY', label: '기술력', color: '#4593FC' },
  { key: 'GROWTH', label: '성장가능성', color: '#00D68F' },
] as const

const getTagLabel = (tag: string) => TAG_CONFIG.find(t => t.key === tag)?.label || tag
const getTagColor = (tag: string) => TAG_CONFIG.find(t => t.key === tag)?.color || '#8C8C96'

const RATING_CRITERIA = [
  { key: 'scoreFirst', label: '최초' },
  { key: 'scoreBest', label: '최고' },
  { key: 'scoreDifferent', label: '차별화' },
  { key: 'scoreNumberOne', label: '일등' },
  { key: 'scoreGap', label: '초격차' },
  { key: 'scoreGlobal', label: '글로벌' },
] as const

type ScoreKey = typeof RATING_CRITERIA[number]['key']

function formatStockAmount(n: number) {
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1) + '조'
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(0) + '억'
  if (n >= 10_000) return (n / 10_000).toFixed(0) + '만'
  return n.toLocaleString('ko-KR')
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getDateKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const key = getDateKey(dateStr)
  if (key === todayKey) return '오늘'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`
  if (key === yKey) return '어제'
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

function formatCommentTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function StockBoothDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [booth, setBooth] = useState<StockBoothResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [priceHistory, setPriceHistory] = useState<StockPricePoint[]>([])
  const [modal, setModal] = useState<'buy' | 'sell' | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'review' || tab === 'chart' || tab === 'history' || tab === 'discussion') return tab
    return 'chart'
  })

  // 메모
  const [memoOpen, setMemoOpen] = useState(false)
  const [memo, setMemo] = useState('')
  const [memoSaved, setMemoSaved] = useState('')

  // 내 투자이력 탭
  const [boothHistory, setBoothHistory] = useState<StockTradeHistoryResponse[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  // 종목토론방 탭
  const [comments, setComments] = useState<StockCommentResponse[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentInput, setCommentInput] = useState('')
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
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [inputTag, setInputTag] = useState<string>('PROFITABILITY')

  const loadData = useCallback(() => {
    if (!id) return
    stockApi.getBoothById(Number(id)).then(res => setBooth(res.data))
    stockApi.getAccount().then(res => setBalance(res.data.balance))
    stockApi.getPriceHistory(Number(id)).then(res => setPriceHistory(res.data.priceHistory))
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
    if (activeTab === 'history' && !historyLoaded) {
      stockApi.getBoothHistory(Number(id)).then(res => {
        setBoothHistory(res.data)
        setHistoryLoaded(true)
      })
    }
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
  }, [activeTab, id, historyLoaded, commentsLoaded, ratingLoaded])

  // 태그 필터 변경 시 댓글 재로드
  useEffect(() => {
    if (!id || activeTab !== 'discussion') return
    stockApi.getComments(Number(id), filterTag || undefined).then(res => {
      setComments(res.data)
    })
  }, [filterTag, id, activeTab])

  const handleBuy = async (amount: number) => {
    try {
      await stockApi.buy({ boothId: Number(id), amount })
      showToast(`${formatStockAmount(amount)}원 매수 완료!`, 'success')
      setModal(null)
      setHistoryLoaded(false)
      loadData()
    } catch (err: any) {
      showToast(err.response?.data?.error || '매수에 실패했습니다', 'error')
    }
  }

  const handleSell = async (amount: number) => {
    try {
      await stockApi.sell({ boothId: Number(id), amount })
      showToast(`${formatStockAmount(amount)}원 매도 완료!`, 'success')
      setModal(null)
      setHistoryLoaded(false)
      loadData()
    } catch (err: any) {
      showToast(err.response?.data?.error || '매도에 실패했습니다', 'error')
    }
  }

  const handleAddComment = async () => {
    if (!id || !commentInput.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await stockApi.addComment(Number(id), commentInput.trim(), inputTag)
      // 필터가 없거나, 필터와 같은 태그면 리스트에 추가
      if (!filterTag || filterTag === inputTag) {
        setComments(prev => [res.data, ...prev])
      }
      setCommentInput('')
      showToast('제안이 등록되었습니다!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.error || '제안 등록에 실패했습니다', 'error')
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
      showToast('평가가 완료되었습니다!', 'success')
      loadData()
    } catch (err: any) {
      showToast(err.response?.data?.error || '평가에 실패했습니다', 'error')
    } finally {
      setRatingSubmitting(false)
    }
  }

  if (!booth) return null

  const tabs: { key: TabType; label: string }[] = [
    { key: 'chart', label: '차트' },
    { key: 'history', label: '내 투자이력' },
    { key: 'discussion', label: '토론방' },
    { key: 'review', label: '평가' },
  ]

  // 날짜별 그룹핑 (내 투자이력)
  const grouped: { label: string; items: StockTradeHistoryResponse[] }[] = []
  let currentKey = ''
  for (const item of boothHistory) {
    const key = getDateKey(item.createdAt)
    if (key !== currentKey) {
      currentKey = key
      grouped.push({ label: getDateLabel(item.createdAt), items: [] })
    }
    grouped[grouped.length - 1].items.push(item)
  }

  const canTrade = booth.hasVisited && booth.hasRated

  return (
    <div className={styles.container}>
      {/* 종목 헤더 - 가로 배치 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconLarge} style={{ background: booth.themeColor + '30' }}>
            <span>{booth.logoEmoji}</span>
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.name}>{booth.name}</h2>
            <span className={styles.category}>{booth.category}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.currentPrice}>{formatStockAmount(booth.currentPrice)}원</p>
          <button
            className={`${styles.memoBtn} ${memoSaved ? styles.memoBtnActive : ''}`}
            onClick={() => setMemoOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            메모
          </button>
        </div>
      </div>

      {/* 소개 */}
      {booth.description && (
        <div className={styles.description}>
          <p className={styles.descText}>{booth.description}</p>
        </div>
      )}

      {/* 탭 바 */}
      <div className={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className={styles.tabContent}>
        {/* 차트 탭 */}
        {activeTab === 'chart' && (
          <div>
            <PriceChart priceHistory={priceHistory} themeColor={booth.themeColor} />
            <div className={styles.investSection}>
              <div className={styles.investRow}>
                <span className={styles.investLabel}>내 보유금</span>
                <span className={styles.investValueMy}>{formatStockAmount(booth.myHolding)}원</span>
              </div>
            </div>
          </div>
        )}

        {/* 내 투자이력 탭 */}
        {activeTab === 'history' && (
          <div>
            {boothHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <p>거래 이력이 없습니다</p>
              </div>
            ) : (
              grouped.map((group, gi) => (
                <div key={gi} className={styles.historyGroup}>
                  <p className={styles.dateLabel}>{group.label}</p>
                  {group.items.map((item, i) => {
                    const isBuy = item.type === 'BUY'
                    return (
                      <div
                        key={item.id}
                        className={`${styles.historyItem} stagger-item`}
                        style={{ animationDelay: `${(gi * 3 + i) * 0.04}s` }}
                      >
                        <div className={styles.historyIcon} style={{ background: item.themeColor + '30' }}>
                          <span>{item.logoEmoji}</span>
                        </div>
                        <div className={styles.historyInfo}>
                          <p className={styles.historyName}>{item.boothName}</p>
                          <div className={styles.historyMeta}>
                            <span className={`${styles.typeBadge} ${isBuy ? styles.buyBadge : styles.sellBadge}`}>
                              {isBuy ? '매수' : '매도'}
                            </span>
                            <span className={styles.priceAtTrade}>{formatStockAmount(item.priceAtTrade)}원</span>
                            <span className={styles.time}>{formatTime(item.createdAt)}</span>
                          </div>
                        </div>
                        <div className={styles.historyAmount}>
                          <p className={`${styles.amount} ${isBuy ? styles.buyAmount : styles.sellAmount}`}>
                            {isBuy ? '+' : '-'}{formatStockAmount(item.amount)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        )}

        {/* 종목토론방 탭 - Develop Zone */}
        {activeTab === 'discussion' && (
          <div className={styles.discussionContainer}>
            {/* Develop Zone 배너 */}
            <div
              className={styles.developBanner}
              style={{
                background: `linear-gradient(135deg, ${booth.themeColor}20, var(--bg-secondary))`,
                borderColor: `${booth.themeColor}30`,
              }}
            >
              <div className={styles.developBannerInner}>
                <span className={styles.developIcon}>🚀</span>
                <div className={styles.developTexts}>
                  <div className={styles.developTitle}>아이디어 Develop Zone</div>
                  <p className={styles.developSubtitle}>
                    투자자로서 이 아이디어를 발전시킬 제안을 남겨주세요
                  </p>
                </div>
              </div>
              <p className={styles.developCount}>
                <span className={styles.developCountNum}>{comments.length}</span>개의 제안이 쌓였습니다
              </p>
            </div>

            {/* 태그 필터 */}
            <div className={styles.tagFilter}>
              <button
                className={`${styles.tagChip} ${filterTag === null ? styles.tagChipActive : ''}`}
                onClick={() => setFilterTag(null)}
              >
                전체
              </button>
              {TAG_CONFIG.map(tag => (
                <button
                  key={tag.key}
                  className={`${styles.tagChip} ${filterTag === tag.key ? styles.tagChipActive : ''}`}
                  onClick={() => setFilterTag(filterTag === tag.key ? null : tag.key)}
                  style={filterTag === tag.key ? { borderColor: tag.color, background: tag.color, color: '#fff' } : {}}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* 댓글 리스트 */}
            <div className={styles.commentList}>
              {comments.length === 0 ? (
                <div className={styles.emptyDevelop}>
                  <span className={styles.emptyIcon}>🚀</span>
                  <p className={styles.emptyTitle}>첫 번째 멘토가 되어주세요!</p>
                  <p className={styles.emptySubtitle}>
                    당신의 제안이 이 아이디어를{'\n'}한 단계 발전시킵니다
                  </p>
                  <div className={styles.guideBox}>
                    <p className={styles.guideTitle}>💡 이런 제안을 남겨보세요</p>
                    <ul className={styles.guideList}>
                      <li>수익 모델 개선 방안</li>
                      <li>기술적 차별화 포인트</li>
                      <li>시장 확대 가능성</li>
                    </ul>
                  </div>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={`${styles.developBlock} stagger-item`}
                    style={{
                      borderLeftColor: getTagColor(comment.tag),
                      animationDelay: `${index * 0.04}s`,
                    }}
                  >
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.userName}</span>
                      <span className={styles.commentTime}>{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <span
                      className={styles.commentTagBadge}
                      style={{
                        background: getTagColor(comment.tag) + '20',
                        color: getTagColor(comment.tag),
                      }}
                    >
                      {getTagLabel(comment.tag)}
                    </span>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* 입력 영역 */}
            <div className={styles.commentInputArea}>
              <div className={styles.inputTagRow}>
                {TAG_CONFIG.map(tag => (
                  <button
                    key={tag.key}
                    className={`${styles.inputTagChip} ${inputTag === tag.key ? styles.inputTagChipActive : ''}`}
                    onClick={() => setInputTag(tag.key)}
                    style={inputTag === tag.key
                      ? { borderColor: tag.color, background: tag.color + '20', color: tag.color }
                      : {}
                    }
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <div className={styles.inputRow}>
                <textarea
                  className={styles.commentTextarea}
                  placeholder="이 아이디어의 개선 아이디어를 제안해주세요."
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
                  제안
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 평가 탭 */}
        {activeTab === 'review' && (
          <div className={styles.ratingContainer}>
            {!booth.hasVisited ? (
              <div className={styles.ratingLocked}>
                <span className={styles.lockIcon}>&#x1F512;</span>
                <p className={styles.lockTitle}>부스를 방문한 후에 평가할 수 있습니다</p>
                <p className={styles.lockHint}>QR 코드를 스캔하여 방문을 기록하세요</p>
              </div>
            ) : (
              <>
                {RATING_CRITERIA.map(({ key, label }) => (
                  <div key={key} className={styles.criteriaRow}>
                    <span className={styles.criteriaLabel}>{label}</span>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          className={`${styles.star} ${ratingScores[key] >= star ? styles.starActive : ''}`}
                          onClick={() => !myRating && setRatingScores((prev: Record<ScoreKey, number>) => ({ ...prev, [key]: star }))}
                          disabled={!!myRating}
                        >
                          &#9733;
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className={styles.reviewSection}>
                  <textarea
                    className={styles.reviewInput}
                    placeholder="리뷰를 작성해주세요 (선택)"
                    value={reviewText}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)}
                    maxLength={500}
                    disabled={!!myRating}
                  />
                  <div className={styles.charCount}>{reviewText.length} / 500</div>
                </div>

                {myRating ? (
                  <div className={styles.ratingCompleted}>
                    <span>평가가 완료되었습니다 (총점: {myRating.totalScore}/30)</span>
                  </div>
                ) : (
                  <button
                    className={styles.submitRatingBtn}
                    onClick={handleSubmitRating}
                    disabled={ratingSubmitting || Object.values(ratingScores).some(v => v === 0)}
                  >
                    {ratingSubmitting ? '제출 중...' : '평가 제출'}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 매수/매도 버튼 */}
      <div className={styles.actions}>
        {!canTrade && (
          <p className={styles.tradeGuide}>
            {!booth.hasVisited
              ? 'QR 스캔으로 부스를 방문해주세요'
              : '평가를 완료하면 매수/매도가 가능합니다'}
          </p>
        )}
        <div className={styles.actionBtns}>
          <button
            className={styles.sellBtn}
            onClick={() => setModal('sell')}
            disabled={!canTrade || booth.myHolding === 0}
          >
            매도하기
          </button>
          <button
            className={styles.buyBtn}
            onClick={() => setModal('buy')}
            disabled={!canTrade || balance === 0}
          >
            매수하기
          </button>
        </div>
      </div>

      {modal === 'buy' && (
        <StockTradeModal
          type="buy"
          boothName={booth.name}
          maxAmount={balance}
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
