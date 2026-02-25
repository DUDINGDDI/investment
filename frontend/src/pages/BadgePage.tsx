import { useState, useEffect, useCallback } from 'react'
import { useMissions, type Mission } from '../components/MissionContext'
import { userApi, missionApi } from '../api'
import type { UserResponse, MissionRankingItem } from '../types'
import styles from './BadgePage.module.css'

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

function RankBadgeLabel({ rank }: { rank: number }) {
  if (rank === 1) return <span className={styles.rankBadgeGold}>1st</span>
  if (rank === 2) return <span className={styles.rankBadgeSilver}>2nd</span>
  if (rank === 3) return <span className={styles.rankBadgeBronze}>3rd</span>
  return <span>{rank}</span>
}

export default function BadgePage() {
  const { missions, syncFromServer } = useMissions()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [activeTab, setActiveTab] = useState('badges')
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // 랭킹 탭 상태
  const [selectedFilter, setSelectedFilter] = useState('renew')
  const [rankings, setRankings] = useState<MissionRankingItem[]>([])
  const [myRanking, setMyRanking] = useState<MissionRankingItem | null>(null)
  const [rankingLoading, setRankingLoading] = useState(false)

  useEffect(() => {
    userApi.getMe().then(res => setUser(res.data)).catch(() => {})
    syncFromServer()
  }, [syncFromServer])

  const loadRanking = useCallback(async (missionId: string) => {
    setRankingLoading(true)
    try {
      const res = await missionApi.getRanking(missionId)
      setRankings(res.data.rankings)
      setMyRanking(res.data.myRanking)
    } catch {
      setRankings([])
      setMyRanking(null)
    } finally {
      setRankingLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'ranking') {
      loadRanking(selectedFilter)
    }
  }, [activeTab, selectedFilter, loadRanking])

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

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
  }

  const closeModal = () => {
    setSelectedMission(null)
    setShowSuccess(false)
  }

  const freshMission = selectedMission
    ? missions.find(m => m.id === selectedMission.id) ?? selectedMission
    : null

  const userName = user?.name || localStorage.getItem('userName') || ''
  const currentFilterMission = missions.find(m => m.id === selectedFilter)

  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)

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
      </div>

      {/* 탭 바 (2개) */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'badges' ? styles.tabActive : ''}`}
          onClick={() => handleTabClick('badges')}
        >BADGES</button>
        <button
          className={`${styles.tab} ${activeTab === 'ranking' ? styles.tabActive : ''}`}
          onClick={() => handleTabClick('ranking')}
        >RANKING</button>
      </div>

      {/* BADGES 탭 콘텐츠 */}
      {activeTab === 'badges' && (
        <>
          <p className={styles.badgeCount}>{completedCount} / {missions.length} 완료</p>

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
        </>
      )}

      {/* RANKING 탭 콘텐츠 */}
      {activeTab === 'ranking' && (
        <>
          {/* 미션 필터 바 */}
          <div className={styles.filterBar}>
            {missions.map(m => (
              <button
                key={m.id}
                className={`${styles.filterChip} ${selectedFilter === m.id ? styles.filterChipActive : ''}`}
                onClick={() => setSelectedFilter(m.id)}
              >
                <img src={m.icon} alt={m.title} className={styles.filterChipIcon} />
                {m.title}
              </button>
            ))}
          </div>

          {/* 내 랭킹 카드 */}
          {currentFilterMission && (
            <div className={styles.myRankCard}>
              <div className={styles.myRankBadge}>
                <img src={currentFilterMission.icon} alt={currentFilterMission.title} />
              </div>
              <div className={styles.myRankInfo}>
                <p className={styles.myRankLabel}>내 순위</p>
                <p className={styles.myRankName}>{userName || '-'}</p>
                <p className={styles.myRankRate}>
                  {myRanking
                    ? `달성률 ${myRanking.achievementRate.toFixed(1)}%`
                    : '달성률 0.0%'}
                </p>
              </div>
              <div className={styles.myRankPosition}>
                {myRanking ? `${myRanking.rank}위` : '-'}
              </div>
            </div>
          )}

          {/* 랭킹 헤더 */}
          <div className={styles.rankingHeader}>
            <h3 className={styles.rankingTitle}>미션 랭킹</h3>
            <p className={styles.rankingSubtitle}>
              {currentFilterMission?.title} 달성률 순위
            </p>
          </div>

          {rankingLoading ? null : rankings.length === 0 ? (
            <div className={styles.rankEmpty}>
              <div className={styles.rankEmptyIcon}>🏆</div>
              <p className={styles.rankEmptyText}>
                아직 미션에 참여한 사용자가 없습니다<br />
                미션을 완료하고 첫 번째 순위에 도전하세요!
              </p>
            </div>
          ) : (
            <>
              {/* 포디움 (1~3위) */}
              {top3.length > 0 && (
                <div className={styles.rankPodium}>
                  {top3.map((item, i) => (
                    <div
                      key={item.userId}
                      className={`${styles.rankPodiumItem} ${i === 0 ? styles.rankFirst : i === 1 ? styles.rankSecond : styles.rankThird} stagger-item`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div className={styles.podiumRankBadge}>
                        <RankBadgeLabel rank={item.rank} />
                      </div>
                      <div className={styles.podiumAvatar}>
                        {item.name.charAt(0)}
                      </div>
                      <p className={styles.podiumName}>{item.name}</p>
                      <p className={styles.podiumRate}>{item.achievementRate.toFixed(1)}</p>
                      <p className={styles.podiumRateUnit}>%</p>
                      <p className={styles.podiumStatus}>
                        {item.isCompleted ? '완료' : `${item.progress}/${item.target}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 4위 이하 리스트 */}
              {rest.length > 0 && (
                <div className={styles.rankList}>
                  {rest.map((item, i) => (
                    <div
                      key={item.userId}
                      className={`${styles.rankListItem} stagger-item`}
                      style={{ animationDelay: `${(i + 3) * 0.06}s` }}
                    >
                      <span className={styles.rankListNum}>{item.rank}</span>
                      <div className={styles.rankListAvatar}>
                        {item.name.charAt(0)}
                      </div>
                      <div className={styles.rankListInfo}>
                        <p className={styles.rankListName}>{item.name}</p>
                        <p className={styles.rankListSub}>
                          {item.isCompleted ? '미션 완료' : `${item.progress}/${item.target}`}
                        </p>
                      </div>
                      <p className={styles.rankListRate}>{item.achievementRate.toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 미션 정보 바텀시트 */}
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
