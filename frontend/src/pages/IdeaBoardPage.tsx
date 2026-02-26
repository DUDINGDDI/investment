import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ideaBoardApi } from '../api'
import type { IdeaBoardResponse, StockCommentResponse } from '../types'
import styles from './IdeaBoardPage.module.css'

const TAG_CONFIG: Record<string, { label: string; color: string }> = {
  PROFITABILITY: { label: '수익성', color: '#D4A843' },
  TECHNOLOGY: { label: '기술력', color: '#5A9E6F' },
  GROWTH: { label: '성장가능성', color: '#2F6F3C' },
}

/* 포스트잇 4색 + 텍스트 색상 */
const POSTIT_COLORS = [
  { bg: '#E3F2E2', text: '#0F1C14', sub: '#2F6F3C' },
  { bg: '#A7D7A5', text: '#0F1C14', sub: '#1a3a20' },
  { bg: '#70BE6D', text: '#0F1C14', sub: '#0F1C14' },
  { bg: '#2F6F3C', text: '#E3F2E2', sub: '#A7D7A5' },
]

const REFRESH_INTERVAL = 60
const CARD_W = 260
const CARD_ESTIMATED_H = 200
const BOARD_PAD = 50

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hour}:${min}`
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])
  return width
}

interface CardPos {
  left: number
  top: number
  rotation: number
  zIndex: number
  bg: string
  text: string
  sub: string
  pinOffsetX: number
}

function computePositions(
  comments: StockCommentResponse[],
  boardWidth: number
): { positions: CardPos[]; boardHeight: number } {
  const usableW = boardWidth - BOARD_PAD * 2
  const cols = Math.max(1, Math.floor(usableW / (CARD_W + 24)))
  const cellW = usableW / cols
  const cellH = CARD_ESTIMATED_H + 70
  const rows = Math.ceil(comments.length / cols)

  const positions = comments.map((c, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)

    const jitterX = (seededRandom(c.id * 3) - 0.5) * (cellW - CARD_W - 10)
    const jitterY = (seededRandom(c.id * 7) - 0.5) * 50
    const rotation = (seededRandom(c.id * 11) - 0.5) * 16
    const zIndex = Math.floor(seededRandom(c.id * 13) * 10)
    const color = POSTIT_COLORS[Math.floor(seededRandom(c.id * 17) * POSTIT_COLORS.length)]
    const pinOffsetX = (seededRandom(c.id * 23) - 0.5) * 60

    return {
      left: BOARD_PAD + col * cellW + cellW / 2 - CARD_W / 2 + jitterX,
      top: row * cellH + jitterY + 20,
      rotation,
      zIndex,
      bg: color.bg,
      text: color.text,
      sub: color.sub,
      pinOffsetX,
    }
  })

  return { positions, boardHeight: rows * cellH + 100 }
}

export default function IdeaBoardPage() {
  const { boothId } = useParams<{ boothId: string }>()
  const [board, setBoard] = useState<IdeaBoardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const knownIdsRef = useRef<Set<number>>(new Set())
  const isFirstLoad = useRef(true)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const windowWidth = useWindowWidth()

  const fetchBoard = useCallback(async () => {
    if (!boothId) return
    try {
      const res = await ideaBoardApi.getBoard(Number(boothId))
      const data = res.data

      if (isFirstLoad.current) {
        knownIdsRef.current = new Set(data.comments.map(c => c.id))
        isFirstLoad.current = false
      } else {
        const fresh = new Set<number>()
        data.comments.forEach((c: StockCommentResponse) => {
          if (!knownIdsRef.current.has(c.id)) {
            fresh.add(c.id)
            knownIdsRef.current.add(c.id)
          }
        })
        if (fresh.size > 0) {
          setNewIds(fresh)
          setTimeout(() => setNewIds(new Set()), 1200)
        }
      }

      setBoard(data)
      setError(null)
    } catch {
      setError('보드를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [boothId])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchBoard()
          return REFRESH_INTERVAL
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [fetchBoard])

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const originalMaxWidth = root.style.maxWidth
    const originalZoom = (root.style as CSSStyleDeclaration & { zoom: string }).zoom
    root.style.maxWidth = 'none'
    ;(root.style as CSSStyleDeclaration & { zoom: string }).zoom = ''
    return () => {
      root.style.maxWidth = originalMaxWidth
      ;(root.style as CSSStyleDeclaration & { zoom: string }).zoom = originalZoom
    }
  }, [])

  /* 브라우저 Fullscreen API */
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  const { positions, boardHeight } = useMemo(() => {
    if (!board || board.comments.length === 0) return { positions: [], boardHeight: 0 }
    return computePositions(board.comments, windowWidth)
  }, [board, windowWidth])

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>
  }

  if (error || !board) {
    return (
      <div className={styles.error}>
        <span>{error || '데이터를 불러올 수 없습니다'}</span>
      </div>
    )
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.header}>
        <span className={styles.boothEmoji}>{board.logoEmoji}</span>
        <div className={styles.headerText}>
          <span className={styles.boothName}>{board.boothName}</span>
          <span className={styles.boothCategory}>{board.category}</span>
        </div>
        <span className={styles.commentCount}>
          💡 {board.comments.length}개의 아이디어
        </span>
      </div>

      {board.comments.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>💡</span>
          <span>아직 등록된 아이디어가 없습니다</span>
        </div>
      ) : (
        <div className={styles.board} style={{ height: boardHeight }}>
          {board.comments.map((comment, i) => {
            const tag = TAG_CONFIG[comment.tag]
            const pos = positions[i]
            const isNew = newIds.has(comment.id)

            return (
              <div
                key={comment.id}
                className={`${styles.card} ${isNew ? styles.cardNew : ''}`}
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: `rotate(${pos.rotation}deg)`,
                  zIndex: pos.zIndex,
                  backgroundColor: pos.bg,
                  width: CARD_W,
                  '--card-text': pos.text,
                  '--card-sub': pos.sub,
                } as React.CSSProperties}
              >
                {/* 상단 접착면 */}
                <div className={styles.stickyStrip} />

                {/* 3D 압정 */}
                <div
                  className={styles.pinWrapper}
                  style={{ left: `calc(50% + ${pos.pinOffsetX}px)` }}
                >
                  <div className={styles.pinOuter}>
                    <div className={styles.pinRim} />
                    <div className={styles.pinHead} />
                  </div>
                  <div className={styles.pinNeedle} />
                  <div className={styles.pinShadow} />
                </div>

                {/* 내용 */}
                <div className={styles.cardHeader}>
                  <span className={styles.cardAuthor}>{comment.userName}</span>
                  {tag && (
                    <span
                      className={styles.cardTag}
                      style={{ background: tag.color }}
                    >
                      {tag.label}
                    </span>
                  )}
                </div>
                <p className={styles.cardContent}>{comment.content}</p>
                <div className={styles.cardTime}>{formatTime(comment.createdAt)}</div>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.bottomBar}>
        <div className={styles.countdown}>
          <span className={styles.countdownDot} />
          {countdown}초 후 새로고침
        </div>
        <button className={styles.fullscreenBtn} onClick={toggleFullscreen}>
          {isFullscreen ? '⛶' : '⛶'} {isFullscreen ? '축소' : '전체화면'}
        </button>
      </div>
    </div>
  )
}
