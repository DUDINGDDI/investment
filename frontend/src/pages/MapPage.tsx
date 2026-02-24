import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MapPage.module.css'

type Hotspot = { zoneId: string; left: number; top: number; width: number; height: number }

const MAP_IMAGES = ['/image/map1.png', '/image/map2.png', '/image/map3.png']
/** 슬라이드별 클릭 가능한 구역 핫스팟 좌표 (% 기반) */
const MAP_HOTSPOTS_BY_SLIDE: Record<number, Hotspot[]> = {
  // map1.png — LEADERSHIP CENTER 1F (843×596)
  0: [
    { zoneId: '101', left: 21, top: 13, width: 27, height: 50 },
    { zoneId: '102', left: 53, top: 13, width: 27, height: 50 },
  ],
  // map2.png — INNOVATION CENTER LL (843×596)
  1: [
    // { zoneId: 'L01', left: 15, top: 9, width: 19, height: 22 },
    // { zoneId: 'L02', left: 36, top: 9, width: 30, height: 22 },
    { zoneId: '손복남홀', left: 60, top: 25, width: 19, height: 58 },
  ],
  // map3.png — LEADERSHIP CENTER 2F (843×596)
  2: [
    { zoneId: '201', left: 53, top: 13, width: 26, height: 43 },
  ],
}

export default function MapPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  // 스와이프 처리
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= MAP_IMAGES.length) return
    setCurrentIndex(index)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(currentIndex + 1)
      else goTo(currentIndex - 1)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>행사장 지도</h2>
        <p className={styles.subtitle}>구역을 탭하여 부스 목록을 확인하세요</p>
      </div>

      <div
        className={styles.carousel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.track}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {MAP_IMAGES.map((src, i) => (
            <div key={src} className={styles.slide}>
              <div className={styles.imageWrapper}>
                <img src={src} alt={`지도 ${i + 1}`} className={styles.image} draggable={false} />
                {(MAP_HOTSPOTS_BY_SLIDE[i] ?? []).map(spot => (
                  <button
                    key={spot.zoneId}
                    className={styles.hotspot}
                    style={{
                      left: `${spot.left}%`,
                      top: `${spot.top}%`,
                      width: `${spot.width}%`,
                      height: `${spot.height}%`,
                    }}
                    onClick={() => navigate(`/map/${spot.zoneId}`)}
                    aria-label={`${spot.zoneId} 구역`}
                  >
                    {/* <span className={styles.hotspotLabel}>{spot.zoneId}</span> */}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 좌우 화살표 */}
        {currentIndex > 0 && (
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => goTo(currentIndex - 1)} aria-label="이전">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        {currentIndex < MAP_IMAGES.length - 1 && (
          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => goTo(currentIndex + 1)} aria-label="다음">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>

      {/* 슬라이드 인디케이터 */}
      <div className={styles.indicator}>
        <span className={styles.indicatorText}>{currentIndex + 1} / {MAP_IMAGES.length}</span>
        <div className={styles.dots}>
          {MAP_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
