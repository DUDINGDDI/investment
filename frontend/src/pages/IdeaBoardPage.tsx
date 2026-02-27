import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ideaBoardApi } from '../api'
import type { IdeaBoardResponse, StockCommentResponse } from '../types'
import styles from './IdeaBoardPage.module.css'

/* 포스트잇 6색 */
const POSTIT_COLORS = [
  { from: '#E8695A', to: '#D64630', text: '#fff5f3', sub: 'rgba(255,255,255,0.75)' },
  { from: '#F99B80', to: '#F47655', text: '#fff5f3', sub: 'rgba(255,255,255,0.7)' },
  { from: '#F7D06B', to: '#F2BA34', text: '#3a2800', sub: 'rgba(0,0,0,0.45)' },
  { from: '#FB8DB3', to: '#F96390', text: '#fff5f5', sub: 'rgba(255,255,255,0.75)' },
  { from: '#A8E4E9', to: '#7FD3D9', text: '#0a2e30', sub: 'rgba(0,0,0,0.45)' },
  { from: '#A5F7DE', to: '#7AF2CA', text: '#0a2e1a', sub: 'rgba(0,0,0,0.45)' },
]

/** 클립 위치 */
type ClipPos = 'left' | 'center' | 'right'
const CLIP_POSITIONS: ClipPos[] = ['left', 'center', 'right']

const REFRESH_INTERVAL = 60
const CARD_W = 250
const CARD_ESTIMATED_H = 200
const BOARD_PAD = 40

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
  from: string
  to: string
  text: string
  sub: string
  clipPos: ClipPos
  clipRotation: number
  flutterDelay: number
  flutterDuration: number
}

function computePositions(
  comments: StockCommentResponse[],
  boardWidth: number
): { positions: CardPos[]; boardHeight: number } {
  const usableW = boardWidth - BOARD_PAD * 2
  const cols = Math.max(1, Math.floor(usableW / (CARD_W + 30)))
  const cellW = usableW / cols
  const cellH = CARD_ESTIMATED_H + 90
  const rows = Math.ceil(comments.length / cols)

  const positions = comments.map((c, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)

    const jitterX = (seededRandom(c.id * 3) - 0.5) * (cellW - CARD_W + 60)
    const jitterY = (seededRandom(c.id * 7) - 0.5) * 80
    const rotation = (seededRandom(c.id * 11) - 0.5) * 14
    const zIndex = Math.floor(seededRandom(c.id * 13) * 20)
    const color = POSTIT_COLORS[Math.floor(seededRandom(c.id * 17) * POSTIT_COLORS.length)]
    const clipPos = CLIP_POSITIONS[Math.floor(seededRandom(c.id * 29) * CLIP_POSITIONS.length)]
    const clipRotation = (seededRandom(c.id * 43) - 0.5) * 20
    const flutterDelay = seededRandom(c.id * 31) * -8
    const flutterDuration = 3 + seededRandom(c.id * 37) * 3

    return {
      left: Math.max(10, Math.min(
        boardWidth - CARD_W - 10,
        BOARD_PAD + col * cellW + cellW / 2 - CARD_W / 2 + jitterX
      )),
      top: row * cellH + jitterY + 30,
      rotation,
      zIndex,
      from: color.from,
      to: color.to,
      text: color.text,
      sub: color.sub,
      clipPos,
      clipRotation,
      flutterDelay,
      flutterDuration,
    }
  })

  return { positions, boardHeight: rows * cellH + 120 }
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

  useEffect(() => { fetchBoard() }, [fetchBoard])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { fetchBoard(); return REFRESH_INTERVAL }
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

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) wrapperRef.current?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }, [])

  const { positions, boardHeight } = useMemo(() => {
    if (!board || board.comments.length === 0) return { positions: [], boardHeight: 0 }
    return computePositions(board.comments, windowWidth)
  }, [board, windowWidth])

  if (loading) return <div className={styles.loading}>로딩 중...</div>
  if (error || !board) {
    return <div className={styles.error}><span>{error || '데이터를 불러올 수 없습니다'}</span></div>
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.boothName}>{board.boothName}</span>
          <span className={styles.boothCategory}>{board.category}</span>
        </div>
        <span className={styles.commentCount}>
          {board.comments.length}개의 아이디어
        </span>
      </div>

      {board.comments.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📌</span>
          <span>아직 등록된 아이디어가 없습니다</span>
        </div>
      ) : (
        <div className={styles.board} style={{ height: boardHeight }}>
          {board.comments.map((comment, i) => {
            const pos = positions[i]
            const isNew = newIds.has(comment.id)
            const clipPosClass =
              pos.clipPos === 'left' ? styles.clipLeft :
              pos.clipPos === 'right' ? styles.clipRight :
              styles.clipCenter

            return (
              <div
                key={comment.id}
                className={`${styles.card} ${isNew ? styles.cardNew : ''}`}
                style={{
                  left: pos.left,
                  top: pos.top,
                  zIndex: pos.zIndex,
                  width: CARD_W,
                  '--card-from': pos.from,
                  '--card-to': pos.to,
                  '--card-text': pos.text,
                  '--card-sub': pos.sub,
                  '--rotation': `${pos.rotation}deg`,
                  '--flutter-delay': `${pos.flutterDelay}s`,
                  '--flutter-duration': `${pos.flutterDuration}s`,
                } as React.CSSProperties}
              >
                {/* 클립 */}
                <div
                  className={`${styles.clip} ${clipPosClass}`}
                  style={{ transform: `rotate(${pos.clipRotation}deg)` }}
                >
                  <div className={styles.clipOuter} />
                  <div className={styles.clipInner} />
                </div>

                {/* 내용 */}
                <div className={styles.cardHeader}>
                  <span className={styles.cardAuthor}>{comment.userName}</span>
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
          {isFullscreen ? '⛶ 축소' : '⛶ 전체화면'}
        </button>
      </div>
    </div>
  )
}
