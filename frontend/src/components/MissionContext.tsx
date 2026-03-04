import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { missionApi } from '../api'

export interface Mission {
  id: string
  title: string
  description: string
  isCompleted: boolean
  progress?: number
  target?: number
  icon: string
  isUsed?: boolean
  usedAt?: string | null
}

interface MissionContextType {
  missions: Mission[]
  syncFromServer: () => Promise<void>
  loading: boolean
}

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'renew',
    title: '내일 더 새롭게',
    description: '특별 QR 코드를 스캔하세요',
    isCompleted: false,
    progress: 0,
    target: 5,
    icon: '/image/badge/new.svg',
  },
  {
    id: 'dream',
    title: '꿈을 원대하게',
    description: '방문한 부스의 토론방에서 아이디어 개선점을 1건 이상 제안해주세요',
    isCompleted: false,
    icon: '/image/badge/dream.svg',
  },
  {
    id: 'result',
    title: '반드시 결과로',
    description: '2026 ONLYONE FAIR 공유회까지 오시느라 고생많으셨습니다',
    isCompleted: false,
    icon: '/image/badge/result.svg',
  },
  {
    id: 'again',
    title: '안돼도 다시',
    description: '내 부스 방문자 70명 이상 달성하기',
    isCompleted: false,
    progress: 0,
    target: 70,
    icon: '/image/badge/retry.svg',
  },
  {
    id: 'sincere',
    title: '진정성 있게',
    description: '방문한 부스에 리뷰 12개 이상 작성(글자 수 80자 이상일 경우만 인정)',
    isCompleted: false,
    progress: 0,
    target: 12,
    icon: '/image/badge/truth.svg',
  },
  {
    id: 'together',
    title: '(+) 함께하는 하고잡이',
    description: '특별 QR 코드를 스캔하세요',
    isCompleted: false,
    icon: '/image/badge/together.svg',
  },
]

const MissionContext = createContext<MissionContextType | null>(null)

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS)
  const [loading, setLoading] = useState(false)

  const syncFromServer = useCallback(async () => {
    setLoading(true)
    try {
      const res = await missionApi.getMyMissions()
      const serverMissions = res.data
      if (serverMissions.length > 0) {
        setMissions(prev => prev.map(m => {
          const sm = serverMissions.find(s => s.missionId === m.id)
          if (!sm) return m
          return {
            ...m,
            isCompleted: sm.isCompleted,
            progress: sm.progress,
            target: sm.target > 0 ? sm.target : m.target,
            isUsed: sm.isUsed,
            usedAt: sm.usedAt,
          }
        }))
      }
    } catch {
      // 서버 동기화 실패 시 기본값 유지
    } finally {
      setLoading(false)
    }
  }, [])

  // 마운트 시 자동으로 서버에서 동기화
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      syncFromServer()
    }
  }, [syncFromServer])

  return (
    <MissionContext.Provider value={{ missions, syncFromServer, loading }}>
      {children}
    </MissionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMissions() {
  const ctx = useContext(MissionContext)
  if (!ctx) throw new Error('useMissions must be used within MissionProvider')
  return ctx
}
