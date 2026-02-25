import { useState, useEffect } from 'react'
import { visitApi } from '../api'
import { useMissions } from '../components/MissionContext'
import type { BoothVisitResponse } from '../types'
import styles from './MyPage.module.css'

export default function MyPage() {
  const userName = localStorage.getItem('userName') || ''
  const [activeTab, setActiveTab] = useState<'visits' | 'tickets'>('visits')
  const [visits, setVisits] = useState<BoothVisitResponse[]>([])
  const [visitsLoaded, setVisitsLoaded] = useState(false)
  const { missions } = useMissions()

  useEffect(() => {
    if (activeTab === 'visits' && !visitsLoaded) {
      visitApi.getMyVisits().then(res => {
        setVisits(res.data)
        setVisitsLoaded(true)
      }).catch(() => setVisitsLoaded(true))
    }
  }, [activeTab, visitsLoaded])

  const completedMissions = missions.filter(m => m.isCompleted)
  const ticketCount = completedMissions.length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>마이페이지</h2>
        <p className={styles.subtitle}>{userName}님, 안녕하세요</p>
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
    </div>
  )
}
