import { useEffect, useState } from 'react'
import { adminApi } from '../api'
import type { RankingResponse } from '../types'
import styles from './AdminPage.module.css'

function formatWon(n: number) {
  return n.toLocaleString('ko-KR')
}

export default function AdminPage() {
  const [revealed, setRevealed] = useState(false)
  const [ranking, setRanking] = useState<RankingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [annMessage, setAnnMessage] = useState('')
  const [annCurrent, setAnnCurrent] = useState('')
  const [annSaving, setAnnSaving] = useState(false)

  const loadData = async () => {
    try {
      const [statusRes, rankRes, annRes] = await Promise.all([
        adminApi.getStatus(),
        adminApi.getRanking(),
        adminApi.getAnnouncement(),
      ])
      setRevealed(statusRes.data.revealed)
      setRanking(rankRes.data)
      setAnnCurrent(annRes.data.message)
      setAnnMessage(annRes.data.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async () => {
    const action = revealed ? '결과를 숨기시겠습니까?' : '결과를 공개하시겠습니까?'
    if (!confirm(action)) return

    setToggling(true)
    try {
      const res = await adminApi.toggleResults()
      setRevealed(res.data.revealed)
    } finally {
      setToggling(false)
    }
  }

  if (loading) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>관리자 페이지</h2>
        <p className={styles.subtitle}>투자 결과 관리</p>
      </div>

      <div className={styles.controlCard}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>결과 공개 상태</span>
          <span className={`${styles.statusBadge} ${revealed ? styles.statusOn : styles.statusOff}`}>
            {revealed ? '공개 중' : '비공개'}
          </span>
        </div>
        <p className={styles.statusDesc}>
          {revealed
            ? '현재 모든 참가자가 투자 결과 순위를 볼 수 있습니다.'
            : '결과가 비공개 상태입니다. 참가자에게 "Coming Soon"이 표시됩니다.'}
        </p>
        <button
          className={`${styles.toggleBtn} ${revealed ? styles.hideBtn : styles.revealBtn}`}
          onClick={handleToggle}
          disabled={toggling}
        >
          {toggling ? '처리 중...' : revealed ? '결과 숨기기' : '결과 공개하기'}
        </button>
      </div>

      <div className={styles.controlCard}>
        <p className={styles.statusLabel}>공지사항 관리</p>
        <textarea
          className={styles.announcementInput}
          placeholder="공지 메시지를 입력하세요 (최대 200자)"
          maxLength={200}
          value={annMessage}
          onChange={e => setAnnMessage(e.target.value)}
        />
        <div className={styles.charCount}>{annMessage.length} / 200</div>
        <div className={styles.announcementBtns}>
          <button
            className={`${styles.toggleBtn} ${styles.revealBtn}`}
            disabled={annSaving || !annMessage.trim()}
            onClick={async () => {
              setAnnSaving(true)
              try {
                const res = await adminApi.setAnnouncement(annMessage.trim())
                setAnnCurrent(res.data.message)
                setAnnMessage(res.data.message)
              } finally {
                setAnnSaving(false)
              }
            }}
          >
            {annSaving ? '처리 중...' : '공지 등록'}
          </button>
          <button
            className={`${styles.toggleBtn} ${styles.hideBtn}`}
            disabled={annSaving || !annCurrent}
            onClick={async () => {
              if (!confirm('공지를 삭제하시겠습니까?')) return
              setAnnSaving(true)
              try {
                await adminApi.clearAnnouncement()
                setAnnCurrent('')
                setAnnMessage('')
              } finally {
                setAnnSaving(false)
              }
            }}
          >
            공지 삭제
          </button>
        </div>
        {annCurrent && (
          <p className={styles.statusDesc} style={{ marginTop: 12, marginBottom: 0 }}>
            현재 공지: {annCurrent}
          </p>
        )}
      </div>

      <div className={styles.rankingSection}>
        <h3 className={styles.sectionTitle}>현재 투자 순위</h3>
        <div className={styles.list}>
          {ranking.map((item, i) => (
            <div key={item.boothId} className={styles.item}>
              <span className={`${styles.rank} ${i < 3 ? styles.topRank : ''}`}>
                {item.rank}
              </span>
              <div className={styles.icon} style={{ background: item.themeColor + '30' }}>
                <span>{item.logoEmoji}</span>
              </div>
              <div className={styles.info}>
                <p className={styles.name}>{item.boothName}</p>
                <p className={styles.meta}>{item.category} · 투자자 {item.investorCount}명</p>
              </div>
              <p className={styles.amount}>{formatWon(item.totalInvestment)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
