import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { reportApi } from '../api'
import { useToast } from '../components/ToastContext'
import type { ReportResponse, SharedReportResponse } from '../types'
import styles from './ReportPage.module.css'

const DONUT_COLORS = [
  '#6C5CE7', '#4593FC', '#00D68F', '#F04452', '#FF9F43',
  '#A29BFE', '#55EFC4', '#FD79A8', '#FDCB6E',
]

function formatAmount(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1).replace(/\.0$/, '') + '억'
  if (n >= 10_000) return (n / 10_000).toFixed(0) + '만'
  return n.toLocaleString()
}

function RadarChart({ scores }: { scores: { label: string; value: number }[] }) {
  const size = 280
  const center = size / 2
  const maxRadius = 100
  const angleStep = (2 * Math.PI) / scores.length
  const startAngle = -Math.PI / 2

  const getPoint = (index: number, radius: number) => {
    const angle = startAngle + index * angleStep
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  const makePolygon = (radius: number) =>
    scores.map((_, i) => {
      const p = getPoint(i, radius)
      return `${p.x},${p.y}`
    }).join(' ')

  const dataPoints = scores.map((s, i) =>
    getPoint(i, (s.value / 100) * maxRadius)
  )
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 280 }}>
      {[0.33, 0.66, 1.0].map(level => (
        <polygon
          key={level}
          points={makePolygon(maxRadius * level)}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth="1"
          opacity={0.6}
        />
      ))}
      {scores.map((_, i) => {
        const p = getPoint(i, maxRadius)
        return (
          <line
            key={i}
            x1={center} y1={center} x2={p.x} y2={p.y}
            stroke="var(--border-color)" strokeWidth="1" opacity={0.4}
          />
        )
      })}
      <polygon
        points={dataPolygon}
        fill="rgba(108, 92, 231, 0.25)"
        stroke="#6C5CE7"
        strokeWidth="2"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6C5CE7" />
      ))}
      {scores.map((s, i) => {
        const lp = getPoint(i, maxRadius + 28)
        return (
          <text
            key={i} x={lp.x} y={lp.y}
            textAnchor="middle" dominantBaseline="middle"
            fill="var(--text-secondary)" fontSize="12" fontWeight="500"
          >
            {s.label}
          </text>
        )
      })}
    </svg>
  )
}

function DonutChart({ items }: { items: { name: string; percentage: number; color: string }[] }) {
  const radius = 70
  const stroke = 28
  const size = (radius + stroke) * 2
  const circumference = 2 * Math.PI * radius

  const offsets: number[] = []
  let acc = 0
  for (const item of items) {
    offsets.push(acc)
    acc += (item.percentage / 100) * circumference
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="160" height="160">
      {items.map((item, i) => {
        const dash = (item.percentage / 100) * circumference
        const gap = circumference - dash
        return (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offsets[i]}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )
      })}
    </svg>
  )
}

function VisionModal({
  onSubmit,
  onClose,
  submitting,
}: {
  onSubmit: (vision: string) => void
  onClose: () => void
  submitting: boolean
}) {
  const [vision, setVision] = useState('')
  const charCount = vision.length
  const isValid = charCount >= 50 && charCount < 500

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>나의 비전 작성</h3>
        <p className={styles.modalDesc}>
          CJ에서 꿈꾸는 당신의 비전을 공유해주세요
        </p>
        <textarea
          className={styles.visionTextarea}
          placeholder="나의 투자 비전을 작성해주세요 (50자 이상)"
          value={vision}
          onChange={e => setVision(e.target.value)}
          maxLength={499}
          rows={6}
        />
        <div className={styles.charCounter}>
          <span className={charCount < 50 ? styles.charCountWarn : styles.charCountOk}>
            {charCount}
          </span>
          <span className={styles.charCountTotal}>/500</span>
          {charCount > 0 && charCount < 50 && (
            <span className={styles.charCountHint}> ({50 - charCount}자 더 입력해주세요)</span>
          )}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button
            className={styles.modalSubmitBtn}
            onClick={() => onSubmit(vision)}
            disabled={!isValid || submitting}
          >
            {submitting ? '공유 중...' : '공유하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const period = h < 12 ? '오전' : '오후'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${period} ${hour12}:${m}`
}

export default function ReportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'shared' ? 'shared' : 'report'

  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sharedReports, setSharedReports] = useState<SharedReportResponse[]>([])
  const [sharedLoading, setSharedLoading] = useState(false)
  const [sharedLoaded, setSharedLoaded] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    reportApi.getReport()
      .then(res => setReport(res.data))
      .catch(() => showToast('리포트를 불러올 수 없습니다', 'error'))
      .finally(() => setLoading(false))

    reportApi.getShareStatus()
      .then(res => setShared(res.data.shared))
      .catch(() => {})
  }, [showToast])

  useEffect(() => {
    if (activeTab === 'shared' && !sharedLoaded) {
      setSharedLoading(true)
      reportApi.getSharedReports()
        .then(res => {
          setSharedReports(res.data)
          setSharedLoaded(true)
        })
        .catch(() => showToast('공유 리포트를 불러올 수 없습니다', 'error'))
        .finally(() => setSharedLoading(false))
    }
  }, [activeTab, sharedLoaded, showToast])

  const switchTab = (tab: 'report' | 'shared') => {
    setSearchParams(tab === 'shared' ? { tab: 'shared' } : {})
  }

  const handleShareSubmit = async (vision: string) => {
    if (submitting) return
    setSubmitting(true)

    try {
      await reportApi.shareReport({ vision })

      setShared(true)
      setShowModal(false)
      setSharedLoaded(false)
      showToast('리포트가 공유되었습니다', 'success')
    } catch {
      showToast('공유에 실패했습니다', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
        </div>
      </div>
    )
  }

  if (!report || !report.eligible) {
    const morningCount = report?.morningVisitCount ?? 0
    const afternoonCount = report?.afternoonVisitCount ?? 0
    return (
      <IneligibleView
        morningCount={morningCount}
        afternoonCount={afternoonCount}
      />
    )
  }

  const radarScores = [
    { label: '다양성', value: report.diversity },
    { label: '활동성', value: report.activeness },
    { label: '안정성', value: report.stability },
    { label: '창의성', value: report.creativity },
    { label: '통찰력', value: report.insight },
  ]

  const donutItems = report.portfolio.map((p, i) => ({
    name: `${p.logoEmoji} ${p.boothName}`,
    percentage: p.percentage,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }))

  return (
    <div className={styles.container}>
      {/* 탭 */}
      <div className={styles.tabsChip}>
        <button
          className={`${styles.chipTab} ${activeTab === 'report' ? styles.chipActive : ''}`}
          onClick={() => switchTab('report')}
        >
          나의 투자 성향 리포트
        </button>
        <button
          className={`${styles.chipTab} ${activeTab === 'shared' ? styles.chipActive : ''}`}
          onClick={() => switchTab('shared')}
        >
          공유 내역
        </button>
      </div>

      {activeTab === 'report' ? (
        <>
          {/* 히어로 */}
          <div className={`${styles.heroSection} ${styles.stagger}`} style={{ animationDelay: '0s' }}>
            <p className={styles.heroName}>{report.userName}님은</p>
            <h1 className={styles.tendencyName}>{report.tendencyName}</h1>
            <p className={styles.tendencyOneLiner}>{report.tendencyOneLiner}</p>
          </div>

          {/* 레이더 차트 */}
          <div className={`${styles.radarSection} ${styles.stagger}`} style={{ animationDelay: '0.1s' }}>
            <h3 className={styles.sectionTitle}>투자 성향 분석</h3>
            <div className={styles.radarChart}>
              <RadarChart scores={radarScores} />
            </div>
          </div>

          {/* 핵심 수치 */}
          <div className={`${styles.metricsGrid} ${styles.stagger}`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.metricCard}>
              <p className={styles.metricLabel}>총 투자금</p>
              <p className={styles.metricValue}>
                {formatAmount(report.totalInvested)}
                <span className={styles.metricUnit}>원</span>
              </p>
            </div>
            <div className={styles.metricCard}>
              <p className={styles.metricLabel}>투자 부스</p>
              <p className={styles.metricValue}>
                {report.investedBoothCount}
                <span className={styles.metricUnit}>곳</span>
              </p>
            </div>
            <div className={styles.metricCard}>
              <p className={styles.metricLabel}>아이디어 develop 존 참여 횟수</p>
              <p className={styles.metricValue}>
                {report.ideaCount}
                <span className={styles.metricUnit}>건</span>
              </p>
            </div>
            <div className={styles.metricCard}>
              <p className={styles.metricLabel}>평가 평균</p>
              <p className={styles.metricValue}>
                {report.ratingAverage}
                <span className={styles.metricUnit}>점</span>
              </p>
            </div>
          </div>

          {/* 포트폴리오 */}
          {report.portfolio.length > 0 && (
            <div className={`${styles.portfolioSection} ${styles.stagger}`} style={{ animationDelay: '0.3s' }}>
              <h3 className={styles.sectionTitle}>투자 포트폴리오</h3>
              <div className={styles.donutWrapper}>
                <DonutChart items={donutItems} />
              </div>
              <div className={styles.legendList}>
                {report.portfolio.map((p, i) => (
                  <div key={p.boothId} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                    <span className={styles.legendName}>{p.boothName}</span>
                    <span className={styles.legendPercent}>{p.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최애 투자처 */}
          {report.topBoothName && (
            <div className={`${styles.topBoothCard} ${styles.stagger}`} style={{ animationDelay: '0.4s' }}>
              <div className={styles.topBoothInfo}>
                <p className={styles.topBoothLabel}>BEST PICK</p>
                <p className={styles.topBoothName}>{report.topBoothName}</p>
                <p className={styles.topBoothAmount}>{formatAmount(report.topBoothAmount)}원</p>
              </div>
            </div>
          )}

          {/* 공유 버튼 */}
          <button
            className={`${styles.shareButton} ${shared ? styles.shareButtonDone : ''} ${styles.stagger}`}
            style={{ animationDelay: '0.5s' }}
            onClick={() => !shared && setShowModal(true)}
            disabled={shared}
          >
            {shared ? '공유 완료!' : '리포트 공유하기'}
          </button>

          {/* 비전 작성 모달 */}
          {showModal && (
            <VisionModal
              onSubmit={handleShareSubmit}
              onClose={() => setShowModal(false)}
              submitting={submitting}
            />
          )}
        </>
      ) : (
        <>
          {sharedLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <>
              <div className={styles.sharedHeader}>
                <h2 className={styles.sharedHeaderTitle}>참가자들의 투자 비전</h2>
                <p className={styles.sharedHeaderSub}>
                  {sharedReports.length}명의 참가자가 비전을 공유했습니다
                </p>
              </div>

              {sharedReports.length === 0 ? (
                <div className={styles.sharedEmpty}>
                  <span className={styles.sharedEmptyIcon}>&#x1F4AD;</span>
                  <p className={styles.sharedEmptyText}>아직 공유된 리포트가 없습니다</p>
                  <p className={styles.sharedEmptySub}>첫 번째로 비전을 공유해보세요!</p>
                </div>
              ) : (
                <div className={styles.sharedCardList}>
                  {sharedReports.map((r, i) => (
                    <div
                      key={r.userId}
                      className={`${styles.sharedCard} ${styles.stagger}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className={styles.sharedCardHeader}>
                        <span className={styles.sharedCardEmoji}>{r.tendencyEmoji}</span>
                        <div className={styles.sharedCardUserInfo}>
                          <p className={styles.sharedCardUserName}>{r.userName}</p>
                          {r.userCompany && (
                            <p className={styles.sharedCardCompany}>{r.userCompany}</p>
                          )}
                        </div>
                        <div className={styles.sharedCardTendency}>
                          <span className={styles.sharedCardTendencyName}>{r.tendencyName}</span>
                        </div>
                      </div>
                      <p className={styles.sharedCardVision}>{r.vision}</p>
                      <div className={styles.sharedCardFooter}>
                        <span className={styles.sharedCardOneLiner}>{r.tendencyOneLiner}</span>
                        <span className={styles.sharedCardTime}>{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function IneligibleView({ morningCount, afternoonCount }: { morningCount: number; afternoonCount: number }) {
  const [mc, setMc] = useState(morningCount)
  const [ac, setAc] = useState(afternoonCount)

  useEffect(() => {
    if (morningCount === 0 && afternoonCount === 0) {
      reportApi.checkEligibility()
        .then(res => {
          setMc(res.data.morningVisitCount)
          setAc(res.data.afternoonVisitCount)
        })
        .catch(() => {})
    }
  }, [morningCount, afternoonCount])

  const morningDone = mc >= 10
  const afternoonDone = ac >= 5

  return (
    <div className={styles.container}>
      <div className={styles.ineligibleContainer}>
        <div className={styles.lockIcon}>&#x1F4CA;</div>
        <h2 className={styles.ineligibleTitle}>투자 성향 리포트</h2>
        <p className={styles.ineligibleSub}>
          아래 조건을 충족하면<br />나만의 투자 성향 리포트를 받을 수 있어요
        </p>
        <div className={styles.conditionCard}>
          <div className={styles.conditionItem}>
            <div className={styles.conditionLabel}>
              <span className={styles.conditionText}>오전 (09:00~12:00) 부스 방문</span>
              <span className={`${styles.conditionCount} ${morningDone ? styles.conditionCountDone : ''}`}>
                {mc}/10
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${morningDone ? styles.progressFillDone : ''}`}
                style={{ width: `${Math.min((mc / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className={styles.conditionItem}>
            <div className={styles.conditionLabel}>
              <span className={styles.conditionText}>오후 (12:00~14:00) 부스 방문</span>
              <span className={`${styles.conditionCount} ${afternoonDone ? styles.conditionCountDone : ''}`}>
                {ac}/5
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${afternoonDone ? styles.progressFillDone : ''}`}
                style={{ width: `${Math.min((ac / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
