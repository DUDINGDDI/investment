import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { stockApi } from '../api'
import type { StockBoothResponse, StockPricePoint, StockTradeHistoryResponse, StockCommentResponse } from '../types'
import StockTradeModal from '../components/StockTradeModal'
import PriceChart from '../components/PriceChart'
import { useToast } from '../components/ToastContext'
import styles from './StockBoothDetailPage.module.css'

type TabType = 'chart' | 'history' | 'discussion' | 'review'

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
  const { showToast } = useToast()
  const [booth, setBooth] = useState<StockBoothResponse | null>(null)
  const [balance, setBalance] = useState(0)
  const [priceHistory, setPriceHistory] = useState<StockPricePoint[]>([])
  const [modal, setModal] = useState<'buy' | 'sell' | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('chart')

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
  }, [activeTab, id, historyLoaded, commentsLoaded])

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
      const res = await stockApi.addComment(Number(id), commentInput.trim())
      setComments(prev => [res.data, ...prev])
      setCommentInput('')
    } catch (err: any) {
      showToast(err.response?.data?.error || '댓글 작성에 실패했습니다', 'error')
    } finally {
      setSubmitting(false)
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

        {/* 종목토론방 탭 */}
        {activeTab === 'discussion' && (
          <div className={styles.discussionContainer}>
            <div className={styles.commentList}>
              {comments.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.userName}</span>
                      <span className={styles.commentTime}>{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className={styles.commentInputArea}>
              <input
                className={styles.commentInput}
                type="text"
                placeholder="댓글을 입력하세요..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddComment() }}
                disabled={submitting}
              />
              <button
                className={styles.commentSendBtn}
                onClick={handleAddComment}
                disabled={!commentInput.trim() || submitting}
              >
                전송
              </button>
            </div>
          </div>
        )}

        {/* 평가 탭 */}
        {activeTab === 'review' && (
          <div className={styles.emptyState}>
            <p>준비 중입니다</p>
          </div>
        )}
      </div>

      {/* 하단 고정 매수/매도 버튼 */}
      <div className={styles.actions}>
        <button
          className={styles.sellBtn}
          onClick={() => setModal('sell')}
          disabled={booth.myHolding === 0}
        >
          매도하기
        </button>
        <button
          className={styles.buyBtn}
          onClick={() => setModal('buy')}
          disabled={balance === 0}
        >
          매수하기
        </button>
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
