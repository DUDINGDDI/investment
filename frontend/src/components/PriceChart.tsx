import styles from './PriceChart.module.css'

interface PriceChartProps {
  priceHistory: { price: number; changedAt: string }[]
  themeColor: string
}

function formatPrice(n: number): string {
  if (n >= 1_0000_0000_0000) return `${(n / 1_0000_0000_0000).toFixed(1)}조`
  if (n >= 1_0000_0000) return `${Math.floor(n / 1_0000_0000)}억`
  if (n >= 1_0000) return `${Math.floor(n / 1_0000)}만`
  return n.toLocaleString('ko-KR')
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

          {/* 최고가 점 */}
          {(() => {
            const maxIdx = prices.indexOf(maxPrice)
            const p = points[maxIdx]
            return <circle cx={p.x} cy={p.y} r={3} fill={themeColor} />
          })()}

          {/* 최저가 점 */}
          {(() => {
            const minIdx = prices.indexOf(minPrice)
            const p = points[minIdx]
            return <circle cx={p.x} cy={p.y} r={3} fill={themeColor} />
          })()}
        </svg>

        <div className={styles.priceRange}>
          <span>최저 {formatPrice(minPrice)}</span>
          <span>최고 {formatPrice(maxPrice)}</span>
        </div>
      </div>
    </div>
  )
}
