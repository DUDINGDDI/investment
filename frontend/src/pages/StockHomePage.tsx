import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockApi, missionApi, resultApi } from '../api'
import { formatKorean } from '../utils/format'
import { useMissions, type Mission } from '../components/MissionContext'
import type { MissionRankingItem, StockHoldingResponse } from '../types'
import styles from './HomePage.module.css'
import portfolioStyles from './BoothListPage.module.css'
import badgeStyles from './BadgePage.module.css'

/** 정량 측정 가능한 미션 ID */
const QUANTITATIVE_IDS = new Set(['dream', 'again', 'sincere'])

/** 미션별 수치 단위 */
const MISSION_UNIT: Record<string, string> = {
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
      {QUANTITATIVE_IDS.has(mission.id) ? (
        <>
          <span className={`${badgeStyles.miniProgressLabel} ${mission.isCompleted ? badgeStyles.miniProgressLabelComplete : ''}`}>
            {`${progress}/${target}${unit}`}
          </span>
          <div className={badgeStyles.miniProgressTrack}>
            <div
              className={`${badgeStyles.miniProgressFill} ${mission.isCompleted ? badgeStyles.miniProgressComplete : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      ) : (
        <span className={`${badgeStyles.miniStatusLabel} ${mission.isCompleted ? badgeStyles.miniStatusComplete : ''}`}>
          {mission.isCompleted ? '완료' : '미완료'}
        </span>
      )}
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
  const [balance, setBalance] = useState<number | null>(null)
  const [totalHolding, setTotalHolding] = useState(0)
  const [holdings, setHoldings] = useState<StockHoldingResponse[]>([])

  // Mission 관련 state
  const { missions, syncFromServer } = useMissions()
  const [showRanking, setShowRanking] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('dream')
  const [rankings, setRankings] = useState<MissionRankingItem[]>([])
  const [myRanking, setMyRanking] = useState<MissionRankingItem | null>(null)
  const [rankingLoading, setRankingLoading] = useState(false)
  const [stockRankingEnabled, setStockRankingEnabled] = useState(true)

  useEffect(() => {
    stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
    stockApi.getMy().then(res => {
      setHoldings(res.data)
      const total = res.data.reduce((sum: number, h: { amount: number }) => sum + h.amount, 0)
      setTotalHolding(total)
    }).catch(() => {})
    resultApi.getStockRankingStatus().then(res => setStockRankingEnabled(res.data.enabled)).catch(() => {})
  }, [])

  // SSE mission-complete 이벤트 수신 → 미션 갱신 + 완료 효과
  useEffect(() => {
    const handler = (e: Event) => {
      const { missionId } = (e as CustomEvent).detail
      syncFromServer().then(() => {
        const m = missions.find(mi => mi.id === missionId)
        if (m) {
          setSelectedMission(m)
          setShowSuccess(true)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      })
    }
    window.addEventListener('mission-complete', handler)
    return () => window.removeEventListener('mission-complete', handler)
  }, [syncFromServer, missions])

  useEffect(() => {
    const handler = () => {
      stockApi.getAccount().then(res => setBalance(res.data.balance)).catch(() => {})
      stockApi.getMy().then(res => {
        setHoldings(res.data)
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
      {/* 나의 투자 현황 카드 */}
      {(() => {
        const COLORS = ['#6C5CE7', '#4593FC', '#00D68F', '#F5C842', '#F04452', '#FF8A65', '#a855f7', '#14b8a6', '#f97316', '#ec4899', '#8b5cf6']
        const bal = balance || 0
        const totalAsset = bal + totalHolding
        const holdingPct = totalAsset > 0 ? Math.round((totalHolding / totalAsset) * 100) : 0
        const investedSegments = [...holdings]
          .filter(h => h.amount > 0)
          .sort((a, b) => b.amount - a.amount)
          .map((h, i) => ({
            boothId: h.boothId,
            color: COLORS[i % COLORS.length],
            pct: totalAsset > 0 ? (h.amount / totalAsset) * 100 : 0,
          }))
        const balancePct = totalAsset > 0 ? (bal / totalAsset) * 100 : 100
        const donutSegments = [
          ...investedSegments,
          { boothId: -1, color: '#888888', pct: balancePct },
        ]
        const radius = 70
        const circumference = 2 * Math.PI * radius
        const segmentOffsets: number[] = []
        for (let i = 0; i < donutSegments.length; i++) {
          segmentOffsets.push(i === 0 ? 0 : segmentOffsets[i - 1] + (donutSegments[i - 1].pct / 100) * circumference)
        }

        return (
          <div className={portfolioStyles.statusCard}>
            <div className={portfolioStyles.statusHeader}>
              <h3 className={portfolioStyles.statusTitle}>나의 투자 현황</h3>
              <button className={portfolioStyles.historyLink} onClick={() => navigate('/stocks/history')}>
                투자 이력 보기 ›
              </button>
            </div>

            <div className={portfolioStyles.chartWrapLarge}>
              <svg viewBox="0 0 180 180" className={portfolioStyles.donutSvg}>
                <circle cx="90" cy="90" r={radius} fill="none" stroke="#888888" strokeWidth="16" />
                {donutSegments.map((seg, i) => {
                  const dashLength = (seg.pct / 100) * circumference
                  const dashGap = circumference - dashLength
                  const offset = segmentOffsets[i]
                  return (
                    <circle
                      key={seg.boothId}
                      cx="90" cy="90" r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="16"
                      strokeDasharray={`${dashLength} ${dashGap}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
                    />
                  )
                })}
                <text x="90" y="85" textAnchor="middle" className={portfolioStyles.donutLabel}>투자 비중</text>
                <text x="90" y="105" textAnchor="middle" className={portfolioStyles.donutValue}>{holdingPct}%</text>
              </svg>
            </div>

            <div className={portfolioStyles.assetBelow}>
              <div className={portfolioStyles.assetBelowItem}>
                <span className={portfolioStyles.assetLabel}>투자 금액</span>
                <p className={portfolioStyles.assetValue}>{formatKorean(totalHolding)}원</p>
              </div>
              <div className={portfolioStyles.assetBelowItem}>
                <span className={portfolioStyles.assetLabel}>잔여 금액</span>
                <p className={portfolioStyles.assetValue}>{formatKorean(bal)}원</p>
              </div>
              <div className={portfolioStyles.assetBelowItem}>
                <span className={portfolioStyles.assetLabel}>총 자산</span>
                <p className={portfolioStyles.assetValueLarge}>{formatKorean(totalAsset)}원</p>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Mission 섹션 */}
      <div className={styles.missionSection}>
        <div className={styles.missionHeader}>
          <h2 className={styles.missionTitle}>{showRanking ? '하고잡이 미션 랭킹' : '하고잡이 미션'}</h2>
          <button className={showRanking ? styles.missionToggleLink : styles.rankingLink} onClick={() => setShowRanking(!showRanking)}>
            {showRanking ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                </svg>
                전체 미션 보기
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 20h20v2H2v-2zm2-7h3v6H4v-6zm5-4h3v10H9V9zm5-4h3v14h-3V5zm5-4h3v18h-3V1z" />
                </svg>
                랭킹 보기
              </>
            )}
          </button>
        </div>

        {!showRanking ? (
          <>
            <p className={styles.missionSubtitle}>부스를 돌아다니며 아래의 미션을 수행하세요!</p>
            <div className={styles.badgeGrid}>
              {row1.map((mission: Mission, i: number) => (
                <button
                  key={mission.id}
                  className={`${styles.badgeCell} stagger-item`}
                  style={{ animationDelay: `${i * 0.04}s` }}
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
                  style={{ animationDelay: `${(i + 3) * 0.04}s` }}
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
          <>
            <p className={styles.missionSubtitle}>1등에겐 특별한 상품이!</p>
          <div className={styles.rankingInline}>
            {!stockRankingEnabled ? (
              <div className={badgeStyles.rankEmpty}>
                <div className={badgeStyles.rankEmptyIcon}>🔒</div>
                <p className={badgeStyles.rankEmptyText}>
                  현재 랭킹이 비공개 상태입니다<br />
                  랭킹 공개 시간까지 조금만 기다려주세요!
                </p>
              </div>
            ) : (
            <>
            {/* 미션 필터 바 */}
            <div className={badgeStyles.filterBar}>
              {missions.filter((m: Mission) => ['dream', 'again', 'sincere'].includes(m.id)).map((m: Mission) => (
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
                  <p className={badgeStyles.myRankName}>{userName ? `${userName}님` : '-'}</p>
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
                        style={{ animationDelay: `${i * 0.08}s` }}
                      >
                        <div className={badgeStyles.podiumRankBadge}>
                          <RankBadgeLabel rank={item.rank} />
                        </div>
                        <div className={badgeStyles.podiumAvatar}>
                          {item.name.charAt(0)}
                        </div>
                        <p className={badgeStyles.podiumName}>{item.name}님{item.company ? ` · ${item.company}` : ''}</p>
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
                        style={{ animationDelay: `${(i + 3) * 0.03}s` }}
                      >
                        <span className={badgeStyles.rankListNum}>{item.rank}</span>
                        <div className={badgeStyles.rankListAvatar}>
                          {item.name.charAt(0)}
                        </div>
                        <div className={badgeStyles.rankListInfo}>
                          <p className={badgeStyles.rankListName}>{item.name}님{item.company ? ` · ${item.company}` : ''}</p>
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
            </>
            )}
          </div>
          </>
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
            <p className={badgeStyles.sheetDesc}>
              {freshMission.description}
            </p>

            {freshMission.target != null && (
              <ProgressBar
                progress={freshMission.progress ?? 0}
                target={freshMission.target}
              />
            )}

            {QUANTITATIVE_IDS.has(freshMission.id) && (
              <p className={badgeStyles.sheetCount}>
                {freshMission.id === 'again' ? '현재 방문자 수' : '현재 횟수'}: <strong>{freshMission.progress ?? 0}{MISSION_UNIT[freshMission.id] || ''}</strong>
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
            {/* <p className={badgeStyles.successMissionDesc}>
              {freshMission?.description}
            </p> */}
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
