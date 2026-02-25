import { useEffect, useState } from 'react'
import { adminApi } from '../api'
import { formatKorean } from '../utils/format'
import type { RankingResponse, AdminBoothRatingResponse } from '../types'
import styles from './AdminPage.module.css'

type RatingSortKey = 'avgTotal' | 'totalScoreSum' | 'ratingCount' | 'avgFirst' | 'avgBest' | 'avgDifferent' | 'avgNumberOne' | 'avgGap' | 'avgGlobal'

const SORT_OPTIONS: { key: RatingSortKey; label: string }[] = [
  { key: 'avgTotal', label: '전체 평균' },
  { key: 'totalScoreSum', label: '총점 합계' },
  { key: 'ratingCount', label: '참여자 수' },
  { key: 'avgFirst', label: '최초' },
  { key: 'avgBest', label: '최고' },
  { key: 'avgDifferent', label: '차별화' },
  { key: 'avgNumberOne', label: '일등' },
  { key: 'avgGap', label: '초격차' },
  { key: 'avgGlobal', label: '글로벌' },
]

export default function AdminPage() {
  const [revealed, setRevealed] = useState(false)
  const [investmentEnabled, setInvestmentEnabled] = useState(true)
  const [ranking, setRanking] = useState<RankingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [investToggling, setInvestToggling] = useState(false)
  const [annMessage, setAnnMessage] = useState('')
  const [annCurrent, setAnnCurrent] = useState('')
  const [annSaving, setAnnSaving] = useState(false)
  const [boothRatings, setBoothRatings] = useState<AdminBoothRatingResponse[]>([])
  const [ratingSortKey, setRatingSortKey] = useState<RatingSortKey>('avgTotal')

  const loadData = async () => {
    try {
      const [statusRes, investRes, rankRes, annRes, ratingsRes] = await Promise.all([
        adminApi.getStatus(),
        adminApi.getInvestmentStatus(),
        adminApi.getRanking(),
        adminApi.getAnnouncement(),
        adminApi.getBoothRatings(),
      ])
      setRevealed(statusRes.data.revealed)
      setInvestmentEnabled(investRes.data.enabled)
      setRanking(rankRes.data)
      setAnnCurrent(annRes.data.message)
      setAnnMessage(annRes.data.message)
      setBoothRatings(ratingsRes.data)
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
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>투자 메뉴 상태</span>
          <span className={`${styles.statusBadge} ${investmentEnabled ? styles.statusOn : styles.statusOff}`}>
            {investmentEnabled ? '활성' : '비활성'}
          </span>
        </div>
        <p className={styles.statusDesc}>
          {investmentEnabled
            ? '현재 참가자가 플로팅 메뉴에서 투자 기능에 접근할 수 있습니다.'
            : '투자 메뉴가 숨겨져 있어 참가자가 투자 기능에 접근할 수 없습니다.'}
        </p>
        <button
          className={`${styles.toggleBtn} ${investmentEnabled ? styles.hideBtn : styles.revealBtn}`}
          onClick={async () => {
            const action = investmentEnabled ? '투자 메뉴를 비활성화하시겠습니까?' : '투자 메뉴를 활성화하시겠습니까?'
            if (!confirm(action)) return
            setInvestToggling(true)
            try {
              const res = await adminApi.toggleInvestment()
              setInvestmentEnabled(res.data.enabled)
            } finally {
              setInvestToggling(false)
            }
          }}
          disabled={investToggling}
        >
          {investToggling ? '처리 중...' : investmentEnabled ? '투자 메뉴 끄기' : '투자 메뉴 켜기'}
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
              <p className={styles.amount}>{formatKorean(item.totalInvestment)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rankingSection}>
        <h3 className={styles.sectionTitle}>부스 평가 결과</h3>
        <div className={styles.sortBar}>
          <span className={styles.sortLabel}>정렬</span>
          <select
            className={styles.sortSelect}
            value={ratingSortKey}
            onChange={e => setRatingSortKey(e.target.value as RatingSortKey)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.list}>
          {[...boothRatings]
            .sort((a, b) => (b[ratingSortKey] ?? 0) - (a[ratingSortKey] ?? 0))
            .map((item, i) => (
              <div key={item.boothId} className={styles.ratingItem}>
                <div className={styles.ratingItemHeader}>
                  <span className={`${styles.rank} ${i < 3 ? styles.topRank : ''}`}>
                    {i + 1}
                  </span>
                  <div className={styles.icon} style={{ background: item.themeColor + '30' }}>
                    <span>{item.logoEmoji}</span>
                  </div>
                  <div className={styles.info}>
                    <p className={styles.name}>{item.boothName}</p>
                    <p className={styles.meta}>참여자 {item.ratingCount}명 · 총점 {item.totalScoreSum}</p>
                  </div>
                  <div className={styles.ratingScore}>
                    <p className={styles.ratingAvg}>{(item.avgTotal ?? 0).toFixed(1)}</p>
                    <p className={styles.ratingAvgLabel}>평균</p>
                  </div>
                </div>
                <div className={styles.ratingBars}>
                  {[
                    { label: '최초', value: item.avgFirst },
                    { label: '최고', value: item.avgBest },
                    { label: '차별화', value: item.avgDifferent },
                    { label: '일등', value: item.avgNumberOne },
                    { label: '초격차', value: item.avgGap },
                    { label: '글로벌', value: item.avgGlobal },
                  ].map(bar => (
                    <div key={bar.label} className={styles.ratingBarRow}>
                      <span className={styles.ratingBarLabel}>{bar.label}</span>
                      <div className={styles.ratingBarTrack}>
                        <div
                          className={styles.ratingBarFill}
                          style={{ width: `${((bar.value ?? 0) / 5) * 100}%`, background: item.themeColor }}
                        />
                      </div>
                      <span className={styles.ratingBarValue}>{(bar.value ?? 0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
