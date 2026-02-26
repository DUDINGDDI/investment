import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { zoneApi } from '../api'
import type { ZoneResponse, ZoneBoothItem } from '../types'
import styles from './MapPage.module.css'

type Hotspot = { zoneId: string; left: number; top: number; width: number; height: number }

/** zoneCode → 지도 이미지 + 핫스팟 매핑 */
const ZONE_MAP: Record<string, { image: string; hotspots: Hotspot[] }> = {
  '손복남홀': {
    image: '/image/map2.png',
    hotspots: [{ zoneId: '손복남홀', left: 60, top: 25, width: 19, height: 58 }],
  },
  '101': {
    image: '/image/map1.png',
    hotspots: [
      { zoneId: '101', left: 21, top: 13, width: 27, height: 50 },
      { zoneId: '102', left: 53, top: 13, width: 27, height: 50 },
    ],
  },
  '102': {
    image: '/image/map1.png',
    hotspots: [
      { zoneId: '101', left: 21, top: 13, width: 27, height: 50 },
      { zoneId: '102', left: 53, top: 13, width: 27, height: 50 },
    ],
  },
  '201': {
    image: '/image/map3.png',
    hotspots: [{ zoneId: '201', left: 53, top: 13, width: 26, height: 43 }],
  },
}

const DEFAULT_MAP_IMAGE = '/image/map2.png'

const ZONE_ORDER = ['손복남홀', '101', '102', '201']

const PAGE_SIZE = 10

export default function MapPage() {
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterZoneCode, setFilterZoneCode] = useState<string>('손복남홀')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    zoneApi.getAll().then(res => setZones(res.data))
  }, [])

  // 현재 필터에 따른 지도 이미지 및 핫스팟
  const currentMap = useMemo(() => {
    if (filterZoneCode && filterZoneCode !== 'all' && ZONE_MAP[filterZoneCode]) {
      return ZONE_MAP[filterZoneCode]
    }
    return { image: DEFAULT_MAP_IMAGE, hotspots: [] as Hotspot[] }
  }, [filterZoneCode])

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

  const displayBooths = useMemo(() => {
    let filtered = allBooths.filter(b => b.zoneCode === filterZoneCode)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(b => b.name.toLowerCase().includes(q))
    }
    return filtered
  }, [searchQuery, filterZoneCode, allBooths])

  const totalPages = Math.ceil(displayBooths.length / PAGE_SIZE)
  const pagedBooths = displayBooths.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectedZone = zones.find(z => z.zoneCode === filterZoneCode)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleFilterChange = (value: string) => {
    setFilterZoneCode(value)
    setSearchQuery('')
    setPage(1)
  }

  const handleHotspotClick = (zoneId: string) => {
    setFilterZoneCode(zoneId)
    setSearchQuery('')
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showBoothList = displayBooths.length > 0 || searchQuery.length > 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>행사장 지도</h2>
        <p className={styles.subtitle}>구역을 선택하여 부스 목록을 확인하세요</p>
      </div>

      {/* 필터 */}
      <div className={styles.filterArea}>
        <div className={styles.filterRow}>
          {[...zones].sort((a, b) => {
            const ai = ZONE_ORDER.indexOf(a.zoneCode)
            const bi = ZONE_ORDER.indexOf(b.zoneCode)
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
          }).map(zone => (
            <button
              key={zone.zoneCode}
              className={`${styles.filterChip} ${filterZoneCode === zone.zoneCode ? styles.filterChipActive : ''}`}
              onClick={() => handleFilterChange(zone.zoneCode)}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* 지도 이미지 */}
      <div className={styles.mapImage}>
        <div className={styles.imageWrapper}>
          <img src={currentMap.image} alt="행사장 지도" className={styles.image} draggable={false} />
          {currentMap.hotspots.map(spot => (
            <button
              key={spot.zoneId}
              className={`${styles.hotspot} ${filterZoneCode === spot.zoneId ? styles.hotspotSelected : ''}`}
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

      {/* 부스 목록 (하단) */}
      {showBoothList && (
        <div className={styles.boothSection}>
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
          <div className={styles.boothHeader}>
            <h3 className={styles.boothTitle}>
              {searchQuery
                ? `검색 결과 (${displayBooths.length}개)`
                : `${selectedZone?.name ?? ''} 구역 부스`
              }
            </h3>
            {selectedZone && (
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
                        {searchQuery && <span className={styles.boothZoneTag}>{booth.zoneName}</span>}
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
