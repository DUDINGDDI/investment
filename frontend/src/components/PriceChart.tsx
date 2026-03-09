import { formatKorean } from '../utils/format'
import styles from './PriceChart.module.css'

interface PriceChartProps {
  priceHistory: { price: number; changedAt: string }[]
  themeColor: string
}

export default function PriceChart({ priceHistory, themeColor }: PriceChartProps) {
  if (priceHistory.length <= 1) {
    return (
      <div className={styles.container}>
        <div className={styles.chart}>
          <p className={styles.empty}>가격 변동 없음</p>
        </div>
      </div>
    )
  }

  const prices = priceHistory.map(p => p.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const svgWidth = 320
  const svgHeight = 160
  const paddingX = 8
  const paddingTop = 16
  const paddingBottom = 16
  const chartWidth = svgWidth - paddingX * 2
  const chartHeight = svgHeight - paddingTop - paddingBottom

  const priceRange = maxPrice - minPrice || 1

  const points = priceHistory.map((p, i) => {
    const x = paddingX + (i / (priceHistory.length - 1)) * chartWidth
    const y = paddingTop + (1 - (p.price - minPrice) / priceRange) * chartHeight
    return { x, y }
  })

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ')

  // gradient fill path (라인 아래 영역)
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const fillPath = [
    `M ${firstPoint.x},${firstPoint.y}`,
    ...points.slice(1).map(p => `L ${p.x},${p.y}`),
    `L ${lastPoint.x},${svgHeight - paddingBottom}`,
    `L ${firstPoint.x},${svgHeight - paddingBottom}`,
    'Z',
  ].join(' ')

  const gradientId = `price-gradient-${themeColor.replace('#', '')}`

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="auto"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={themeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* 라인 아래 그라데이션 영역 */}
          <path d={fillPath} fill={`url(#${gradientId})`} />

          {/* 라인 */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={themeColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 0 기준선 라벨 */}
          <text x={paddingX} y={svgHeight - paddingBottom + 12} fill="var(--text-secondary)" fontSize="10">0</text>

          {/* 최고가 점 + 라벨 */}
          {(() => {
            const maxIdx = prices.indexOf(maxPrice)
            const p = points[maxIdx]
            const labelX = p.x > svgWidth / 2 ? p.x - 4 : p.x + 4
            const anchor = p.x > svgWidth / 2 ? 'end' : 'start'
            return (
              <>
                <circle cx={p.x} cy={p.y} r={3} fill={themeColor} />
                <text x={labelX} y={p.y - 8} textAnchor={anchor} fill={themeColor} fontSize="10" fontWeight="600">
                  최고 {formatKorean(maxPrice)}
                </text>
              </>
            )
          })()}

        </svg>
      </div>
    </div>
  )
}
