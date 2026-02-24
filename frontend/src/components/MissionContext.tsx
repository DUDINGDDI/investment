import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export interface Mission {
  id: string
  title: string
  description: string
  isCompleted: boolean
  progress?: number
  target?: number
  icon: string
}

interface MissionContextType {
  missions: Mission[]
  updateProgress: (id: string, progress: number) => void
  completeMission: (id: string) => void
  resetMission: (id: string) => void
}

const STORAGE_KEY = 'mission_states'

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'renew',
    title: '내일 더 새롭게',
    description: '타 부스 아이디어 中 1회 아이디어 개선 방향 제안',
    isCompleted: false,
    icon: '/image/badge/01_new.svg',
  },
  {
    id: 'dream',
    title: '꿈을 원대하게',
    description: '명예의 전당 방문 후 대표작 1개 이상 질문 작성',
    isCompleted: false,
    icon: '/image/badge/02_dream.svg',
  },
  {
    id: 'result',
    title: '반드시 결과로',
    description: '⇒ 투자',
    isCompleted: false,
    icon: '/image/badge/03_result.svg',
  },
  {
    id: 'again',
    title: '안돼도 다시',
    description: '본인 부스 방문 인원 70명 이상 달성하기',
    isCompleted: false,
    progress: 0,
    target: 70,
    icon: '/image/badge/04_retry.svg',
  },
  {
    id: 'sincere',
    title: '진정성 있게',
    description: '부스 리뷰 12개 작성 시 완료',
    isCompleted: false,
    progress: 0,
    target: 12,
    icon: '/image/badge/05_truth.svg',
  },
  {
    id: 'together',
    title: '(+) 함께하는 하고잡이',
    description: '지구본 콘텐츠 방문',
    isCompleted: false,
    icon: '/image/badge/06_together.svg',
  },
]

const MissionContext = createContext<MissionContextType | null>(null)

function loadMissions(): Mission[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_MISSIONS

    const parsed: Mission[] = JSON.parse(stored)
    return DEFAULT_MISSIONS.map(def => {
      const saved = parsed.find(m => m.id === def.id)
      if (!saved) return def
      return {
        ...def,
        isCompleted: saved.isCompleted,
        progress: saved.progress ?? def.progress,
      }
    })
  } catch {
    return DEFAULT_MISSIONS
  }
}

function saveMissions(missions: Mission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(
    missions.map(m => ({ id: m.id, isCompleted: m.isCompleted, progress: m.progress }))
  ))
}

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(loadMissions)

  useEffect(() => {
    saveMissions(missions)
  }, [missions])

  const updateProgress = useCallback((id: string, progress: number) => {
    setMissions(prev => prev.map(m => {
      if (m.id !== id) return m
      const newProgress = Math.max(0, progress)
      const completed = m.target ? newProgress >= m.target : false
      return { ...m, progress: newProgress, isCompleted: completed || m.isCompleted }
    }))
  }, [])

  const completeMission = useCallback((id: string) => {
    setMissions(prev => prev.map(m =>
      m.id === id ? { ...m, isCompleted: true, progress: m.target ?? m.progress } : m
    ))
  }, [])

  const resetMission = useCallback((id: string) => {
    setMissions(prev => prev.map(m =>
      m.id === id ? { ...m, isCompleted: false, progress: m.target ? 0 : undefined } : m
    ))
  }, [])

  return (
    <MissionContext.Provider value={{ missions, updateProgress, completeMission, resetMission }}>
      {children}
    </MissionContext.Provider>
  )
}

export function useMissions() {
  const ctx = useContext(MissionContext)
  if (!ctx) throw new Error('useMissions must be used within MissionProvider')
  return ctx
}
