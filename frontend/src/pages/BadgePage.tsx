import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMissions, type Mission } from '../components/MissionContext'
import { userApi } from '../api'
import type { UserResponse } from '../types'
import styles from './BadgePage.module.css'

function formatWon(n: number) {
  return n.toLocaleString('ko-KR')
}

function BadgeImage({ mission, size = 'normal' }: { mission: Mission; size?: 'normal' | 'large' }) {
  const unlocked = mission.isCompleted
  const sizeClass = size === 'large' ? styles.hexLarge : ''

  return (
    <div className={`${styles.hexWrap} ${unlocked ? styles.hexUnlocked : styles.hexLocked} ${sizeClass}`}>
      <img
        src={mission.icon}
        alt={mission.title}
        className={styles.badgeImg}
        draggable={false}
      />
    </div>
  )
}

function ProgressBar({ progress, target }: { progress: number; target: number }) {
  const pct = Math.min((progress / target) * 100, 100)
  return (
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      <span className={styles.progressText}>{progress} / {target}</span>
    </div>
  )
}

function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#6C63FF', '#4593FC', '#F5C842', '#00D68F', '#F04452', '#FF8A65']
  const style = {
    '--x': `${(Math.random() - 0.5) * 300}px`,
    '--y': `${-Math.random() * 400 - 100}px`,
    '--r': `${Math.random() * 720 - 360}deg`,
    '--delay': `${index * 0.03}s`,
    backgroundColor: colors[index % colors.length],
  } as React.CSSProperties
  return <div className={styles.confetti} style={style} />
}

export default function BadgePage() {
  const { missions, updateProgress, completeMission } = useMissions()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [activeTab, setActiveTab] = useState('badges')
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    userApi.getMe().then(res => setUser(res.data)).catch(() => {})
  }, [])

  const completedCount = missions.filter(m => m.isCompleted).length
  const row1 = missions.slice(0, 3)
  const row2 = missions.slice(3, 6)

  const handleBadgeTap = (mission: Mission) => {
    if (mission.isCompleted) {
      setSelectedMission(mission)
      setShowSuccess(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    } else {
      setSelectedMission(mission)
    }
  }

  const handleSimulateProgress = () => {
    if (!selectedMission) return
    if (selectedMission.target != null) {
      const current = selectedMission.progress ?? 0
      updateProgress(selectedMission.id, current + 1)
    } else {
      completeMission(selectedMission.id)
      setSelectedMission(null)
      setShowSuccess(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'history') navigate('/history')
    if (tab === 'stats') navigate('/result')
  }

  const closeModal = () => {
    setSelectedMission(null)
    setShowSuccess(false)
  }

  const freshMission = selectedMission
    ? missions.find(m => m.id === selectedMission.id) ?? selectedMission
    : null

  const userName = user?.name || localStorage.getItem('userName') || ''

  return (
    <div className={styles.container}>
      {/* 프로필 영역 */}
      <div className={styles.profileSection}>
        <div className={styles.avatar}>
          <span className={styles.avatarText}>
            {userName ? userName.charAt(0) : '?'}
          </span>
        </div>
        <h2 className={styles.userName}>{userName || '-'}</h2>
        <p className={styles.userRole}>참가자</p>
        <div className={styles.balanceRow}>
          <span className={styles.coinIcon}>🪙</span>
          <span className={styles.balanceText}>{formatWon(user?.balance ?? 0)}</span>
        </div>
      </div>

      {/* 탭 바 */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'badges' ? styles.tabActive : ''}`}
          onClick={() => handleTabClick('badges')}
        >BADGES</button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
          onClick={() => handleTabClick('history')}
        >HISTORY</button>
        <button
          className={`${styles.tab} ${activeTab === 'stats' ? styles.tabActive : ''}`}
          onClick={() => handleTabClick('stats')}
        >STATS</button>
      </div>

      {/* 배지 카운트 */}
      <p className={styles.badgeCount}>{completedCount} / {missions.length} 완료</p>

      {/* 배지 섹션 1: 핵심 미션 */}
      <div className={styles.section}>
        <h3 className={styles.categoryTitle}>핵심 미션</h3>
        <div className={styles.badgeRow}>
          {row1.map((mission, i) => (
            <button
              key={mission.id}
              className={`${styles.badgeCell} stagger-item`}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => handleBadgeTap(mission)}
            >
              <BadgeImage mission={mission} />
              <span className={styles.chip}>
                {mission.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 배지 섹션 2: 도전 미션 */}
      <div className={styles.section}>
        <h3 className={styles.categoryTitle}>도전 미션</h3>
        <div className={styles.badgeRow}>
          {row2.map((mission, i) => (
            <button
              key={mission.id}
              className={`${styles.badgeCell} stagger-item`}
              style={{ animationDelay: `${(i + 3) * 0.08}s` }}
              onClick={() => handleBadgeTap(mission)}
            >
              <BadgeImage mission={mission} />
              <span className={styles.chip}>
                {mission.target != null && !mission.isCompleted
                  ? `${mission.progress ?? 0}/${mission.target}`
                  : mission.title
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 잠김 미션 바텀시트 */}
      {freshMission && !showSuccess && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <div className={styles.sheetBadge}>
              <BadgeImage mission={freshMission} size="large" />
            </div>
            <h3 className={styles.sheetTitle}>{freshMission.title}</h3>
            <p className={styles.sheetDesc}>{freshMission.description}</p>

            {freshMission.target != null && (
              <ProgressBar
                progress={freshMission.progress ?? 0}
                target={freshMission.target}
              />
            )}

            {!freshMission.isCompleted && (
              <button className={styles.ctaButton} onClick={handleSimulateProgress}>
                {freshMission.target != null ? '진행도 +1 (데모)' : '미션 완료 (데모)'}
              </button>
            )}

            {freshMission.isCompleted && (
              <div className={styles.completedBanner}>
                <span>🎉</span>
                <p>미션 완료!</p>
              </div>
            )}

            <button className={styles.closeButton} onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}

      {/* 성공 모달 */}
      {showSuccess && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.successModal} onClick={e => e.stopPropagation()}>
            <div className={styles.successBadgeWrap}>
              <BadgeImage mission={freshMission ?? missions[0]} size="large" />
            </div>
            <h3 className={styles.successTitle}>🎉 미션 완료!</h3>
            <p className={styles.successDesc}>
              {freshMission?.title} 배지를 획득했습니다
            </p>
            <button className={styles.successButton} onClick={closeModal}>확인</button>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
