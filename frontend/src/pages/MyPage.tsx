import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { boothApi, stockApi } from '../api'
import type { MyStockBoothVisitorResponse } from '../types'
import { useMissions, type Mission } from '../components/MissionContext'
import type { StockBoothResponse } from '../types'
import styles from './MyPage.module.css'

const TICKET_MISSIONS = ['renew', 'dream', 'again', 'sincere', 'together']
const TICKET_IMAGE_MAP: Record<string, { normal: string; complete: string; label: string }> = {
  renew: { normal: '/image/ticket/renew.svg', complete: '/image/ticket/renew_complete.svg', label: '내일더 새롭게' },
  dream: { normal: '/image/ticket/dream.svg', complete: '/image/ticket/dream_complete.svg', label: '꿈을 원대하게' },
  again: { normal: '/image/ticket/retry.svg', complete: '/image/ticket/retry_complete.svg', label: '안돼도 다시' },
  sincere: { normal: '/image/ticket/truth.svg', complete: '/image/ticket/truth_complete.svg', label: '진정성 있게' },
  together: { normal: '/image/ticket/together.svg', complete: '/image/ticket/together_complete.svg', label: '함께하는 하고잡이' },
}

export default function MyPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userName = localStorage.getItem('userName') || ''
  const userCompany = localStorage.getItem('userCompany') || ''
  const userId = localStorage.getItem('userId') || ''
  const [activeTab, setActiveTab] = useState<'tickets' | 'memos'>(searchParams.get('tab') === 'memos' ? 'memos' : 'tickets')
  const { missions, syncFromServer } = useMissions()
  const [boothVisitors, setBoothVisitors] = useState<MyStockBoothVisitorResponse | null>(null)
  const [memoSubTab, setMemoSubTab] = useState<'pm' | 'am'>('am')
  const [pmMemos, setPmMemos] = useState<{ boothId: number; boothName: string; memo: string }[]>([])
  const [pmMemosLoaded, setPmMemosLoaded] = useState(false)
  const [amMemos, setAmMemos] = useState<{ boothId: number; boothName: string; memo: string }[]>([])
  const [amMemosLoaded, setAmMemosLoaded] = useState(false)
  const [qrMission, setQrMission] = useState<Mission | null>(null)
  const [showPhotoQr, setShowPhotoQr] = useState(false)
  const [showAllQr, setShowAllQr] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [memoPage, setMemoPage] = useState(0)
  const PAGE_SIZE = 10

  // 나의 부스 로드
  useEffect(() => {
    stockApi.getMyBoothVisitors().then((res: { data: MyStockBoothVisitorResponse | null }) => {
      setBoothVisitors(res.data ?? null)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'memos' && memoSubTab === 'pm' && !pmMemosLoaded) {
      boothApi.getAllMemos().then(res => {
        const memoList = res.data.map(m => ({
          boothId: m.boothId,
          boothName: m.boothName,
          memo: m.content,
        }))
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
  const completedCount = missions.filter((m: Mission) => m.isCompleted).length
  const hasPhotoTicket = completedCount >= 3
  const ticketCount = ticketMissions.length + (hasPhotoTicket ? 1 : 0)
  const unusedTicketCount = ticketMissions.filter((m: Mission) => !m.isUsed).length

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
        <p className={styles.subtitle}>{userCompany ? `${userCompany} ` : ''}<span className={styles.userName}>{userName}</span>님</p>
      </div>

      {/* <div className={styles.reportBanner} onClick={() => navigate('/report')}>
        <span className={styles.reportBannerIcon}>📊</span>
        <div className={styles.reportBannerText}>
          <p className={styles.reportBannerTitle}>나의 투자 성향 리포트</p>
          <p className={styles.reportBannerSub}>나의 투자 스타일을 분석해보세요</p>
        </div>
        <span className={styles.reportBannerArrow}>›</span>
      </div> */}

      {boothVisitors && (
        <div className={styles.myBoothSection}>
          <div className={styles.myBoothCard}>
            <div className={styles.myBoothLeft}>
              <div>
                <p className={styles.myBoothLabel}>나의 부스</p>
                <p className={styles.myBoothNameInline}>{boothVisitors.boothName}</p>
              </div>
            </div>
            <div className={styles.myBoothRight}>
              <p className={styles.myBoothVisitorCount}>{boothVisitors.visitorCount}</p>
              <p className={styles.myBoothVisitorLabel}>방문자 수</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabsChip}>
        <button
          className={`${styles.chipTab} ${activeTab === 'tickets' ? styles.chipActive : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          티켓
        </button>
        <button
          className={`${styles.chipTab} ${activeTab === 'memos' ? styles.chipActive : ''}`}
          onClick={() => setActiveTab('memos')}
        >
          메모
        </button>
      </div>

      {activeTab === 'tickets' && (
        <>
          <div className={styles.ticketHeader}>
            <div className={styles.ticketHeaderLeft}>
              <span className={styles.ticketHeaderLabel}>보유 티켓</span>
              <span className={styles.ticketHeaderCount}>{ticketCount}장</span>
            </div>
            {unusedTicketCount > 0 && (
              <button className={styles.useAllBtn} onClick={() => setShowAllQr(true)}>
                키캡 교환권 전부 사용 ({unusedTicketCount})
              </button>
            )}
          </div>

          {!hasPhotoTicket && ticketMissions.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎟️</span>
              <p className={styles.emptyText}>미션을 완료하면 티켓 발급됩니다</p>
            </div>
          ) : (
            <div className={styles.ticketGrid}>
              {hasPhotoTicket && (
                <div
                  className={`${styles.ticketImageCard} stagger-item`}
                  style={{ animationDelay: '0s' }}
                >
                  <img src="/image/ticket/photo.svg" alt="AI 포토네컷" className={styles.ticketFullImg} />
                </div>
              )}
              {ticketMissions.map((m: Mission, i: number) => {
                const imgInfo = TICKET_IMAGE_MAP[m.id]
                if (!imgInfo) return null
                const imgSrc = m.isUsed ? imgInfo.complete : imgInfo.normal
                return (
                  <div
                    key={m.id}
                    className={`${styles.ticketImageCard} ${m.isUsed ? styles.ticketUsedCard : ''} stagger-item`}
                    style={{ animationDelay: `${(i + (hasPhotoTicket ? 1 : 0)) * 0.03}s` }}
                    onClick={() => !m.isUsed && setQrMission(m)}
                  >
                    <img src={imgSrc} alt={imgInfo.label} className={styles.ticketFullImg} />
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'memos' && (
        <>
          <div className={styles.memoSubTabRow}>
            <button
              className={`${styles.memoSubTab} ${memoSubTab === 'am' ? styles.memoSubTabActive : ''}`}
              onClick={() => { setMemoSubTab('am'); setMemoPage(0) }}
            >
              하고잡이 투자
            </button>
            <button
              className={`${styles.memoSubTab} ${memoSubTab === 'pm' ? styles.memoSubTabActive : ''}`}
              onClick={() => { setMemoSubTab('pm'); setMemoPage(0) }}
            >
              대표작 투자
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
                      style={{ animationDelay: `${i * 0.02}s` }}
                      onClick={() => navigate(`${detailPath}/${m.boothId}?memo=open`, { state: { from: 'memo' } })}
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
        <div className={styles.qrOverlay} onClick={() => { setQrMission(null); syncFromServer() }}>
          <div className={styles.qrModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.qrTitle}>{qrMission.title}</h3>
            <p className={styles.qrSubtitle}>
              이벤트존 티켓
            </p>
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

      {showPhotoQr && (
        <div className={styles.qrOverlay} onClick={() => setShowPhotoQr(false)}>
          <div className={styles.qrModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.qrTitle}>AI 포토네컷</h3>
            <p className={styles.qrSubtitle}>
              영구 티켓
            </p>
            <div className={styles.qrCode}>
              <QRCodeSVG
                value={`photo:${userId}`}
                size={200}
                level="M"
              />
            </div>
            <p className={styles.qrGuide}>관리자에게 이 QR 코드를 보여주세요</p>
            <button className={styles.qrClose} onClick={() => setShowPhotoQr(false)}>
              닫기
            </button>
          </div>
        </div>
      )}

      {showAllQr && (
        <div className={styles.qrOverlay} onClick={() => { setShowAllQr(false); syncFromServer() }}>
          <div className={styles.qrModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.qrTitle}>모든 티켓 사용</h3>
            <p className={styles.qrSubtitle}>
              키캡 교환권 {unusedTicketCount}장을 전부 사용합니다
            </p>
            <div className={styles.qrCode}>
              <QRCodeSVG
                value={`ticket-all:${userId}`}
                size={200}
                level="M"
              />
            </div>
            <p className={styles.qrGuide}>관리자에게 이 QR 코드를 보여주세요</p>
            <button className={styles.qrClose} onClick={() => { setShowAllQr(false); syncFromServer() }}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
