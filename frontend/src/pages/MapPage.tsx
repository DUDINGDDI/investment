import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { zoneApi } from '../api'
import type { ZoneResponse, ZoneBoothItem } from '../types'
import styles from './MapPage.module.css'

type Hotspot = { zoneId: string; left: number; top: number; width: number; height: number }

const MAP_IMAGES = ['/image/map2.png', '/image/map1.png', '/image/map3.png']

const MAP_HOTSPOTS_BY_SLIDE: Record<number, Hotspot[]> = {
  0: [
    { zoneId: '손복남홀', left: 60, top: 25, width: 19, height: 58 },
  ],
  1: [
    { zoneId: '101', left: 21, top: 13, width: 27, height: 50 },
    { zoneId: '102', left: 53, top: 13, width: 27, height: 50 },
  ],
  2: [
    { zoneId: '201', left: 53, top: 13, width: 26, height: 43 },
  ],
}

/** zoneCode → 슬라이드 인덱스 매핑 (핫스팟 정보에서 자동 생성) */
const ZONE_TO_SLIDE: Record<string, number> = Object.entries(MAP_HOTSPOTS_BY_SLIDE).reduce(
  (acc, [slideIdx, spots]) => {
    spots.forEach(spot => { acc[spot.zoneId] = Number(slideIdx) })
    return acc
  },
  {} as Record<string, number>,
)

const ZONE_ORDER = ['손복남홀', '101', '102', '201']

const PAGE_SIZE = 10

export default function MapPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [selectedZoneCode, setSelectedZoneCode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterZoneCode, setFilterZoneCode] = useState<string>('all')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    zoneApi.getAll().then(res => setZones(res.data))
  }, [])

  const goTo = useCallback((index: number, skipFilter = false) => {
    if (index < 0 || index >= MAP_IMAGES.length) return
    setCurrentIndex(index)
    if (!skipFilter) {
      const spots = MAP_HOTSPOTS_BY_SLIDE[index] ?? []
      if (spots.length === 1) {
        setSelectedZoneCode(spots[0].zoneId)
        setFilterZoneCode('')
      } else if (spots.length > 1) {
        // 여러 구역이 있는 슬라이드: 해당 구역들만 필터링
        const zoneCodes = spots.map(s => s.zoneId)
        const firstZone = zoneCodes[0]
        setSelectedZoneCode(firstZone)
        setFilterZoneCode('')
      }
      setSearchQuery('')
      setPage(1)
    }
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

  const handleHotspotClick = (zoneId: string) => {
    const isDeselect = selectedZoneCode === zoneId
    setSelectedZoneCode(isDeselect ? null : zoneId)
    setFilterZoneCode(isDeselect ? 'all' : zoneId)
    setSearchQuery('')
    setPage(1)
  }

  // 검색/필터 결과 계산
  const allBooths = useMemo(() => {
    const result: (ZoneBoothItem & { zoneName: string; zoneCode: string })[] = []
    zones.forEach(zone => {
      zone.booths.forEach(booth => {
        result.push({ ...booth, zoneName: zone.name, zoneCode: zone.zoneCode })
      })
    })
    return result
  }, [zones])

  const isFilterActive = filterZoneCode !== '' && filterZoneCode !== 'all'
  const isSearchMode = searchQuery.length > 0 || isFilterActive
  const isShowAll = filterZoneCode === 'all'

  const displayBooths = useMemo(() => {
    if (isShowAll && !searchQuery) {
      return allBooths
    }
    if (isSearchMode) {
      let filtered = allBooths
      if (isFilterActive) {
        filtered = filtered.filter(b => b.zoneCode === filterZoneCode)
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(b => b.name.toLowerCase().includes(q))
      }
      return filtered
    }
    if (selectedZoneCode) {
      const zone = zones.find(z => z.zoneCode === selectedZoneCode)
      if (zone) {
        return zone.booths.map(b => ({ ...b, zoneName: zone.name, zoneCode: zone.zoneCode }))
      }
    }
    return []
  }, [isShowAll, isSearchMode, isFilterActive, searchQuery, filterZoneCode, selectedZoneCode, zones, allBooths])

  const totalPages = Math.ceil(displayBooths.length / PAGE_SIZE)
  const pagedBooths = displayBooths.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectedZone = zones.find(z => z.zoneCode === selectedZoneCode)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setSelectedZoneCode(null)
    setPage(1)
  }

  const handleFilterChange = (value: string) => {
    setFilterZoneCode(value)
    setSelectedZoneCode(null)
    setPage(1)
    if (value && value !== 'all' && value in ZONE_TO_SLIDE) {
      goTo(ZONE_TO_SLIDE[value], true)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showBoothList = displayBooths.length > 0 || isSearchMode || isShowAll || selectedZoneCode

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>행사장 지도</h2>
        <p className={styles.subtitle}>구역을 탭하여 부스 목록을 확인하세요</p>
      </div>

      {/* 검색 + 필터 */}
      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="7" stroke="var(--text-secondary)" strokeWidth="2"/>
            <path d="M16 16L21 21" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="부스명 검색"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              className={styles.clearBtn}
              onClick={() => handleSearchChange('')}
              aria-label="검색어 지우기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <div className={styles.filterRow}>
          <button
            className={`${styles.filterChip} ${filterZoneCode === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            전체
          </button>
          {[...zones].sort((a, b) => {
            const ai = ZONE_ORDER.indexOf(a.zoneCode)
            const bi = ZONE_ORDER.indexOf(b.zoneCode)
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
          }).map(zone => (
            <button
              key={zone.zoneCode}
              className={`${styles.filterChip} ${filterZoneCode === zone.zoneCode ? styles.filterChipActive : ''}`}
              onClick={() => handleFilterChange(filterZoneCode === zone.zoneCode ? 'all' : zone.zoneCode)}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* 캐러셀 */}
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
                    className={`${styles.hotspot} ${selectedZoneCode === spot.zoneId ? styles.hotspotSelected : ''}`}
                    style={{
                      left: `${spot.left}%`,
                      top: `${spot.top}%`,
                      width: `${spot.width}%`,
                      height: `${spot.height}%`,
                    }}
                    onClick={() => handleHotspotClick(spot.zoneId)}
                    aria-label={`${spot.zoneId} 구역`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

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

      {/* 인디케이터 */}
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

      {/* 부스 목록 (하단) */}
      {showBoothList && (
        <div className={styles.boothSection}>
          <div className={styles.boothHeader}>
            <h3 className={styles.boothTitle}>
              {isSearchMode
                ? `검색 결과 (${displayBooths.length}개)`
                : isShowAll
                  ? `전체 부스 (${displayBooths.length}개)`
                  : `${selectedZone?.name ?? ''} 구역 부스`
              }
            </h3>
            {!isSearchMode && !isShowAll && selectedZoneCode && selectedZone && (
              <span className={styles.boothFloorInfo}>{selectedZone.floorInfo}</span>
            )}
          </div>

          {pagedBooths.length > 0 ? (
            <>
              <div className={styles.boothList} ref={listRef}>
                {pagedBooths.map((booth, i) => (
                  <div
                    key={booth.id}
                    className={`${styles.boothCard} stagger-item`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => navigate(`/stocks/booths/${booth.id}`)}
                  >
                    <div className={styles.boothIcon} style={{ background: booth.themeColor + '30' }}>
                      <span>{booth.logoEmoji}</span>
                    </div>
                    <div className={styles.boothBody}>
                      <p className={styles.boothName}>{booth.name}</p>
                      <p className={styles.boothDesc}>
                        {(isSearchMode || isShowAll) && <span className={styles.boothZoneTag}>{booth.zoneName}</span>}
                        {booth.shortDescription}
                      </p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.chevron}>
                      <path d="M9 6L15 12L9 18" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    이전
                  </button>
                  <span className={styles.pageInfo}>{page} / {totalPages}</span>
                  <button
                    className={styles.pageBtn}
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyList}>
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
