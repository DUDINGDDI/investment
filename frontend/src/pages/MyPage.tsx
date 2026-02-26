import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { visitApi, userApi, stockApi } from '../api'
import { useMissions, type Mission } from '../components/MissionContext'
import type { BoothVisitResponse, MyBoothVisitorResponse, StockBoothResponse } from '../types'
import styles from './MyPage.module.css'

export default function MyPage() {
  const navigate = useNavigate()
  const userName = sessionStorage.getItem('userName') || ''
  const userCompany = sessionStorage.getItem('userCompany') || ''
  const [activeTab, setActiveTab] = useState<'visits' | 'tickets' | 'mybooth' | 'memos'>('visits')
  const [visits, setVisits] = useState<BoothVisitResponse[]>([])
  const [visitsLoaded, setVisitsLoaded] = useState(false)
  const [boothVisitors, setBoothVisitors] = useState<MyBoothVisitorResponse | null>(null)
  const [boothVisitorsLoaded, setBoothVisitorsLoaded] = useState(false)
  const { missions, syncFromServer } = useMissions()
  const [memos, setMemos] = useState<{ boothId: number; boothName: string; logoEmoji: string; memo: string }[]>([])
  const [memosLoaded, setMemosLoaded] = useState(false)

  useEffect(() => {
    if (activeTab === 'visits' && !visitsLoaded) {
      visitApi.getMyVisits().then(res => {
        setVisits(res.data)
        setVisitsLoaded(true)
      }).catch(() => setVisitsLoaded(true))
    }
  }, [activeTab, visitsLoaded])

  useEffect(() => {
    if (activeTab === 'mybooth' && !boothVisitorsLoaded) {
      userApi.getMyBoothVisitors().then(res => {
        setBoothVisitors(res.data)
        setBoothVisitorsLoaded(true)
      }).catch(() => setBoothVisitorsLoaded(true))
    }
  }, [activeTab, boothVisitorsLoaded])

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>마이페이지</h2>
        <p className={styles.subtitle}>{userCompany ? `${userCompany} · ` : ''}{userName}님, 안녕하세요</p>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'visits' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          방문 부스
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
        <button
          className={`${styles.tab} ${activeTab === 'mybooth' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('mybooth')}
        >
          우리 부스
        </button>
      </div>

      {activeTab === 'visits' && (
        <>
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
              {memos.map((m, i) => (
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

      {activeTab === 'mybooth' && (
        <>
          {boothVisitors && boothVisitors.boothId ? (
            <>
              <div className={styles.myBoothInfo}>
                <div className={styles.myBoothIcon}>
                  <span>{boothVisitors.logoEmoji}</span>
                </div>
                <p className={styles.myBoothName}>{boothVisitors.boothName}</p>
              </div>
              <div className={styles.visitorSummary}>
                <p className={styles.visitorCount}>{boothVisitors.visitorCount}명</p>
                <p className={styles.visitorLabel}>총 방문자 수</p>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🏢</span>
              <p className={styles.emptyText}>소속된 부스가 없습니다</p>
            </div>
          )}
        </>
      )}

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
