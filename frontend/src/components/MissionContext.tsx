import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
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
  syncFromServer: (options?: { silent?: boolean }) => Promise<void>
  resetAndSync: () => Promise<void>
  loading: boolean
  newlyCompletedMission: Mission | null
  clearNewlyCompleted: () => void
}

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'renew',
    title: '내일 더 새롭게',
    description: "여러분만의 계획과 각오를 '하고잡이 Wall'에 기록하고 \n 미션을 완료해 보세요.",
    isCompleted: false,
    icon: '/image/badge/new.svg',
  },
  {
    id: 'dream',
    title: '꿈을 원대하게',
    description: '아이디어를 발전시킬 수 있는 의견을 5회 이상 제안해주세요',
    isCompleted: false,
    progress: 0,
    target: 5,
    icon: '/image/badge/dream.svg',
  },
  {
    id: 'result',
    title: '반드시 결과로',
    description: "진정한 하고잡이 투자자로서의 모습을 이번 공유회를 통해 반드시 결과로 증명해주세요",
    isCompleted: false,
    icon: '/image/badge/result.svg',
  },
  {
    id: 'again',
    title: '안돼도 다시',
    description: '본인 아이디어 부스 방문자 70명 이상 달성해주세요',
    isCompleted: false,
    progress: 0,
    target: 70,
    icon: '/image/badge/retry.svg',
  },
  {
    id: 'sincere',
    title: '진정성 있게',
    description: '방문한 부스에 대한 \'진정성 있는\'피드백을\n12회 이상 작성해주세요',
    isCompleted: false,
    progress: 0,
    target: 12,
    icon: '/image/badge/truth.svg',
  },
  {
    id: 'together',
    title: '함께하는 \n 하고잡이',
    description: '\'하고잡이 Wall\'에 네컷사진을 부착해주세요',
    isCompleted: false,
    icon: '/image/badge/together.svg',
  },
]

/** 메인 미션 ID (포토 티켓 제외) */
const MAIN_MISSION_IDS = new Set(DEFAULT_MISSIONS.map(m => m.id))

const MissionContext = createContext<MissionContextType | null>(null)

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS)
  const [loading, setLoading] = useState(false)
  const [newlyCompletedMission, setNewlyCompletedMission] = useState<Mission | null>(null)
  const prevCompletedRef = useRef<Set<string>>(new Set())
  const initialSyncDone = useRef(false)

  const clearNewlyCompleted = useCallback(() => {
    setNewlyCompletedMission(null)
  }, [])

  const resetAndSync = useCallback(async () => {
    setMissions(DEFAULT_MISSIONS)
    setNewlyCompletedMission(null)
    prevCompletedRef.current = new Set()
    initialSyncDone.current = false
    setLoading(true)
    try {
      const res = await missionApi.getMyMissions()
      const serverMissions = res.data
      if (serverMissions.length > 0) {
        const updated = DEFAULT_MISSIONS.map(m => {
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
        })
        prevCompletedRef.current = new Set(
          updated.filter(m => m.isCompleted).map(m => m.id)
        )
        initialSyncDone.current = true
        setMissions(updated)
      }
    } catch {
      // 실패 시 기본값 유지
    } finally {
      setLoading(false)
    }
  }, [])

  const syncFromServer = useCallback(async (options?: { silent?: boolean }) => {
    setLoading(true)
    try {
      const res = await missionApi.getMyMissions()
      const serverMissions = res.data
      if (serverMissions.length > 0) {
        setMissions(prev => {
          const updated = prev.map(m => {
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
          })
          return updated
        })

        // 완료 감지 (메인 미션만, 포토 티켓 제외, silent가 아닐 때만)
        if (initialSyncDone.current && !options?.silent) {
          const newlyCompleted = serverMissions.find(
            sm => sm.isCompleted && MAIN_MISSION_IDS.has(sm.missionId) && !prevCompletedRef.current.has(sm.missionId)
          )
          if (newlyCompleted) {
            const mission = DEFAULT_MISSIONS.find(m => m.id === newlyCompleted.missionId)!
            setNewlyCompletedMission({
              ...mission,
              isCompleted: true,
              progress: newlyCompleted.progress,
              target: newlyCompleted.target > 0 ? newlyCompleted.target : mission.target,
            })
          }
        }

        // 스냅샷 갱신
        prevCompletedRef.current = new Set(
          serverMissions.filter(sm => sm.isCompleted).map(sm => sm.missionId)
        )
        initialSyncDone.current = true
      }
    } catch {
      // 서버 동기화 실패 시 기본값 유지
    } finally {
      setLoading(false)
    }
  }, [])

  // SSE mission-complete 이벤트 수신 시 자동 동기화
  useEffect(() => {
    const handler = () => {
      syncFromServer()
    }
    window.addEventListener('mission-complete', handler)
    return () => window.removeEventListener('mission-complete', handler)
  }, [syncFromServer])

  // 마운트 시 자동으로 서버에서 동기화
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      syncFromServer()
    }
  }, [syncFromServer])

  return (
    <MissionContext.Provider value={{ missions, syncFromServer, resetAndSync, loading, newlyCompletedMission, clearNewlyCompleted }}>
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
