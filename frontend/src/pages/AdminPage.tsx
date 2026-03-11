import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { adminApi } from '../api'
import { formatKorean } from '../utils/format'
import type { RankingResponse, AdminBoothRatingResponse } from '../types'
import styles from './AdminPage.module.css'

type RatingSortKey = 'avgTotal' | 'totalScoreSum' | 'ratingCount' | 'avgFirst' | 'avgBest' | 'avgDifferent' | 'avgNumberOne' | 'avgGap' | 'avgGlobal'
type AwardItem = { awardName: string; description: string; winnerName: string; winnerCompany: string; detail: string }
type AwardRankingItem = { rank: number; name: string; company: string; value: string; time: string | null }
type AdminTab = 'common' | 'ranking' | 'awards' | 'settings'

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
  const [stockRanking, setStockRanking] = useState<RankingResponse[]>([])
  const [rankingTab, setRankingTab] = useState<'pm' | 'am'>('pm')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [stockToggling, setStockToggling] = useState(false)
  const [investToggling, setInvestToggling] = useState(false)
  const [annMessage, setAnnMessage] = useState('')
  const [annCurrent, setAnnCurrent] = useState('')
  const [annSaving, setAnnSaving] = useState(false)
  const [stockRankingEnabled, setStockRankingEnabled] = useState(true)
  const [stockRankingToggling, setStockRankingToggling] = useState(false)
  const [boothRatings, setBoothRatings] = useState<AdminBoothRatingResponse[]>([])
  const [ratingSortKey, setRatingSortKey] = useState<RatingSortKey>('avgTotal')
  const [resultMissionLoading, setResultMissionLoading] = useState(false)
  const [resultMissionCompleted, setResultMissionCompleted] = useState(false)
  const [activeQr, setActiveQr] = useState<{ value: string; label: string } | null>(null)
  const [awards, setAwards] = useState<AwardItem[]>([])
  const [awardsLoading, setAwardsLoading] = useState(false)
  const [awardsLoaded, setAwardsLoaded] = useState(false)
  const [awardRanking, setAwardRanking] = useState<AwardRankingItem[]>([])
  const [awardRankingTitle, setAwardRankingTitle] = useState('')
  const [awardRankingOpen, setAwardRankingOpen] = useState(false)
  const [awardRankingLoading, setAwardRankingLoading] = useState(false)

  const loadData = async () => {
    try {
      const [statusRes, stockRes, investRes, stockRankingRes, rankRes, stockRankRes, annRes, ratingsRes] = await Promise.all([
        adminApi.getStatus(),
        adminApi.getStockStatus(),
        adminApi.getInvestmentStatus(),
        adminApi.getStockRankingStatus(),
        adminApi.getRanking(),
        adminApi.getStockRanking(),
        adminApi.getAnnouncement(),
        adminApi.getBoothRatings(),
      ])
      setRevealed(statusRes.data.revealed)
      setStockEnabled(stockRes.data.enabled)
      setInvestmentEnabled(investRes.data.enabled)
      setStockRankingEnabled(stockRankingRes.data.enabled)
      setRanking(rankRes.data)
      setStockRanking(stockRankRes.data)
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
          className={`${styles.tabBtn} ${tab === 'awards' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('awards')}
        >
          시상
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
              <span className={styles.statusLabel}>하고잡이 투자 랭킹</span>
              <span className={`${styles.statusBadge} ${stockRankingEnabled ? styles.statusOn : styles.statusOff}`}>
                {stockRankingEnabled ? '공개' : '잠금'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {stockRankingEnabled
                ? '현재 하고잡이 투자 미션 랭킹이 참가자에게 공개되어 있습니다.'
                : '하고잡이 투자 미션 랭킹이 잠금 상태입니다. 참가자에게 "랭킹 보기" 버튼이 표시되지 않습니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${stockRankingEnabled ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = stockRankingEnabled ? '하고잡이 투자 랭킹을 잠그시겠습니까?' : '하고잡이 투자 랭킹을 공개하시겠습니까?'
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
              <span className={styles.statusLabel}>하고잡이 투자 (오전)</span>
              <span className={`${styles.statusBadge} ${stockEnabled ? styles.statusOn : styles.statusOff}`}>
                {stockEnabled ? '활성' : '중단'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {stockEnabled
                ? '현재 하고잡이 투자가 활성화되어 있습니다. 참가자가 하고잡이 투자에 접근할 수 있습니다.'
                : '하고잡이 투자가 중단된 상태입니다. 참가자에게 "Coming Soon"이 표시됩니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${stockEnabled ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = stockEnabled ? '하고잡이 투자를 중단하시겠습니까?' : '하고잡이 투자를 활성화하시겠습니까?'
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
              {stockToggling ? '처리 중...' : stockEnabled ? '하고잡이 투자 중단' : '하고잡이 투자 활성화'}
            </button>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>대표작 투자 (오후)</span>
              <span className={`${styles.statusBadge} ${investmentEnabled ? styles.statusOn : styles.statusOff}`}>
                {investmentEnabled ? '활성' : '중단'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {investmentEnabled
                ? '현재 대표작 투자가 활성화되어 있습니다. 참가자가 오후 투자에 접근할 수 있습니다.'
                : '대표작 투자가 중단된 상태입니다. 참가자에게 "Coming Soon"이 표시됩니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${investmentEnabled ? styles.hideBtn : styles.revealBtn}`}
              onClick={async () => {
                const action = investmentEnabled ? '대표작 투자를 중단하시겠습니까?' : '대표작 투자를 활성화하시겠습니까?'
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
              {investToggling ? '처리 중...' : investmentEnabled ? '대표작 투자 중단' : '대표작 투자 활성화'}
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
            <p className={styles.statusLabel}>임원 투자 집계</p>
            <p className={styles.statusDesc}>임원분들의 대표작 투자 내역과 부스별 임원 투자 현황을 확인합니다.</p>
            <button
              className={`${styles.toggleBtn} ${styles.revealBtn}`}
              onClick={() => navigate('/executive')}
            >
              임원 내역 집계
            </button>
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

          <div className={styles.controlCard}>
            <p className={styles.statusLabel}>미션 QR 코드</p>
            <p className={styles.statusDesc}>현장에 부착할 미션 QR 코드입니다. 참가자가 스캔하면 미션이 완료됩니다.</p>
            <div className={styles.qrBtnGrid}>
              <button className={styles.qrBtn} onClick={() => setActiveQr({ value: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', label: '내일 더 새롭게' })}>
                내일 더 새롭게
              </button>
              <button className={styles.qrBtn} onClick={() => setActiveQr({ value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', label: '함께하는 하고잡이' })}>
                함께하는 하고잡이
              </button>
            </div>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>"반드시 결과로" 미션</span>
              <span className={`${styles.statusBadge} ${resultMissionCompleted ? styles.statusOn : styles.statusOff}`}>
                {resultMissionCompleted ? '완료됨' : '미완료'}
              </span>
            </div>
            <p className={styles.statusDesc}>
              {resultMissionCompleted
                ? '전체 참가자의 "반드시 결과로" 미션이 완료 상태입니다.'
                : '전체 참가자의 "반드시 결과로" 미션을 일괄 완료 처리합니다. 참가자 화면에 실시간으로 완료 효과가 표시됩니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${resultMissionCompleted ? styles.hideBtn : styles.revealBtn}`}
              disabled={resultMissionLoading}
              onClick={async () => {
                if (resultMissionCompleted) {
                  if (!confirm('전체 참가자의 "반드시 결과로" 미션을 미완료로 되돌리시겠습니까?')) return
                  setResultMissionLoading(true)
                  try {
                    const res = await adminApi.uncompleteMissionForAll('result')
                    setResultMissionCompleted(false)
                    alert(`${res.data.uncompletedCount}명의 미션이 미완료 처리되었습니다.`)
                  } catch {
                    alert('처리 중 오류가 발생했습니다.')
                  } finally {
                    setResultMissionLoading(false)
                  }
                } else {
                  if (!confirm('전체 참가자의 "반드시 결과로" 미션을 완료 처리하시겠습니까?')) return
                  setResultMissionLoading(true)
                  try {
                    const res = await adminApi.completeMissionForAll('result')
                    setResultMissionCompleted(true)
                    alert(`${res.data.completedCount}명의 미션이 완료 처리되었습니다.`)
                  } catch {
                    alert('처리 중 오류가 발생했습니다.')
                  } finally {
                    setResultMissionLoading(false)
                  }
                }
              }}
            >
              {resultMissionLoading ? '처리 중...' : resultMissionCompleted ? '미션 미완료 처리' : '전체 미션 완료 처리'}
            </button>
          </div>
        </>
      )}

      {tab === 'ranking' && (
        <>
          <div className={styles.rankingSubTabs}>
            <button
              className={`${styles.rankingSubTab} ${rankingTab === 'pm' ? styles.rankingSubTabActive : ''}`}
              onClick={() => setRankingTab('pm')}
            >
              대표작 투자 (오후)
            </button>
            <button
              className={`${styles.rankingSubTab} ${rankingTab === 'am' ? styles.rankingSubTabActive : ''}`}
              onClick={() => setRankingTab('am')}
            >
              하고잡이 투자 (오전)
            </button>
          </div>

          <div className={styles.rankingSection}>
            <h3 className={styles.sectionTitle}>
              {rankingTab === 'pm' ? '대표작 투자 순위' : '하고잡이 투자 순위'}
            </h3>
            <div className={styles.list}>
              {(rankingTab === 'pm' ? ranking : stockRanking).map((item, i) => (
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
      {tab === 'awards' && (
        <>
          <div className={styles.controlCard}>
            <p className={styles.statusLabel}>시상 결과 조회</p>
            <p className={styles.statusDesc}>
              {awardsLoaded
                ? '시상 결과가 아래에 표시됩니다.'
                : '버튼을 눌러 각 상의 수상자를 조회합니다.'}
            </p>
            <button
              className={`${styles.toggleBtn} ${styles.revealBtn}`}
              disabled={awardsLoading}
              onClick={async () => {
                setAwardsLoading(true)
                try {
                  const res = await adminApi.getAwards()
                  setAwards(res.data)
                  setAwardsLoaded(true)
                } catch {
                  alert('시상 결과 조회 중 오류가 발생했습니다.')
                } finally {
                  setAwardsLoading(false)
                }
              }}
            >
              {awardsLoading ? '조회 중...' : awardsLoaded ? '다시 조회' : '시상 결과 조회'}
            </button>
          </div>

          {awardsLoaded && awards.map((award, i) => (
            <div
              key={i}
              className={styles.awardCard}
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                setAwardRankingTitle(award.awardName)
                setAwardRankingOpen(true)
                setAwardRankingLoading(true)
                try {
                  const res = await adminApi.getAwardRanking(i)
                  setAwardRanking(res.data)
                } catch {
                  setAwardRanking([])
                } finally {
                  setAwardRankingLoading(false)
                }
              }}
            >
              <div className={styles.awardHeader}>
                <span className={styles.awardBadge}>{i + 1}</span>
                <div className={styles.awardTitle}>{award.awardName}</div>
              </div>
              <p className={styles.awardDesc}>{award.description}</p>
              <div className={styles.awardWinner}>
                <div className={styles.awardWinnerInfo}>
                  <p className={styles.awardWinnerName}>{award.winnerName}</p>
                  {award.winnerCompany && (
                    <p className={styles.awardWinnerCompany}>{award.winnerCompany}</p>
                  )}
                </div>
                {award.detail && (
                  <span className={styles.awardDetail}>{award.detail}</span>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {awardRankingOpen && (
        <div className={styles.qrOverlay} onClick={() => setAwardRankingOpen(false)}>
          <div className={styles.awardRankingModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.awardRankingTitle}>{awardRankingTitle}</h3>
            {awardRankingLoading ? (
              <p className={styles.statusDesc}>조회 중...</p>
            ) : awardRanking.length === 0 ? (
              <p className={styles.statusDesc}>데이터가 없습니다.</p>
            ) : (
              <div className={styles.awardRankingList}>
                {awardRanking.map(item => (
                  <div key={item.rank} className={`${styles.awardRankingRow} ${item.rank <= 3 ? styles.awardRankingTop : ''}`}>
                    <span className={styles.awardRankingRank}>{item.rank}</span>
                    <div className={styles.awardRankingInfo}>
                      <span className={styles.awardRankingName}>{item.name}</span>
                      <span className={styles.awardRankingCompany}>{item.company}</span>
                    </div>
                    <div className={styles.awardRankingRight}>
                      {item.value && <span className={styles.awardRankingValue}>{item.value}</span>}
                      {item.time && <span className={styles.awardRankingTime}>{item.time}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className={styles.qrModalClose} onClick={() => setAwardRankingOpen(false)}>닫기</button>
          </div>
        </div>
      )}

      {activeQr && (
        <div className={styles.qrOverlay} onClick={() => setActiveQr(null)}>
          <div className={styles.qrModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.qrModalTitle}>{activeQr.label}</h3>
            <div className={styles.qrModalCode}>
              <QRCodeSVG value={activeQr.value} size={240} level="M" />
            </div>
            <button className={styles.qrModalClose} onClick={() => setActiveQr(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}
