import { useMissions } from './MissionContext'
import styles from './MissionCompletePopup.module.css'

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const CONFETTI_STYLES: React.CSSProperties[] = Array.from({ length: 40 }, (_, i) => {
  const colors = ['#6C63FF', '#4593FC', '#F5C842', '#00D68F', '#F04452', '#FF8A65']
  return {
    '--x': `${(seededRandom(i * 3) - 0.5) * 300}px`,
    '--y': `${-seededRandom(i * 3 + 1) * 400 - 100}px`,
    '--r': `${seededRandom(i * 3 + 2) * 720 - 360}deg`,
    '--delay': `${i * 0.03}s`,
    backgroundColor: colors[i % colors.length],
  } as React.CSSProperties
})

export default function MissionCompletePopup() {
  const { newlyCompletedMission, clearNewlyCompleted } = useMissions()

  if (!newlyCompletedMission) return null

  return (
    <>
      <div className={styles.overlay} onClick={clearNewlyCompleted}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.badgeWrap}>
            <img
              src={newlyCompletedMission.icon}
              alt={newlyCompletedMission.title}
              className={styles.badgeImg}
              draggable={false}
            />
          </div>
          <h3 className={styles.title}>미션 완료!</h3>
          <p className={styles.desc}>
            {newlyCompletedMission.title} 배지를 획득했습니다
          </p>
          <button className={styles.button} onClick={clearNewlyCompleted}>확인</button>
        </div>
      </div>

      <div className={styles.confettiContainer}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className={styles.confetti} style={CONFETTI_STYLES[i]} />
        ))}
      </div>
    </>
  )
}
