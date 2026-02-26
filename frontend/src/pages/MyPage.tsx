import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { visitApi, userApi, stockApi } from '../api'
import { useMissions } from '../components/MissionContext'
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
  const { missions } = useMissions()
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

  const completedMissions = missions.filter(m => m.isCompleted)
  const ticketCount = completedMissions.length

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
          이벤트존 이용권
          {ticketCount > 0 && <span className={styles.ticketBadge}>{ticketCount}</span>}
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
          <div className={styles.ticketSummary}>
            <p className={styles.ticketCount}>{ticketCount}장</p>
            <p className={styles.ticketLabel}>보유 이용권</p>
          </div>

          {completedMissions.length > 0 ? (
            <div className={styles.list}>
              {completedMissions.map((m, i) => (
                <div
                  key={m.id}
                  className={`${styles.ticketCard} stagger-item`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className={styles.ticketIcon}>
                    <img src={m.icon} alt={m.title} className={styles.ticketImg} />
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardName}>{m.title}</p>
                    <p className={styles.cardSub}>미션 완료 보상</p>
                  </div>
                  <span className={styles.ticketTag}>이용권 1장</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎟️</span>
              <p className={styles.emptyText}>
                미션을 완료하면 이벤트존 이용권이 자동 부여됩니다
              </p>
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
    </div>
  )
}
