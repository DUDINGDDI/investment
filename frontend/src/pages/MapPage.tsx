import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { zoneApi } from '../api'
import type { ZoneResponse, ZoneBoothItem } from '../types'
import styles from './MapPage.module.css'

type Hotspot = { zoneId: string; left: number; top: number; width: number; height: number }

/** 이미지별 핫스팟 좌표 (% 기준) */
const INNOVATION_LL_HOTSPOTS: Hotspot[] = [
  { zoneId: 'L01', left: 26, top: 10, width: 17, height: 30 },
  { zoneId: 'L02', left: 43, top: 10, width: 17, height: 30 },
  { zoneId: '손복남홀', left: 60, top: 25, width: 19, height: 58 },
]

const LEARNING_1F_HOTSPOTS: Hotspot[] = [
  { zoneId: '101', left: 21, top: 14, width: 26, height: 49 },
  { zoneId: '102', left: 53, top: 14, width: 26, height: 49 },
]

const LEARNING_2F_HOTSPOTS: Hotspot[] = [
  { zoneId: '204', left: 21, top: 14, width: 16, height: 18 },
  { zoneId: '203', left: 21, top: 32, width: 16, height: 18 },
  { zoneId: '202', left: 21, top: 51, width: 16, height: 18 },
  { zoneId: '201', left: 53, top: 14, width: 26, height: 42 },
]

const LEARNING_3F_HOTSPOTS: Hotspot[] = [
  { zoneId: '301', left: 21, top: 28, width: 25, height: 51 },
  { zoneId: '302', left: 54, top: 28, width: 25, height: 51 },
]

/** zoneCode → 지도 이미지 + 핫스팟 매핑 */
const ZONE_MAP: Record<string, { image: string; hotspots: Hotspot[] }> = {
  '손복남홀': { image: '/image/map/innovation_ll.png', hotspots: INNOVATION_LL_HOTSPOTS },
  'L01': { image: '/image/map/innovation_ll.png', hotspots: INNOVATION_LL_HOTSPOTS },
  'L02': { image: '/image/map/innovation_ll.png', hotspots: INNOVATION_LL_HOTSPOTS },
  '101': { image: '/image/map/learning_1f.png', hotspots: LEARNING_1F_HOTSPOTS },
  '102': { image: '/image/map/learning_1f.png', hotspots: LEARNING_1F_HOTSPOTS },
  '201': { image: '/image/map/learning_2f.png', hotspots: LEARNING_2F_HOTSPOTS },
  '202': { image: '/image/map/learning_2f.png', hotspots: LEARNING_2F_HOTSPOTS },
  '203': { image: '/image/map/learning_2f.png', hotspots: LEARNING_2F_HOTSPOTS },
  '204': { image: '/image/map/learning_2f.png', hotspots: LEARNING_2F_HOTSPOTS },
  '301': { image: '/image/map/learning_3f.png', hotspots: LEARNING_3F_HOTSPOTS },
  '302': { image: '/image/map/learning_3f.png', hotspots: LEARNING_3F_HOTSPOTS },
}

/** 부스 미매핑 구역 — 정적 상세 설명 */
const STATIC_ZONE_INFO: Record<string, { name: string; description: string }> = {
  '201': { name: '교환소', description: '미션 완료시 부여받는 이용권을 굿즈로 교환하실 수 있습니다.' },
  '202': { name: '가챠 존', description: '미션 완료시 부여받는 가챠 교환권을 사용하실 수 있습니다.' },
  '203': { name: '가챠 존', description: '미션 완료시 부여받는 가챠 교환권을 사용하실 수 있습니다.' },
  '204': { name: '가챠 존', description: '미션 완료시 부여받는 가챠 교환권을 사용하실 수 있습니다.' },
  '301': { name: '2026 ONLYONE FAIR 대표작 전시 및 AI 포토부스', description: '2026 ONLYONE FAIR 대표작 전시 공간임과 동시에 미션 완료시 부여받는 AI 포토부스 교환권을 사용하실 수 있습니다.' },
  '302': { name: '2026 ONLYONE FAIR 대표작 전시 및 AI 포토부스', description: '2026 ONLYONE FAIR 대표작 전시 공간임과 동시에 미션 완료시 부여받는 AI 포토부스 교환권을 사용하실 수 있습니다.' },
}

const DEFAULT_MAP_IMAGE = '/image/map/leadership_b1f.png'

/** 건물 선택 시 기본 구역 */
const FLOOR_DEFAULT_ZONE: Record<string, string> = {
  'Innovation Center': '손복남홀',
  'Learning Center': '101',
}

/** 층(floorInfo) 선택 시 기본 구역 */
const SUB_FLOOR_DEFAULT_ZONE: Record<string, string> = {
  'INNOVATION CENTER LL': '손복남홀',
  'LEADERSHIP CENTER 1F': '101',
  'LEADERSHIP CENTER 2F': '201',
  'LEADERSHIP CENTER 3F': '301',
}

const PAGE_SIZE = 10

export default function MapPage() {
  const [zones, setZones] = useState<ZoneResponse[]>([])
  const [selectedFloor, setSelectedFloor] = useState<string>('Innovation Center')
  const [filterZoneCode, setFilterZoneCode] = useState<string>('손복남홀')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  /** floorInfo에서 건물명 파생 (floor 필드 미제공 시 fallback) */
  const getFloor = (zone: ZoneResponse): string => {
    if (zone.floor) return zone.floor
    if (zone.floorInfo?.includes('INNOVATION')) return 'Innovation Center'
    if (zone.floorInfo?.includes('LEADERSHIP')) return 'Learning Center'
    return ''
  }

  useEffect(() => {
    zoneApi.getAll().then(res => setZones(res.data))
  }, [])

  // 유니크 건물 목록 (floor 기준, displayOrder 순)
  const floors = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    zones.forEach(z => {
      const f = getFloor(z)
      if (f && !seen.has(f)) {
        seen.add(f)
        result.push(f)
      }
    })
    return result
  }, [zones])

  // 선택된 건물의 서브 층 목록
  const subFloors = useMemo(() => {
    const zonesInFloor = zones.filter(z => getFloor(z) === selectedFloor)
    const seen = new Set<string>()
    const result: { label: string; floorInfo: string }[] = []
    zonesInFloor.forEach(z => {
      if (z.floorInfo && !seen.has(z.floorInfo)) {
        seen.add(z.floorInfo)
        const parts = z.floorInfo.split(' ')
        const label = parts[parts.length - 1]
        result.push({ label, floorInfo: z.floorInfo })
      }
    })
    return result
  }, [zones, selectedFloor])

  // 현재 선택된 구역의 floorInfo
  const currentZone = zones.find(z => z.zoneCode === filterZoneCode)
  const currentFloorInfo = currentZone?.floorInfo || ''

  // 현재 필터에 따른 지도 이미지 및 핫스팟
  const currentMap = useMemo(() => {
    if (filterZoneCode && ZONE_MAP[filterZoneCode]) {
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
    return allBooths.filter(b => b.zoneCode === filterZoneCode)
  }, [filterZoneCode, allBooths])

  const totalPages = Math.ceil(displayBooths.length / PAGE_SIZE)
  const pagedBooths = displayBooths.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectedZone = zones.find(z => z.zoneCode === filterZoneCode)

  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor)
    const defaultZone = FLOOR_DEFAULT_ZONE[floor]
    if (defaultZone) {
      setFilterZoneCode(defaultZone)
    }
    setPage(1)
  }

  const handleSubFloorChange = (floorInfo: string) => {
    const defaultZone = SUB_FLOOR_DEFAULT_ZONE[floorInfo]
    if (defaultZone) {
      setFilterZoneCode(defaultZone)
    }
    setPage(1)
  }

  const handleHotspotClick = (zoneId: string) => {
    setFilterZoneCode(zoneId)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>행사장 지도</h2>
        <p className={styles.subtitle}>구역을 선택하여 부스 목록을 확인하세요</p>
      </div>

      {/* 건물 필터 */}
      <div className={styles.filterArea}>
        <div className={styles.filterRow}>
          {floors.map(floor => (
            <button
              key={floor}
              className={`${styles.filterChip} ${selectedFloor === floor ? styles.filterChipActive : ''}`}
              onClick={() => handleFloorChange(floor)}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* 층 서브탭 (2개 이상일 때만 표시) */}
        {subFloors.length > 1 && (
          <div className={styles.subFloorRow}>
            {subFloors.map(sf => (
              <button
                key={sf.floorInfo}
                className={`${styles.subFloorChip} ${currentFloorInfo === sf.floorInfo ? styles.subFloorChipActive : ''}`}
                onClick={() => handleSubFloorChange(sf.floorInfo)}
              >
                {sf.label}
              </button>
            ))}
          </div>
        )}
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
      <div className={styles.boothSection}>
          <div className={styles.boothHeader}>
            <h3 className={styles.boothTitle}>
              {STATIC_ZONE_INFO[filterZoneCode]
                ? `${selectedZone?.name ?? ''} 구역 안내`
                : `${selectedZone?.name ?? ''} 구역 부스`
              }
            </h3>
            {selectedZone && (
              <span className={styles.boothFloorInfo}>{selectedZone.floorInfo}</span>
            )}
          </div>

          {STATIC_ZONE_INFO[filterZoneCode] ? (
            <div className={styles.staticZoneCard}>
              <p className={styles.staticZoneName}>{STATIC_ZONE_INFO[filterZoneCode].name}</p>
              <p className={styles.staticZoneDesc}>{STATIC_ZONE_INFO[filterZoneCode].description}</p>
            </div>
          ) : pagedBooths.length > 0 ? (
            <>
              <div className={styles.boothList} ref={listRef}>
                {pagedBooths.map((booth, i) => (
                  <div
                    key={booth.id}
                    className={`${styles.boothCard} stagger-item`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => navigate(`/stocks/booths/${booth.id}`)}
                  >
                    <div className={styles.boothBody}>
                      <p className={styles.boothName}>{booth.name}</p>
                      <p className={styles.boothDesc}>
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
              {(
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    ‹ 이전
                  </button>
                  <span className={styles.pageInfo}>{page} / {totalPages || 1}</span>
                  <button
                    className={styles.pageBtn}
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    다음 ›
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyList}>
              <p>등록된 부스가 없습니다.</p>
            </div>
          )}
        </div>
    </div>
  )
}
