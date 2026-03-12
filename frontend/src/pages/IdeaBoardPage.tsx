import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import PageBackButton from '../components/PageBackButton'
import { ideaBoardApi } from '../api'
import type { IdeaBoardResponse, StockCommentResponse } from '../types'
import styles from './IdeaBoardPage.module.css'

/* 포스트잇 5색 */
const POSTIT_COLORS = [
  { from: '#3C9DBF', to: '#2E8BAD', text: '#ffffff', sub: 'rgba(255,255,255,0.7)' },
  { from: '#EBB358', to: '#D9A045', text: '#3a2800', sub: 'rgba(0,0,0,0.45)' },
  { from: '#DC6868', to: '#C85555', text: '#ffffff', sub: 'rgba(255,255,255,0.75)' },
  { from: '#A4428C', to: '#8E3578', text: '#ffffff', sub: 'rgba(255,255,255,0.75)' },
  { from: '#BBCF47', to: '#A8BC35', text: '#2a3000', sub: 'rgba(0,0,0,0.45)' },
]

/** 클립 위치 */
type ClipPos = 'left' | 'center' | 'right'
const CLIP_POSITIONS: ClipPos[] = ['left', 'center', 'right']

const FALLBACK_INTERVAL = 30
const CARD_W = 300
const CARD_ESTIMATED_H = 200
const BOARD_PAD = 40

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function useBoardWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const measure = () => {
      if (ref.current) {
        setWidth(ref.current.clientWidth)
      } else {
        setWidth(screen.width)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    const onFs = () => setTimeout(measure, 200)
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      window.removeEventListener('resize', measure)
      document.removeEventListener('fullscreenchange', onFs)
    }
  }, [ref])
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
    }
  })

  return { positions, boardHeight: rows * cellH + 120 }
}

export default function IdeaBoardPage() {
  const { boothId } = useParams<{ boothId: string }>()
  const [board, setBoard] = useState<IdeaBoardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [countdown, setCountdown] = useState(FALLBACK_INTERVAL)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const knownIdsRef = useRef<Set<number>>(new Set())
  const wrapperRef = useRef<HTMLDivElement>(null)
  const boardWidth = useBoardWidth(wrapperRef)

  // 폴링 폴백용
  const fetchBoard = useCallback(async () => {
    if (!boothId) return
    try {
      const res = await ideaBoardApi.getBoard(Number(boothId))
      const data = res.data

      const fresh = new Set<number>()
      data.comments.forEach((c: StockCommentResponse) => {
        if (!knownIdsRef.current.has(c.id)) {
          fresh.add(c.id)
          knownIdsRef.current.add(c.id)
        }
      })
      if (fresh.size > 0 && board !== null) {
        setNewIds(fresh)
        setTimeout(() => setNewIds(new Set()), 1200)
      } else {
        knownIdsRef.current = new Set(data.comments.map(c => c.id))
      }

      setBoard(data)
      setError(null)
    } catch {
      setError('보드를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [boothId, board])

  // SSE 연결
  useEffect(() => {
    if (!boothId) return

    const streamUrl = ideaBoardApi.getStreamUrl(Number(boothId))
    let eventSource: EventSource | null = null
    let fallbackTimer: ReturnType<typeof setInterval> | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

    function connectSse() {
      eventSource = new EventSource(streamUrl)

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const data: IdeaBoardResponse = JSON.parse(e.data)
          knownIdsRef.current = new Set(data.comments.map(c => c.id))
          setBoard(data)
          setConnected(true)
          setLoading(false)
          setError(null)
          // SSE 연결 성공 시 폴링 중지
          if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null }
        } catch {
          // JSON 파싱 실패 무시
        }
      })

      eventSource.addEventListener('new-comment', (e: MessageEvent) => {
        try {
          const comment: StockCommentResponse = JSON.parse(e.data)
          knownIdsRef.current.add(comment.id)
          setNewIds(new Set([comment.id]))
          setTimeout(() => setNewIds(new Set()), 1200)

          setBoard(prev => {
            if (!prev) return prev
            return { ...prev, comments: [comment, ...prev.comments] }
          })
        } catch {
          // JSON 파싱 실패 무시
        }
      })

      eventSource.addEventListener('heartbeat', () => {
        // heartbeat - 연결 유지 확인
      })

      eventSource.onerror = () => {
        setConnected(false)
        eventSource?.close()
        eventSource = null

        // 폴링 폴백 시작
        if (!fallbackTimer) {
          fallbackTimer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) { fetchBoard(); return FALLBACK_INTERVAL }
              return prev - 1
            })
          }, 1000)
        }

        // 30초 후 SSE 재연결 시도
        reconnectTimeout = setTimeout(connectSse, 30_000)
      }
    }

    connectSse()

    return () => {
      eventSource?.close()
      if (fallbackTimer) clearInterval(fallbackTimer)
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
    }
  }, [boothId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const originalWidth = root.style.width
    const originalMaxWidth = root.style.maxWidth
    const originalZoom = (root.style as CSSStyleDeclaration & { zoom: string }).zoom
    const originalHeight = root.style.height
    const originalOverflow = root.style.overflow
    root.style.width = '100vw'
    root.style.maxWidth = 'none'
    root.style.height = 'auto'
    root.style.overflow = 'visible'
    ;(root.style as CSSStyleDeclaration & { zoom: string }).zoom = '1'
    // body도 스크롤 허용
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.height = 'auto'
    return () => {
      root.style.width = originalWidth
      root.style.maxWidth = originalMaxWidth
      root.style.height = originalHeight
      root.style.overflow = originalOverflow
      ;(root.style as CSSStyleDeclaration & { zoom: string }).zoom = originalZoom
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
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
    return computePositions(board.comments, boardWidth)
  }, [board, boardWidth])

  if (loading) return <div className={styles.loading}>로딩 중...</div>
  if (error || !board) {
    return <div className={styles.error}><span>{error || '데이터를 불러올 수 없습니다'}</span></div>
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <PageBackButton label="뒤로" style={{ paddingLeft: 20 }} />
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
                  <span className={styles.cardAuthor}>
                    {comment.userName}{comment.userCompany ? ` (${comment.userCompany})` : ''}님
                  </span>
                </div>
                <p className={styles.cardContent}>{comment.content}</p>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.bottomBar}>
        <div className={styles.countdown}>
          <span className={styles.countdownDot} />
          {connected ? '실시간 연결됨' : `${countdown}초 후 새로고침`}
        </div>
        <button className={styles.fullscreenBtn} onClick={toggleFullscreen}>
          {isFullscreen ? '⛶ 축소' : '⛶ 전체화면'}
        </button>
      </div>
    </div>
  )
}
