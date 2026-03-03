import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { visitApi, userApi, boothApi, stockApi, missionApi } from '../api'
import type { UserMissionResponse } from '../types'
import { useMissions, type Mission } from '../components/MissionContext'
import type { BoothResponse, BoothVisitResponse, MyBoothVisitorResponse, StockBoothResponse } from '../types'
import styles from './MyPage.module.css'

const TICKET_MISSIONS = ['renew', 'dream', 'again', 'sincere', 'together']
const PHOTO_MISSIONS = ['photo_0', 'photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5']
const PHOTO_TOTAL = 6
const TICKET_IMAGE_MAP: Record<string, { normal: string; complete: string; label: string }> = {
  renew: { normal: '/image/ticket/renew.svg', complete: '/image/ticket/renew_complete.svg', label: '내일더 새롭게' },
  dream: { normal: '/image/ticket/dream.svg', complete: '/image/ticket/dream_complete.svg', label: '꿈을 원대하게' },
  again: { normal: '/image/ticket/retry.svg', complete: '/image/ticket/retry_complete.svg', label: '안돼도 다시' },
  sincere: { normal: '/image/ticket/truth.svg', complete: '/image/ticket/truth_complete.svg', label: '진정성 있게' },
  together: { normal: '/image/ticket/together.svg', complete: '/image/ticket/together_complete.svg', label: '함께하는 하고잡이' },
}

export default function MyPage() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''
  const userCompany = localStorage.getItem('userCompany') || ''
  const userId = localStorage.getItem('userId') || ''
  const [activeTab, setActiveTab] = useState<'booths' | 'tickets' | 'memos'>('booths')
  const [visits, setVisits] = useState<BoothVisitResponse[]>([])
  const [visitsLoaded, setVisitsLoaded] = useState(false)
  const [boothVisitors, setBoothVisitors] = useState<MyBoothVisitorResponse | null>(null)
  const [boothVisitorsLoaded, setBoothVisitorsLoaded] = useState(false)
  const { missions, syncFromServer } = useMissions()
  const [memoSubTab, setMemoSubTab] = useState<'pm' | 'am'>('am')
  const [pmMemos, setPmMemos] = useState<{ boothId: number; boothName: string; memo: string }[]>([])
  const [pmMemosLoaded, setPmMemosLoaded] = useState(false)
  const [amMemos, setAmMemos] = useState<{ boothId: number; boothName: string; memo: string }[]>([])
  const [amMemosLoaded, setAmMemosLoaded] = useState(false)
  const [qrMission, setQrMission] = useState<Mission | null>(null)
  const [photoMissions, setPhotoMissions] = useState<UserMissionResponse[]>([])
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [visitPage, setVisitPage] = useState(0)
  const [memoPage, setMemoPage] = useState(0)
  const PAGE_SIZE = 10

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

  // 이용권 탭: 포토 미션 데이터 로드
  useEffect(() => {
    if (activeTab === 'tickets' && !photoLoaded) {
      missionApi.getMyMissions().then(res => {
        setPhotoMissions(res.data.filter((m: UserMissionResponse) => PHOTO_MISSIONS.includes(m.missionId)))
        setPhotoLoaded(true)
      }).catch(() => setPhotoLoaded(true))
    }
  }, [activeTab, photoLoaded])

  useEffect(() => {
    if (activeTab === 'memos' && memoSubTab === 'pm' && !pmMemosLoaded) {
      boothApi.getAll().then(res => {
        const boothList: BoothResponse[] = res.data
        const memoList = boothList
          .map(b => {
            const memo = localStorage.getItem(`booth_memo_${b.id}`) || ''
            return { boothId: b.id, boothName: b.name, memo }
          })
          .filter(m => m.memo)
        setPmMemos(memoList)
        setPmMemosLoaded(true)
      }).catch(() => setPmMemosLoaded(true))
    }
    if (activeTab === 'memos' && memoSubTab === 'am' && !amMemosLoaded) {
      stockApi.getBooths().then(res => {
        const boothList: StockBoothResponse[] = res.data
        const memoList = boothList
          .map(b => {
            const memo = localStorage.getItem(`stock_memo_${b.id}`) || ''
            return { boothId: b.id, boothName: b.name, memo }
          })
          .filter(m => m.memo)
        setAmMemos(memoList)
        setAmMemosLoaded(true)
      }).catch(() => setAmMemosLoaded(true))
    }
  }, [activeTab, memoSubTab, pmMemosLoaded, amMemosLoaded])

  const ticketMissions = missions
    .filter((m: Mission) => TICKET_MISSIONS.includes(m.id) && m.isCompleted)
    .sort((a, b) => Number(a.isUsed ?? false) - Number(b.isUsed ?? false))
  const ticketCount = ticketMissions.length

  // 포토 교환권 계산
  const photoCompleted = photoMissions.filter(m => m.isCompleted).length
  const photoUsed = photoMissions.filter(m => m.isUsed).length
  const photoRemaining = photoCompleted - photoUsed
  const nextAvailablePhoto = photoMissions.find(m => m.isCompleted && !m.isUsed)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userCompany')
    navigate('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>마이페이지</h2>
          <button className={styles.logoutBtn} onClick={() => setLogoutOpen(true)}>
            <span className={styles.logoutText}>로그아웃</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17L21 12L16 7" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12H9" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className={styles.subtitle}>{userCompany ? `${userCompany} · ` : ''}{userName}님, 안녕하세요</p>
      </div>

      <div className={styles.reportBanner} onClick={() => navigate('/report')}>
        <span className={styles.reportBannerIcon}>📊</span>
        <div className={styles.reportBannerText}>
          <p className={styles.reportBannerTitle}>나의 투자 성향 리포트</p>
          <p className={styles.reportBannerSub}>나의 투자 스타일을 분석해보세요</p>
        </div>
        <span className={styles.reportBannerArrow}>›</span>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'booths' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('booths')}
        >
          부스
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
                  <div>
                    <p className={styles.myBoothLabel}>내 소속 부스</p>
                    <p className={styles.myBoothNameInline}>{boothVisitors.boothName}</p>
                  </div>
                </div>
                <div className={styles.myBoothRight}>
                  <p className={styles.myBoothVisitorCount}>{boothVisitors.visitorCount}명</p>
                  <p className={styles.myBoothVisitorLabel}>현 시각 방문자</p>
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
            <>
              <div className={styles.list}>
                {visits.slice(visitPage * PAGE_SIZE, (visitPage + 1) * PAGE_SIZE).map((v, i) => (
                  <div
                    key={`${v.boothId}-${v.visitedAt}`}
                    className={`${styles.card} stagger-item`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => navigate(`/stocks/booths/${v.boothId}`)}
                  >
                    <div className={styles.cardBody}>
                      <p className={styles.cardName}>{v.boothName}</p>
                      <p className={styles.cardSub}>{new Date(v.visitedAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={visitPage === 0}
                  onClick={() => setVisitPage(visitPage - 1)}
                >
                  ‹ 이전
                </button>
                <span className={styles.pageInfo}>
                  {visitPage + 1} / {Math.ceil(visits.length / PAGE_SIZE) || 1}
                </span>
                <button
                  className={styles.pageBtn}
                  disabled={(visitPage + 1) * PAGE_SIZE >= visits.length}
                  onClick={() => setVisitPage(visitPage + 1)}
                >
                  다음 ›
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📍</span>
              <p className={styles.emptyText}>아직 방문한 부스가 없습니다</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'tickets' && (
        <>
          <div className={styles.ticketHeader}>
            <span className={styles.ticketHeaderLabel}>보유 이용권</span>
            <span className={styles.ticketHeaderCount}>{ticketCount + photoRemaining}장</span>
          </div>

          {(() => {
            type TicketItem =
              | { kind: 'ticket'; mission: Mission; isUsed: boolean }
              | { kind: 'photo'; isUsed: boolean }

            const items: TicketItem[] = []
            ticketMissions.forEach((m: Mission) => {
              items.push({ kind: 'ticket', mission: m, isUsed: !!m.isUsed })
            })
            if (photoCompleted > 0) {
              items.push({ kind: 'photo', isUsed: photoRemaining === 0 })
            }
            items.sort((a, b) => Number(a.isUsed) - Number(b.isUsed))

            if (items.length === 0) {
              return (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🎟️</span>
                  <p className={styles.emptyText}>미션을 완료하면 이용권이 발급됩니다</p>
                </div>
              )
            }

            return (
              <div className={styles.ticketGrid}>
                {items.map((item, i) => {
                  if (item.kind === 'ticket') {
                    const imgInfo = TICKET_IMAGE_MAP[item.mission.id]
                    if (!imgInfo) return null
                    const imgSrc = item.isUsed ? imgInfo.complete : imgInfo.normal
                    return (
                      <div
                        key={item.mission.id}
                        className={`${styles.ticketImageCard} ${item.isUsed ? styles.ticketUsedCard : ''} stagger-item`}
                        style={{ animationDelay: `${i * 0.06}s` }}
                        onClick={() => !item.isUsed && setQrMission(item.mission)}
                      >
                        <img src={imgSrc} alt={imgInfo.label} className={styles.ticketFullImg} />
                      </div>
                    )
                  }
                  // photo
                  return (
                    <div
                      key="photo"
                      className={`${styles.ticketImageCard} ${item.isUsed ? styles.ticketUsedCard : ''} stagger-item`}
                      style={{ animationDelay: `${i * 0.06}s` }}
                      onClick={() => {
                        if (photoRemaining > 0 && nextAvailablePhoto) {
                          setQrMission({
                            id: nextAvailablePhoto.missionId,
                            title: 'AI 포토 교환권',
                            description: '',
                            isCompleted: true,
                            icon: '/image/ticket/photo.svg',
                          })
                        }
                      }}
                    >
                      <img
                        src={photoRemaining > 0 ? '/image/ticket/photo.svg' : '/image/ticket/photo_complete.svg'}
                        alt="AI 포토 교환권"
                        className={styles.ticketFullImg}
                      />
                      <div className={styles.photoCountOverlay}>
                        <span className={styles.photoCountText}>{photoRemaining}/{PHOTO_TOTAL}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </>
      )}

      {activeTab === 'memos' && (
        <>
          <div className={styles.memoSubTabRow}>
            <button
              className={`${styles.memoSubTab} ${memoSubTab === 'am' ? styles.memoSubTabActive : ''}`}
              onClick={() => { setMemoSubTab('am'); setMemoPage(0) }}
            >
              AM 투자
            </button>
            <button
              className={`${styles.memoSubTab} ${memoSubTab === 'pm' ? styles.memoSubTabActive : ''}`}
              onClick={() => { setMemoSubTab('pm'); setMemoPage(0) }}
            >
              PM 투자
            </button>
          </div>

          {(() => {
            const memos = memoSubTab === 'pm' ? pmMemos : amMemos
            const detailPath = memoSubTab === 'pm' ? '/booths' : '/stocks/booths'
            return memos.length > 0 ? (
              <>
                <div className={styles.memoList}>
                  {memos.slice(memoPage * PAGE_SIZE, (memoPage + 1) * PAGE_SIZE).map((m, i) => (
                    <div
                      key={m.boothId}
                      className={`${styles.memoCard} stagger-item`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                      onClick={() => navigate(`${detailPath}/${m.boothId}?memo=open`)}
                    >
                      <div className={styles.memoCardHeader}>
                        <p className={styles.cardName}>{m.boothName}</p>
                      </div>
                      <p className={styles.memoText}>{m.memo}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={memoPage === 0}
                    onClick={() => setMemoPage(memoPage - 1)}
                  >
                    ‹ 이전
                  </button>
                  <span className={styles.pageInfo}>
                    {memoPage + 1} / {Math.ceil(memos.length / PAGE_SIZE) || 1}
                  </span>
                  <button
                    className={styles.pageBtn}
                    disabled={(memoPage + 1) * PAGE_SIZE >= memos.length}
                    onClick={() => setMemoPage(memoPage + 1)}
                  >
                    다음 ›
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📝</span>
                <p className={styles.emptyText}>작성한 메모가 없습니다</p>
              </div>
            )
          })()}
        </>
      )}

      {logoutOpen && (
        <div className={styles.qrOverlay} onClick={() => setLogoutOpen(false)}>
          <div className={styles.logoutPopup} onClick={e => e.stopPropagation()}>
            <p className={styles.logoutPopupText}>로그아웃 하시겠습니까?</p>
            <div className={styles.logoutPopupBtns}>
              <button className={styles.logoutCancelBtn} onClick={() => setLogoutOpen(false)}>취소</button>
              <button className={styles.logoutConfirmBtn} onClick={handleLogout}>로그아웃</button>
            </div>
          </div>
        </div>
      )}

      {qrMission && (
        <div className={styles.qrOverlay} onClick={() => { setQrMission(null); syncFromServer(); setPhotoLoaded(false) }}>
          <div className={styles.qrModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.qrTitle}>{qrMission.title}</h3>
            <p className={styles.qrSubtitle}>
              {qrMission.id.startsWith('photo_') ? 'AI 포토 교환권' : '이벤트존 이용권'}
            </p>
            <div className={styles.qrCode}>
              <QRCodeSVG
                value={`ticket:${userId}:${qrMission.id}`}
                size={200}
                level="M"
              />
            </div>
            <p className={styles.qrGuide}>관리자에게 이 QR 코드를 보여주세요</p>
            <button className={styles.qrClose} onClick={() => { setQrMission(null); syncFromServer(); setPhotoLoaded(false) }}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
