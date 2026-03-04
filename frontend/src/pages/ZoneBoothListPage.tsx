import { useParams, useNavigate } from 'react-router-dom'
import PageBackButton from '../components/PageBackButton'
import styles from './ZoneBoothListPage.module.css'

interface ZoneBooth {
  id: number
  name: string
  description: string
}

/** 구역별 부스 데이터 — 실제 데이터로 교체 가능 */
const ZONE_BOOTH_DATA: Record<string, ZoneBooth[]> = {
  // LEADERSHIP CENTER 1F
  '101': [
    { id: 1, name: '부스 A', description: 'A 부스 설명' },
    { id: 2, name: '부스 B', description: 'B 부스 설명' },
  ],
  '102': [
    { id: 3, name: '부스 C', description: 'C 부스 설명' },
    { id: 4, name: '부스 D', description: 'D 부스 설명' },
  ],
  // INNOVATION CENTER LL
  'L01': [
    { id: 5, name: '부스 E', description: 'E 부스 설명' },
  ],
  'L02': [
    { id: 6, name: '부스 F', description: 'F 부스 설명' },
  ],
  // LEADERSHIP CENTER 2F
  '201': [
    { id: 7, name: '부스 G', description: 'G 부스 설명' },
    { id: 8, name: '부스 H', description: 'H 부스 설명' },
  ],
  '202': [
    { id: 9, name: '부스 I', description: 'I 부스 설명' },
  ],
  '203': [
    { id: 10, name: '부스 J', description: 'J 부스 설명' },
  ],
  '204': [
    { id: 11, name: '부스 K', description: 'K 부스 설명' },
  ],
}

export default function ZoneBoothListPage() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const navigate = useNavigate()
  const booths = zoneId ? ZONE_BOOTH_DATA[zoneId] : undefined

  return (
    <div className={styles.container}>
      <PageBackButton to="/map" label="지도" />

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{zoneId} 구역</h2>
          <p className={styles.subtitle}>해당 구역에 위치한 부스 목록</p>
        </div>
      </div>

      {booths && booths.length > 0 ? (
        <div className={styles.list}>
          {booths.map((booth, i) => (
            <div
              key={booth.id}
              className={`${styles.card} stagger-item`}
              style={{ animationDelay: `${i * 0.03}s` }}
              onClick={() => navigate(`/stocks/booths/${booth.id}`)}
            >
              <div className={styles.cardIcon}>
                <span>🏪</span>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardName}>{booth.name}</p>
                <p className={styles.cardDesc}>{booth.description}</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.chevron}>
                <path d="M9 6L15 12L9 18" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>해당 구역에 등록된 부스가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
