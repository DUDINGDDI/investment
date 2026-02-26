import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { visitApi, userApi, stockApi, missionApi } from '../api'
import { useMissions, type Mission } from '../components/MissionContext'
import type { BoothVisitResponse, MyBoothVisitorResponse, StockBoothResponse, MissionRankingItem } from '../types'
import styles from './MyPage.module.css'
import badgeStyles from './BadgePage.module.css'

/* ── BadgePage 헬퍼 컴포넌트 (인라인) ── */

function BadgeImage({ mission, size = 'normal' }: { mission: Mission; size?: 'normal' | 'large' }) {
  const unlocked = mission.isCompleted
  const sizeClass = size === 'large' ? badgeStyles.hexLarge : ''
  return (
    <div className={`${badgeStyles.hexWrap} ${unlocked ? badgeStyles.hexUnlocked : badgeStyles.hexLocked} ${sizeClass}`}>
      <img src={mission.icon} alt={mission.title} className={badgeStyles.badgeImg} draggable={false} />
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

const QUANTITATIVE_IDS = new Set(['renew', 'dream', 'again', 'sincere'])
const MISSION_UNIT: Record<string, string> = { renew: '회', dream: '회', again: '명', sincere: '회' }

function MiniProgressBar({ mission }: { mission: Mission }) {
  const progress = mission.progress ?? 0
  const target = mission.target ?? 1
  const pct = Math.min((progress / target) * 100, 100)
  const unit = MISSION_UNIT[mission.id] || ''
  return (
    <div className={badgeStyles.miniProgressGroup}>
      <span className={`${badgeStyles.miniProgressLabel} ${mission.isCompleted ? badgeStyles.miniProgressLabelComplete : ''}`}>
        {QUANTITATIVE_IDS.has(mission.id) ? `${progress}/${target}${unit}` : mission.isCompleted ? '완료' : `${Math.round(pct)}%`}
      </span>
      <div className={badgeStyles.miniProgressTrack}>
        <div className={`${badgeStyles.miniProgressFill} ${mission.isCompleted ? badgeStyles.miniProgressComplete : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
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
  if (change > 0) return <span className={badgeStyles.rankUp}>▲{change}</span>
  return <span className={badgeStyles.rankDown}>▼{Math.abs(change)}</span>
}

export default function MyPage() {
  const navigate = useNavigate()
  const userName = sessionStorage.getItem('userName') || ''
  const userCompany = sessionStorage.getItem('userCompany') || ''
  const [activeTab, setActiveTab] = useState<'booths' | 'missions' | 'tickets' | 'memos'>('booths')
  const [visits, setVisits] = useState<BoothVisitResponse[]>([])
  const [visitsLoaded, setVisitsLoaded] = useState(false)
  const [boothVisitors, setBoothVisitors] = useState<MyBoothVisitorResponse | null>(null)
  const [boothVisitorsLoaded, setBoothVisitorsLoaded] = useState(false)
  const { missions, syncFromServer } = useMissions()
  const [memos, setMemos] = useState<{ boothId: number; boothName: string; logoEmoji: string; memo: string }[]>([])
  const [memosLoaded, setMemosLoaded] = useState(false)

  // 배지(미션) 탭 상태
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showRanking, setShowRanking] = useState(false)

  // 랭킹 상태
  const [selectedFilter, setSelectedFilter] = useState('renew')
  const [rankings, setRankings] = useState<MissionRankingItem[]>([])
  const [myRanking, setMyRanking] = useState<MissionRankingItem | null>(null)
  const [rankingLoading, setRankingLoading] = useState(false)

  // 부스 탭: 방문부스 + 우리부스 데이터 동시 로드
  useEffect(() => {
    if (activeTab === 'booths') {
      if (!visitsLoaded) {
        visitApi.getMyVisits().then((res: { data: BoothVisitResponse[] }) => {
          setVisits(res.data)
          setVisitsLoaded(true)
        }).catch(() => setVisitsLoaded(true))
      }
      if (!boothVisitorsLoaded) {
        userApi.getMyBoothVisitors().then((res: { data: MyBoothVisitorResponse }) => {
          setBoothVisitors(res.data)
          setBoothVisitorsLoaded(true)
        }).catch(() => setBoothVisitorsLoaded(true))
      }
    }
  }, [activeTab, visitsLoaded, boothVisitorsLoaded])

  useEffect(() => {
    if (activeTab === 'memos' && !memosLoaded) {
      stockApi.getBooths().then(res => {
        const boothList: StockBoothResponse[] = res.data
        const memoList = boothList
          .map(b => {
            const memo = localStorage.getItem(`stock_memo_${b.id}`) || ''
            return { boothId: b.id, boothName: b.name, logoEmoji: b.logoEmoji, memo }
          })
          .filter(m => m.memo)
        setMemos(memoList)
        setMemosLoaded(true)
      }).catch(() => setMemosLoaded(true))
    }
  }, [activeTab, memosLoaded])

  // 미션 탭 진입 시 서버 동기화
  useEffect(() => {
    if (activeTab === 'missions') {
      syncFromServer()
    }
  }, [activeTab, syncFromServer])

  // 랭킹 데이터 로드
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

  // 배지 탭 핸들러
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

  const freshMission = selectedMission
    ? missions.find((m: Mission) => m.id === selectedMission.id) ?? selectedMission
    : null

  const completedCount = missions.filter((m: Mission) => m.isCompleted).length
  const row1 = missions.slice(0, 3)
  const row2 = missions.slice(3, 6)

  const currentFilterMission = missions.find((m: Mission) => m.id === selectedFilter)
  const currentUnit = MISSION_UNIT[selectedFilter] || ''
  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  const [qrMission, setQrMission] = useState<Mission | null>(null)

  // 이벤트존 이용권 대상 미션 (result 제외, 5개)
  const TICKET_MISSIONS = ['renew', 'dream', 'again', 'sincere', 'together']
  const TICKET_IMAGE_MAP: Record<string, { normal: string; complete: string; label: string }> = {
    renew: { normal: '/image/ticket/new.png', complete: '/image/ticket/new_complete.png', label: '내일더 새롭게' },
    dream: { normal: '/image/ticket/dream.png', complete: '/image/ticket/dream_complete.png', label: '꿈을 원대하게' },
    again: { normal: '/image/ticket/retry.png', complete: '/image/ticket/retry_complete.png', label: '안돼도 다시' },
    sincere: { normal: '/image/ticket/truth.png', complete: '/image/ticket/truth_complete.png', label: '진정성 있게' },
    together: { normal: '/image/ticket/together.png', complete: '/image/ticket/together_complete.png', label: '함께하는 하고잡이' },
  }
  const ticketMissions = missions.filter((m: Mission) => TICKET_MISSIONS.includes(m.id) && m.isCompleted)
  const ticketCount = ticketMissions.length
  const userId = sessionStorage.getItem('userId') || ''

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userName')
    sessionStorage.removeItem('userCompany')
    navigate('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>마이페이지</h2>
        <p className={styles.subtitle}>{userCompany ? `${userCompany} · ` : ''}{userName}님, 안녕하세요</p>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'booths' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('booths')}
        >
          부스
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'missions' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          미션
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tickets' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          이벤트존<br />이용권
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'memos' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('memos')}
        >
          메모
        </button>
      </div>

      {/* 부스 탭: 우리 부스(소속) + 방문 부스 통합 */}
      {activeTab === 'booths' && (
        <>
          {/* 소속 부스 섹션 */}
          {boothVisitors && boothVisitors.boothId ? (
            <div className={styles.myBoothSection}>
              <div className={styles.myBoothCard}>
                <div className={styles.myBoothLeft}>
                  <div className={styles.myBoothIconLarge}>
                    <span>{boothVisitors.logoEmoji}</span>
                  </div>
                  <div>
                    <p className={styles.myBoothLabel}>내 소속 부스</p>
                    <p className={styles.myBoothNameInline}>{boothVisitors.boothName}</p>
                  </div>
                </div>
                <div className={styles.myBoothRight}>
                  <p className={styles.myBoothVisitorCount}>{boothVisitors.visitorCount}</p>
                  <p className={styles.myBoothVisitorLabel}>방문자</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* 방문 부스 섹션 */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>방문한 부스</span>
            <span className={styles.sectionCount}>{visits.length}곳</span>
          </div>
          {visits.length > 0 ? (
            <div className={styles.list}>
              {visits.map((v, i) => (
                <div
                  key={`${v.boothId}-${v.visitedAt}`}
                  className={`${styles.card} stagger-item`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/stocks/booths/${v.boothId}`)}
                >
                  <div className={styles.cardIcon}>
                    <span>{v.logoEmoji}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardName}>{v.boothName}</p>
                    <p className={styles.cardSub}>{new Date(v.visitedAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📍</span>
              <p className={styles.emptyText}>아직 방문한 부스가 없습니다</p>
            </div>
          )}
        </>
      )}

      {/* 미션 탭 */}
      {activeTab === 'missions' && (
        <>
          {!showRanking ? (
            <>
              {/* BADGES 뷰 */}
              <div className={styles.missionTabHeader}>
                <p className={styles.badgeCount}>{completedCount} / {missions.length} 완료</p>
                <button className={styles.rankingBtn} onClick={() => setShowRanking(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15L8.5 21L6.5 17L2 17.5L5 12.5M12 15L15.5 21L17.5 17L22 17.5L19 12.5M12 15L12 3M8 6L12 3L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  랭킹
                </button>
              </div>

              <div className={badgeStyles.section}>
                <div className={badgeStyles.badgeRow}>
                  {row1.map((mission: Mission, i: number) => (
                    <button
                      key={mission.id}
                      className={`${badgeStyles.badgeCell} stagger-item`}
                      style={{ animationDelay: `${i * 0.08}s` }}
                      onClick={() => handleBadgeTap(mission)}
                    >
                      <div className={badgeStyles.badgeWrap}>
                        <BadgeImage mission={mission} />
                        <MiniProgressBar mission={mission} />
                      </div>
                      <span className={badgeStyles.chip}>{mission.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={badgeStyles.section}>
                <div className={badgeStyles.badgeRow}>
                  {row2.map((mission: Mission, i: number) => (
                    <button
                      key={mission.id}
                      className={`${badgeStyles.badgeCell} stagger-item`}
                      style={{ animationDelay: `${(i + 3) * 0.08}s` }}
                      onClick={() => handleBadgeTap(mission)}
                    >
                      <div className={badgeStyles.badgeWrap}>
                        <BadgeImage mission={mission} />
                        <MiniProgressBar mission={mission} />
                      </div>
                      <span className={badgeStyles.chip}>{mission.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* RANKING 뷰 */}
              <div className={styles.missionTabHeader}>
                <button className={styles.rankingBackBtn} onClick={() => setShowRanking(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  배지
                </button>
              </div>

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
                <h3 className={badgeStyles.rankingTitle}>미션 랭킹</h3>
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
                  {/* 포디움 (1~3위) */}
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

                  {/* 4위 이하 리스트 */}
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
            </>
          )}
        </>
      )}

      {activeTab === 'tickets' && (
        <>
          <div className={styles.ticketHeader}>
            <span className={styles.ticketHeaderLabel}>보유 이용권</span>
            <span className={styles.ticketHeaderCount}>{ticketCount}장</span>
          </div>

          {ticketMissions.length > 0 ? (
            <div className={styles.ticketGrid}>
              {ticketMissions.map((m: Mission, i: number) => {
                const imgInfo = TICKET_IMAGE_MAP[m.id]
                if (!imgInfo) return null
                const isUsed = m.isUsed
                const imgSrc = isUsed ? imgInfo.complete : imgInfo.normal
                return (
                  <div
                    key={m.id}
                    className={`${styles.ticketImageCard} ${isUsed ? styles.ticketUsedCard : ''} stagger-item`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onClick={() => !isUsed && setQrMission(m)}
                  >
                    <img
                      src={imgSrc}
                      alt={imgInfo.label}
                      className={styles.ticketFullImg}
                    />
                    {isUsed && (
                      <div className={styles.ticketUsedOverlay}>
                        <span className={styles.ticketUsedStamp}>사용완료</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎟️</span>
              <p className={styles.emptyText}>미션을 완료하면 이용권이 발급됩니다</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'memos' && (
        <>
          {memos.length > 0 ? (
            <div className={styles.memoList}>
              {memos.map((m: { boothId: number; boothName: string; logoEmoji: string; memo: string }, i: number) => (
                <div
                  key={m.boothId}
                  className={`${styles.memoCard} stagger-item`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/stocks/booths/${m.boothId}`)}
                >
                  <div className={styles.memoCardHeader}>
                    <div className={styles.cardIcon}>
                      <span>{m.logoEmoji}</span>
                    </div>
                    <p className={styles.cardName}>{m.boothName}</p>
                  </div>
                  <p className={styles.memoText}>{m.memo}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📝</span>
              <p className={styles.emptyText}>작성한 메모가 없습니다</p>
            </div>
          )}
        </>
      )}

      {/* 로그아웃 버튼 - 하단 고정 */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <span className={styles.logoutText}>로그아웃</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 17L21 12L16 7" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12H9" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {qrMission && (
        <div className={styles.qrOverlay} onClick={() => { setQrMission(null); syncFromServer() }}>
          <div className={styles.qrModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.qrTitle}>{qrMission.title}</h3>
            <p className={styles.qrSubtitle}>이벤트존 이용권</p>
            <div className={styles.qrCode}>
              <QRCodeSVG
                value={`ticket:${userId}:${qrMission.id}`}
                size={200}
                level="M"
              />
            </div>
            <p className={styles.qrGuide}>관리자에게 이 QR 코드를 보여주세요</p>
            <button className={styles.qrClose} onClick={() => { setQrMission(null); syncFromServer() }}>
              닫기
            </button>
          </div>
        </div>
      )}

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
