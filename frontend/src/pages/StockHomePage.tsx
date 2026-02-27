import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockApi, missionApi } from '../api'
import { formatKorean } from '../utils/format'
import { useMissions, type Mission } from '../components/MissionContext'
import type { MissionRankingItem } from '../types'
import styles from './HomePage.module.css'
import badgeStyles from './BadgePage.module.css'

/** 정량 측정 가능한 미션 ID */
const QUANTITATIVE_IDS = new Set(['renew', 'dream', 'again', 'sincere'])

/** 미션별 수치 단위 */
const MISSION_UNIT: Record<string, string> = {
  renew: '회',
  dream: '회',
  again: '명',
  sincere: '회',
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const CONFETTI_STYLES: React.CSSProperties[] = Array.from({ length: 40 }, (_, i) => {
  const colors = ['#6C63FF', '#4593FC', '#F5C842', '#00D68F', '#F04452', '#FF8A65']
  return {
    '--x': `${(seededRandom(i * 3) - 0.5) * 300}px`,
    '--y': `${-seededRandom(i * 3 + 1) * 400 - 100}px`,
    '--r': `${seededRandom(i * 3 + 2) * 720 - 360}deg`,
    '--delay': `${i * 0.03}s`,
    backgroundColor: colors[i % colors.length],
  } as React.CSSProperties
})

function BadgeImage({ mission, size = 'normal' }: { mission: Mission; size?: 'normal' | 'large' }) {
  const unlocked = mission.isCompleted
  const sizeClass = size === 'large' ? badgeStyles.hexLarge : ''

  return (
    <div className={`${badgeStyles.hexWrap} ${unlocked ? badgeStyles.hexUnlocked : badgeStyles.hexLocked} ${sizeClass}`}>
      <img
        src={mission.icon}
        alt={mission.title}
        className={badgeStyles.badgeImg}
        draggable={false}
      />
    </div>
  )
}

function ProgressBar({ progress, target }: { progress: number; target: number }) {
  const pct = Math.min((progress / target) * 100, 100)
  return (
    <div className={badgeStyles.progressTrack}>
      <div className={badgeStyles.progressFill} style={{ width: `${pct}%` }} />
      <span className={badgeStyles.progressText}>{progress} / {target}</span>
    </div>
  )
}

function MiniProgressBar({ mission }: { mission: Mission }) {
  const progress = mission.progress ?? 0
  const target = mission.target ?? 1
  const pct = Math.min((progress / target) * 100, 100)
  const unit = MISSION_UNIT[mission.id] || ''

  return (
    <div className={badgeStyles.miniProgressGroup}>
      <span className={`${badgeStyles.miniProgressLabel} ${mission.isCompleted ? badgeStyles.miniProgressLabelComplete : ''}`}>
        {QUANTITATIVE_IDS.has(mission.id)
          ? `${progress}/${target}${unit}`
          : mission.isCompleted ? '완료' : `${Math.round(pct)}%`
        }
      </span>
      <div className={badgeStyles.miniProgressTrack}>
        <div
          className={`${badgeStyles.miniProgressFill} ${mission.isCompleted ? badgeStyles.miniProgressComplete : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ConfettiParticle({ index }: { index: number }) {
  return <div className={badgeStyles.confetti} style={CONFETTI_STYLES[index]} />
}

function RankBadgeLabel({ rank }: { rank: number }) {
  if (rank === 1) return <span className={badgeStyles.rankBadgeGold}>1st</span>
  if (rank === 2) return <span className={badgeStyles.rankBadgeSilver}>2nd</span>
  if (rank === 3) return <span className={badgeStyles.rankBadgeBronze}>3rd</span>
  return <span>{rank}</span>
}

function RankChangeIndicator({ change }: { change: number }) {
  if (change === 0) return null
  if (change > 0) {
    return <span className={badgeStyles.rankUp}>▲{change}</span>
  }
  return <span className={badgeStyles.rankDown}>▼{Math.abs(change)}</span>
}

export default function StockHomePage() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''
  const userCompany = localStorage.getItem('userCompany') || ''
  const [balance, setBalance] = useState<number | null>(null)
  const [totalHolding, setTotalHolding] = useState(0)

  // Mission 관련 state
  const { missions, syncFromServer } = useMissions()
  const [showRanking, setShowRanking] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('renew')
  const [rankings, setRankings] = useState<MissionRankingItem[]>([])
  const [myRanking, setMyRanking] = useState<MissionRankingItem | null>(null)
  const [rankingLoading, setRankingLoading] = useState(false)

  useEffect(() => {
    stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
    stockApi.getMy().then(res => {
      const total = res.data.reduce((sum: number, h: { amount: number }) => sum + h.amount, 0)
      setTotalHolding(total)
    }).catch(() => {})
    syncFromServer()
  }, [syncFromServer])

  useEffect(() => {
    const handler = () => {
      stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
      stockApi.getMy().then(res => {
        const total = res.data.reduce((sum: number, h: { amount: number }) => sum + h.amount, 0)
        setTotalHolding(total)
      }).catch(() => {})
    }
    window.addEventListener('balance-changed', handler)
    return () => window.removeEventListener('balance-changed', handler)
  }, [])

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
    if (showRanking) {
      loadRanking(selectedFilter)
    }
  }, [showRanking, selectedFilter, loadRanking])

  const totalAsset = (balance || 0) + totalHolding

  // Mission 파생 상태
  const row1 = missions.slice(0, 3)
  const row2 = missions.slice(3, 6)
  const currentFilterMission = missions.find(m => m.id === selectedFilter)
  const currentUnit = MISSION_UNIT[selectedFilter] || ''
  const freshMission = selectedMission
    ? missions.find(m => m.id === selectedMission.id) ?? selectedMission
    : null
  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)

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

  const closeBadgeModal = () => {
    setSelectedMission(null)
    setShowSuccess(false)
  }

  return (
    <div className={styles.container}>
      {/* 유저 정보 + 투자 금액 카드 */}
      <div className={styles.investCard}>
        <div className={styles.cardTop}>
          <p className={styles.cardCompany}>{userCompany || 'ONLYONE FAIR'}</p>
          <p className={styles.cardGreeting}>{userName}님의 현재 투자 금액</p>
          <div className={styles.cardAmountRow}>
            <p className={styles.cardAmount}>{formatKorean(totalHolding)}원</p>
            <button className={styles.cardBtn} onClick={() => navigate('/stocks/booths')}>주식 종목 보기</button>
          </div>
        </div>
        <div className={styles.cardBottom}>
          <div className={styles.cardBottomItem}>
            <div className={styles.cardAssetDot} style={{ background: '#4FC3F7' }} />
            <span className={styles.cardAssetLabel}>총 보유 자산</span>
            <span className={styles.cardAssetValue}>{formatKorean(totalAsset)}원</span>
          </div>
          <div className={styles.cardBottomItem}>
            <div className={styles.cardAssetDot} style={{ background: '#FFB74D' }} />
            <span className={styles.cardAssetLabel}>투자 금액</span>
            <span className={styles.cardAssetValue}>{formatKorean(totalHolding)}원</span>
          </div>
        </div>
      </div>

      {/* Mission 섹션 */}
      <div className={styles.missionSection}>
        <div className={styles.missionHeader}>
          {showRanking ? (
            <>
              <button className={styles.missionToggleLink} onClick={() => setShowRanking(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                </svg>
                미션 보기
              </button>
              <h2 className={styles.missionTitle}>미션 랭킹</h2>
              <div className={styles.missionHeaderSpacer} />
            </>
          ) : (
            <>
              <h2 className={styles.missionTitle}>하고잡이 미션</h2>
              <button className={styles.rankingLink} onClick={() => setShowRanking(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 20h20v2H2v-2zm2-7h3v6H4v-6zm5-4h3v10H9V9zm5-4h3v14h-3V5zm5-4h3v18h-3V1z" />
                </svg>
                랭킹 보기
              </button>
            </>
          )}
        </div>

        {!showRanking ? (
          <>
            <p className={styles.missionSubtitle}>부스를 돌아다니며 아래의 미션을 수행하세요!</p>

            <div className={styles.badgeGrid}>
              {row1.map((mission: Mission, i: number) => (
                <button
                  key={mission.id}
                  className={`${styles.badgeCell} stagger-item`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  onClick={() => handleBadgeTap(mission)}
                >
                  <div className={styles.badgeWrap}>
                    <BadgeImage mission={mission} />
                    <MiniProgressBar mission={mission} />
                  </div>
                  <span className={styles.badgeLabel}>{mission.title}</span>
                </button>
              ))}
            </div>

            <div className={styles.badgeGrid}>
              {row2.map((mission: Mission, i: number) => (
                <button
                  key={mission.id}
                  className={`${styles.badgeCell} stagger-item`}
                  style={{ animationDelay: `${(i + 3) * 0.08}s` }}
                  onClick={() => handleBadgeTap(mission)}
                >
                  <div className={styles.badgeWrap}>
                    <BadgeImage mission={mission} />
                    <MiniProgressBar mission={mission} />
                  </div>
                  <span className={styles.badgeLabel}>{mission.title}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.rankingInline}>
            {/* 미션 필터 바 */}
            <div className={badgeStyles.filterBar}>
              {missions.map((m: Mission) => (
                <button
                  key={m.id}
                  className={`${badgeStyles.filterChip} ${selectedFilter === m.id ? badgeStyles.filterChipActive : ''}`}
                  onClick={() => setSelectedFilter(m.id)}
                >
                  <img src={m.icon} alt={m.title} className={badgeStyles.filterChipIcon} />
                  {m.title}
                </button>
              ))}
            </div>

            {/* 내 랭킹 카드 */}
            {currentFilterMission && (
              <div className={badgeStyles.myRankCard}>
                <div className={badgeStyles.myRankBadge}>
                  <img src={currentFilterMission.icon} alt={currentFilterMission.title} />
                </div>
                <div className={badgeStyles.myRankInfo}>
                  <p className={badgeStyles.myRankLabel}>내 순위</p>
                  <p className={badgeStyles.myRankName}>{userName || '-'}</p>
                  <div className={badgeStyles.myRankScoreRow}>
                    <span className={badgeStyles.myRankScore}>
                      {myRanking ? myRanking.progress : 0}
                    </span>
                    <span className={badgeStyles.myRankScoreUnit}>{currentUnit}</span>
                    {myRanking && <RankChangeIndicator change={myRanking.rankChange} />}
                  </div>
                </div>
                <div className={badgeStyles.myRankPosition}>
                  {myRanking ? `${myRanking.rank}위` : '-'}
                </div>
              </div>
            )}

            {/* 랭킹 헤더 */}
            <div className={badgeStyles.rankingHeader}>
              <p className={badgeStyles.rankingSubtitle}>
                {currentFilterMission?.title} 순위
              </p>
            </div>

            {rankingLoading ? null : rankings.length === 0 ? (
              <div className={badgeStyles.rankEmpty}>
                <div className={badgeStyles.rankEmptyIcon}>🏆</div>
                <p className={badgeStyles.rankEmptyText}>
                  아직 미션에 참여한 사용자가 없습니다<br />
                  미션을 완료하고 첫 번째 순위에 도전하세요!
                </p>
              </div>
            ) : (
              <>
                {top3.length > 0 && (
                  <div className={badgeStyles.rankPodium}>
                    {top3.map((item: MissionRankingItem, i: number) => (
                      <div
                        key={item.userId}
                        className={`${badgeStyles.rankPodiumItem} ${i === 0 ? badgeStyles.rankFirst : i === 1 ? badgeStyles.rankSecond : badgeStyles.rankThird} stagger-item`}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        <div className={badgeStyles.podiumRankBadge}>
                          <RankBadgeLabel rank={item.rank} />
                        </div>
                        <div className={badgeStyles.podiumAvatar}>
                          {item.name.charAt(0)}
                        </div>
                        <p className={badgeStyles.podiumName}>{item.name}{item.company ? ` · ${item.company}` : ''}</p>
                        <div className={badgeStyles.podiumScoreRow}>
                          <span className={badgeStyles.podiumRate}>{item.progress}</span>
                          <span className={badgeStyles.podiumRateUnit}>{currentUnit}</span>
                        </div>
                        {item.rankChange !== 0 && (
                          <div className={badgeStyles.podiumChange}>
                            <RankChangeIndicator change={item.rankChange} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {rest.length > 0 && (
                  <div className={badgeStyles.rankList}>
                    {rest.map((item: MissionRankingItem, i: number) => (
                      <div
                        key={item.userId}
                        className={`${badgeStyles.rankListItem} stagger-item`}
                        style={{ animationDelay: `${(i + 3) * 0.06}s` }}
                      >
                        <span className={badgeStyles.rankListNum}>{item.rank}</span>
                        <div className={badgeStyles.rankListAvatar}>
                          {item.name.charAt(0)}
                        </div>
                        <div className={badgeStyles.rankListInfo}>
                          <p className={badgeStyles.rankListName}>{item.name}{item.company ? ` · ${item.company}` : ''}</p>
                        </div>
                        <div className={badgeStyles.rankListScoreArea}>
                          <span className={badgeStyles.rankListRate}>{item.progress}{currentUnit}</span>
                          <RankChangeIndicator change={item.rankChange} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 미션 정보 바텀시트 */}
      {freshMission && !showSuccess && (
        <div className={badgeStyles.overlay} onClick={closeBadgeModal}>
          <div className={badgeStyles.bottomSheet} onClick={e => e.stopPropagation()}>
            <div className={badgeStyles.sheetHandle} />
            <div className={badgeStyles.sheetBadge}>
              <BadgeImage mission={freshMission} size="large" />
            </div>
            <h3 className={badgeStyles.sheetTitle}>{freshMission.title}</h3>
            <p className={badgeStyles.sheetDesc}>{freshMission.description}</p>

            {freshMission.target != null && (
              <ProgressBar
                progress={freshMission.progress ?? 0}
                target={freshMission.target}
              />
            )}

            {QUANTITATIVE_IDS.has(freshMission.id) && (
              <p className={badgeStyles.sheetCount}>
                현재 횟수: <strong>{freshMission.progress ?? 0}{MISSION_UNIT[freshMission.id] || ''}</strong>
              </p>
            )}

            {freshMission.isCompleted && (
              <div className={badgeStyles.completedBanner}>
                <span>🎉</span>
                <p>미션 완료!</p>
              </div>
            )}

            <button className={badgeStyles.closeButton} onClick={closeBadgeModal}>닫기</button>
          </div>
        </div>
      )}

      {/* 성공 모달 */}
      {showSuccess && (
        <div className={badgeStyles.overlay} onClick={closeBadgeModal}>
          <div className={badgeStyles.successModal} onClick={e => e.stopPropagation()}>
            <div className={badgeStyles.successBadgeWrap}>
              <BadgeImage mission={freshMission ?? missions[0]} size="large" />
            </div>
            <h3 className={badgeStyles.successTitle}>🎉 미션 완료!</h3>
            <p className={badgeStyles.successDesc}>
              {freshMission?.title} 배지를 획득했습니다
            </p>
            <button className={badgeStyles.successButton} onClick={closeBadgeModal}>확인</button>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className={badgeStyles.confettiContainer}>
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

    </div>
  )
}
