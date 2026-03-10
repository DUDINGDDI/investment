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
  { zoneId: '301', left: 21, top: 14, width: 25, height: 51 },
  { zoneId: '302', left: 54, top: 14, width: 25, height: 51 },
]

const LEADERSHIP_LLF_HOTSPOTS: Hotspot[] = []

/** 이미지 캐시 버스팅 — 배포 시마다 갱신 */
const MAP_VERSION = 'v2'

/** zoneCode → 지도 이미지 + 핫스팟 매핑 */
const ZONE_MAP: Record<string, { image: string; hotspots: Hotspot[] }> = {
  '손복남홀': { image: `/image/map/innovation_ll.png?${MAP_VERSION}`, hotspots: INNOVATION_LL_HOTSPOTS },
  'L01': { image: `/image/map/innovation_ll.png?${MAP_VERSION}`, hotspots: INNOVATION_LL_HOTSPOTS },
  'L02': { image: `/image/map/innovation_ll.png?${MAP_VERSION}`, hotspots: INNOVATION_LL_HOTSPOTS },
  '101': { image: `/image/map/learning_1f.png?${MAP_VERSION}`, hotspots: LEARNING_1F_HOTSPOTS },
  '102': { image: `/image/map/learning_1f.png?${MAP_VERSION}`, hotspots: LEARNING_1F_HOTSPOTS },
  '201': { image: `/image/map/learning_2f.png?${MAP_VERSION}`, hotspots: LEARNING_2F_HOTSPOTS },
  '202': { image: `/image/map/learning_2f.png?${MAP_VERSION}`, hotspots: LEARNING_2F_HOTSPOTS },
  '203': { image: `/image/map/learning_2f.png?${MAP_VERSION}`, hotspots: LEARNING_2F_HOTSPOTS },
  '204': { image: `/image/map/learning_2f.png?${MAP_VERSION}`, hotspots: LEARNING_2F_HOTSPOTS },
  '301': { image: `/image/map/learning_3f.png?${MAP_VERSION}`, hotspots: LEARNING_3F_HOTSPOTS },
  '302': { image: `/image/map/learning_3f.png?${MAP_VERSION}`, hotspots: LEARNING_3F_HOTSPOTS },
  'leadership_llf': { image: `/image/map/leadership_llf.png?${MAP_VERSION}`, hotspots: LEADERSHIP_LLF_HOTSPOTS },
}

/** 부스 미매핑 구역 — 정적 상세 설명 */
const STATIC_ZONE_INFO: Record<string, { name: string; description: string }> = {
  // '201': { name: '교환소', description: '미션 완료시 부여받는 이용권을 굿즈로 교환하실 수 있습니다.' },
  '202': { name: '교환소', description: '미션 완료시 부여받는 키캡 교환권을 사용하실 수 있습니다.' },
  '203': { name: '교환소', description: '미션 완료시 부여받는 키캡 교환권을 사용하실 수 있습니다.' },
  '204': { name: '교환소', description: '미션 완료시 부여받는 키캡 교환권을 사용하실 수 있습니다.' },
  '301': { name: 'AI포토네컷', description: '하고잡이 미션을 3가지 이상 달성시 AI포토네컷을 이용할 수 있는 장소입니다.' },
  '302': { name: 'AI포토네컷', description: '하고잡이 미션을 3가지 이상 달성시 AI포토네컷을 이용할 수 있는 장소입니다.' },
}

const DEFAULT_MAP_IMAGE = `/image/map/leadership_llf.png?${MAP_VERSION}`

/** 건물 선택 시 기본 구역 */
const FLOOR_DEFAULT_ZONE: Record<string, string> = {
  'Grand Hall, Lobby': 'leadership_llf',
  'Innovation Center, LL층': '손복남홀',
  'Learning Center, 1층': '101',
  'Learning Center, 2층': '201',
  'Learning Center, 3층': '301',
}

/** 층(floorInfo) 선택 시 기본 구역 */
const SUB_FLOOR_DEFAULT_ZONE: Record<string, string> = {
  'INNOVATION CENTER LL': '손복남홀',
  'LEARNING CENTER 1층': '101',
  'LEARNING CENTER 2층': '201',
  'LEARNING CENTER 3층': '301',
}

/** zoneCode → floorInfo 정적 폴백 (API에 zone이 없을 때 사용) */
const ZONE_FLOOR_INFO: Record<string, string> = {
  '손복남홀': 'INNOVATION CENTER LL',
  'L01': 'INNOVATION CENTER LL',
  'L02': 'INNOVATION CENTER LL',
  '101': 'LEARNING CENTER 1층',
  '102': 'LEARNING CENTER 1층',
  '201': 'LEARNING CENTER 2층',
  '202': 'LEARNING CENTER 2층',
  '301': 'LEARNING CENTER 3층',
  '302': 'LEARNING CENTER 3층',
}

const PAGE_SIZE = 10

/** 모듈 레벨 zone 캐시 — 지도 데이터는 세션 중 변경되지 않음 */
let zoneCache: ZoneResponse[] | null = null

export default function MapPage() {
  const [zones, setZones] = useState<ZoneResponse[]>(zoneCache ?? [])
  const [selectedFloor, setSelectedFloor] = useState<string>('Grand Hall, Lobby')
  const [filterZoneCode, setFilterZoneCode] = useState<string>('leadership_llf')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  /** floorInfo에서 건물명 파생 (floor 필드 미제공 시 fallback) */
  const getFloor = (zone: ZoneResponse): string => {
    if (zone.floor === 'Grand Hall') return 'Grand Hall, Lobby'
    if (zone.floor) return zone.floor
    if (zone.floorInfo?.includes('INNOVATION')) return 'Innovation Center, LL층'
    if (zone.floorInfo === 'LEARNING CENTER 1층') return 'Learning Center, 1층'
    if (zone.floorInfo === 'LEARNING CENTER 2층') return 'Learning Center, 2층'
    if (zone.floorInfo === 'LEARNING CENTER 3층') return 'Learning Center, 3층'
    return ''
  }

  useEffect(() => {
    if (zoneCache) return
    zoneApi.getAll().then(res => {
      zoneCache = res.data
      setZones(res.data)
    })
  }, [])

  // 건물 목록 (고정)
  const floors = ['Grand Hall, Lobby', 'Innovation Center, LL층', 'Learning Center, 1층', 'Learning Center, 2층', 'Learning Center, 3층']

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
  const currentFloorInfo = currentZone?.floorInfo || ZONE_FLOOR_INFO[filterZoneCode] || ''

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
    // 정적 매핑 먼저 시도, 실패 시 API 데이터에서 동적 탐색
    const defaultZone = SUB_FLOOR_DEFAULT_ZONE[floorInfo]
    if (defaultZone) {
      setFilterZoneCode(defaultZone)
    } else {
      const zone = zones.find((z: ZoneResponse) => z.floorInfo === floorInfo)
      if (zone) {
        setFilterZoneCode(zone.zoneCode)
      }
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
        <h2 className={styles.title}>위치 안내</h2>
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
              <span className={styles.boothFloorInfo}>{selectedZone.floorInfo.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
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
                    style={{ animationDelay: `${i * 0.02}s` }}
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
