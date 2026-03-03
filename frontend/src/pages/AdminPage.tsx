import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api'
import { formatKorean } from '../utils/format'
import type { RankingResponse, AdminBoothRatingResponse } from '../types'
import styles from './AdminPage.module.css'

type RatingSortKey = 'avgTotal' | 'totalScoreSum' | 'ratingCount' | 'avgFirst' | 'avgBest' | 'avgDifferent' | 'avgNumberOne' | 'avgGap' | 'avgGlobal'
type AdminTab = 'common' | 'ranking' | 'settings'

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
  const navigate = useNavigate()
  const [tab, setTab] = useState<AdminTab>('common')
  const [revealed, setRevealed] = useState(false)
  const [stockEnabled, setStockEnabled] = useState(true)
  const [investmentEnabled, setInvestmentEnabled] = useState(true)
  const [ranking, setRanking] = useState<RankingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [stockToggling, setStockToggling] = useState(false)
  const [investToggling, setInvestToggling] = useState(false)
  const [annMessage, setAnnMessage] = useState('')
  const [annCurrent, setAnnCurrent] = useState('')
  const [annSaving, setAnnSaving] = useState(false)
  const [missionResultRevealed, setMissionResultRevealed] = useState(false)
  const [missionToggling, setMissionToggling] = useState(false)
  const [dreamEnabled, setDreamEnabled] = useState(false)
  const [dreamToggling, setDreamToggling] = useState(false)
  const [stockRankingEnabled, setStockRankingEnabled] = useState(true)
  const [stockRankingToggling, setStockRankingToggling] = useState(false)
  const [boothRatings, setBoothRatings] = useState<AdminBoothRatingResponse[]>([])
  const [ratingSortKey, setRatingSortKey] = useState<RatingSortKey>('avgTotal')

  const loadData = async () => {
    try {
      const [statusRes, stockRes, investRes, missionRes, dreamRes, stockRankingRes, rankRes, annRes, ratingsRes] = await Promise.all([
        adminApi.getStatus(),
        adminApi.getStockStatus(),
        adminApi.getInvestmentStatus(),
        adminApi.getMissionResultStatus(),
        adminApi.getDreamStatus(),
        adminApi.getStockRankingStatus(),
        adminApi.getRanking(),
        adminApi.getAnnouncement(),
        adminApi.getBoothRatings(),
      ])
      setRevealed(statusRes.data.revealed)
      setStockEnabled(stockRes.data.enabled)
      setInvestmentEnabled(investRes.data.enabled)
      setMissionResultRevealed(missionRes.data.revealed)
      setDreamEnabled(dreamRes.data.enabled)
      setStockRankingEnabled(stockRankingRes.data.enabled)
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

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'common' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('common')}
        >
          상시기능
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'ranking' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('ranking')}
        >
          투자 순위
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'settings' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('settings')}
        >
          기능 관리
        </button>
      </div>

      {tab === 'settings' && (
        <>
          <div className={styles.controlCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>미션 공개 상태</span>
              <span className={`${styles.statusBadge} ${missionResultRevealed ? styles.statusOn : styles.statusOff}`}>
                {missionResultRevealed ? '공개 중' : '비공개'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {missionResultRevealed
                ? '현재 "반드시 결과로" 미션의 내용이 참가자에게 공개되어 있습니다.'
                : '"반드시 결과로" 미션의 내용이 숨겨져 있습니다. 참가자는 미션 내용을 알 수 없습니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${missionResultRevealed ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = missionResultRevealed ? '미션 내용을 숨기시겠습니까?' : '미션 내용을 공개하시겠습니까?'
                if (!confirm(action)) return
                setMissionToggling(true)
                try {
                  const res = await adminApi.toggleMissionResult()
                  setMissionResultRevealed(res.data.revealed)
                } finally {
                  setMissionToggling(false)
                }
              }}
              disabled={missionToggling}
            >
              {missionToggling ? '처리 중...' : missionResultRevealed ? '미션 내용 숨기기' : '미션 내용 공개하기'}
            </button>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>꿈을 원대하게 미션</span>
              <span className={`${styles.statusBadge} ${dreamEnabled ? styles.statusOn : styles.statusOff}`}>
                {dreamEnabled ? '활성' : '비활성'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {dreamEnabled
                ? '현재 "꿈을 원대하게" 미션이 활성화되어 있습니다. 참가자가 미션 내용을 볼 수 있고 완료할 수 있습니다.'
                : '"꿈을 원대하게" 미션이 비활성화 상태입니다. 미션 내용이 숨겨지고 완료할 수 없습니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${dreamEnabled ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = dreamEnabled ? '"꿈을 원대하게" 미션을 비활성화하시겠습니까?' : '"꿈을 원대하게" 미션을 활성화하시겠습니까?'
                if (!confirm(action)) return
                setDreamToggling(true)
                try {
                  const res = await adminApi.toggleDream()
                  setDreamEnabled(res.data.enabled)
                } finally {
                  setDreamToggling(false)
                }
              }}
              disabled={dreamToggling}
            >
              {dreamToggling ? '처리 중...' : dreamEnabled ? '미션 비활성화' : '미션 활성화'}
            </button>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>AM 투자 랭킹</span>
              <span className={`${styles.statusBadge} ${stockRankingEnabled ? styles.statusOn : styles.statusOff}`}>
                {stockRankingEnabled ? '공개' : '잠금'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {stockRankingEnabled
                ? '현재 AM 투자 미션 랭킹이 참가자에게 공개되어 있습니다.'
                : 'AM 투자 미션 랭킹이 잠금 상태입니다. 참가자에게 "랭킹 보기" 버튼이 표시되지 않습니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${stockRankingEnabled ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = stockRankingEnabled ? 'AM 투자 랭킹을 잠그시겠습니까?' : 'AM 투자 랭킹을 공개하시겠습니까?'
                if (!confirm(action)) return
                setStockRankingToggling(true)
                try {
                  const res = await adminApi.toggleStockRanking()
                  setStockRankingEnabled(res.data.enabled)
                } finally {
                  setStockRankingToggling(false)
                }
              }}
              disabled={stockRankingToggling}
            >
              {stockRankingToggling ? '처리 중...' : stockRankingEnabled ? '랭킹 잠금' : '랭킹 공개'}
            </button>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>AM 투자 (오전)</span>
              <span className={`${styles.statusBadge} ${stockEnabled ? styles.statusOn : styles.statusOff}`}>
                {stockEnabled ? '활성' : '중단'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {stockEnabled
                ? '현재 AM 투자가 활성화되어 있습니다. 참가자가 오전 투자에 접근할 수 있습니다.'
                : 'AM 투자가 중단된 상태입니다. 참가자에게 "Coming Soon"이 표시됩니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${stockEnabled ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = stockEnabled ? 'AM 투자를 중단하시겠습니까?' : 'AM 투자를 활성화하시겠습니까?'
                if (!confirm(action)) return
                setStockToggling(true)
                try {
                  const res = await adminApi.toggleStock()
                  setStockEnabled(res.data.enabled)
                } finally {
                  setStockToggling(false)
                }
              }}
              disabled={stockToggling}
            >
              {stockToggling ? '처리 중...' : stockEnabled ? 'AM 투자 중단' : 'AM 투자 활성화'}
            </button>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>PM 투자 (오후)</span>
              <span className={`${styles.statusBadge} ${investmentEnabled ? styles.statusOn : styles.statusOff}`}>
                {investmentEnabled ? '활성' : '중단'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {investmentEnabled
                ? '현재 PM 투자가 활성화되어 있습니다. 참가자가 오후 투자에 접근할 수 있습니다.'
                : 'PM 투자가 중단된 상태입니다. 참가자에게 "Coming Soon"이 표시됩니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${investmentEnabled ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = investmentEnabled ? 'PM 투자를 중단하시겠습니까?' : 'PM 투자를 활성화하시겠습니까?'
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
              {investToggling ? '처리 중...' : investmentEnabled ? 'PM 투자 중단' : 'PM 투자 활성화'}
            </button>
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
        </>
      )}

      {tab === 'common' && (
        <>
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

          <div className={styles.controlCard}>
            <p className={styles.statusLabel}>이용권 관리</p>
            <p className={styles.statusDesc}>참가자의 이벤트존 이용권 QR 코드를 스캔하여 사용 처리합니다.</p>
            <button
              className={`${styles.toggleBtn} ${styles.revealBtn}`}
              onClick={() => navigate('/admin/ticket-scan')}
            >
              이용권 스캔
            </button>
          </div>
        </>
      )}

      {tab === 'ranking' && (
        <>
          <div className={styles.rankingSection}>
            <h3 className={styles.sectionTitle}>현재 투자 순위</h3>
            <div className={styles.list}>
              {ranking.map((item, i) => (
                <div key={item.boothId} className={styles.item}>
                  <span className={`${styles.rank} ${i < 3 ? styles.topRank : ''}`}>
                    {item.rank}
                  </span>
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
        </>
      )}
    </div>
  )
}
