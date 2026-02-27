import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { visitApi, userApi, stockApi } from '../api'
import { useMissions, type Mission } from '../components/MissionContext'
import type { BoothVisitResponse, MyBoothVisitorResponse, StockBoothResponse } from '../types'
import styles from './MyPage.module.css'

const TICKET_MISSIONS = ['renew', 'dream', 'again', 'sincere', 'together']
const TICKET_IMAGE_MAP: Record<string, { normal: string; complete: string; label: string }> = {
  renew: { normal: '/image/ticket/new.png', complete: '/image/ticket/new_complete.png', label: '내일더 새롭게' },
  dream: { normal: '/image/ticket/dream.png', complete: '/image/ticket/dream_complete.png', label: '꿈을 원대하게' },
  again: { normal: '/image/ticket/retry.png', complete: '/image/ticket/retry_complete.png', label: '안돼도 다시' },
  sincere: { normal: '/image/ticket/truth.png', complete: '/image/ticket/truth_complete.png', label: '진정성 있게' },
  together: { normal: '/image/ticket/together.png', complete: '/image/ticket/together_complete.png', label: '함께하는 하고잡이' },
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
  const [memos, setMemos] = useState<{ boothId: number; boothName: string; memo: string }[]>([])
  const [memosLoaded, setMemosLoaded] = useState(false)
  const [qrMission, setQrMission] = useState<Mission | null>(null)
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

  useEffect(() => {
    if (activeTab === 'memos' && !memosLoaded) {
      stockApi.getBooths().then(res => {
        const boothList: StockBoothResponse[] = res.data
        const memoList = boothList
          .map(b => {
            const memo = localStorage.getItem(`stock_memo_${b.id}`) || ''
            return { boothId: b.id, boothName: b.name, memo }
          })
          .filter(m => m.memo)
        setMemos(memoList)
        setMemosLoaded(true)
      }).catch(() => setMemosLoaded(true))
    }
  }, [activeTab, memosLoaded])

  const ticketMissions = missions.filter((m: Mission) => TICKET_MISSIONS.includes(m.id) && m.isCompleted)
  const ticketCount = ticketMissions.length

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
            <>
              <div className={styles.memoList}>
                {memos.slice(memoPage * PAGE_SIZE, (memoPage + 1) * PAGE_SIZE).map((m: { boothId: number; boothName: string; memo: string }, i: number) => (
                  <div
                    key={m.boothId}
                    className={`${styles.memoCard} stagger-item`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => navigate(`/stocks/booths/${m.boothId}`)}
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
    </div>
  )
}
