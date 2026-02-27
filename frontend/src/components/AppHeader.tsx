import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import cjLogo from '../assets/logo/CJ_Group_White Wordtype.png'
import NotePopup from './NotePopup'
import { noteApi } from '../api'
import styles from './AppHeader.module.css'

export default function AppHeader() {
  const navigate = useNavigate()
  const [noteOpen, setNoteOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = useCallback(() => {
    noteApi.getUnreadCount()
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const handleNoteClose = () => {
    setNoteOpen(false)
    fetchUnreadCount()
  }

  return (
    <>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <img src={cjLogo} alt="CJ" className={styles.logo} />
        <h1 className={styles.title}>2026 ONLYONE FAIR</h1>
        <button className={styles.noteBtn} onClick={() => setNoteOpen(true)} aria-label="쪽지">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 6L12 13L2 6" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {unreadCount > 0 && (
            <span className={styles.noteBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      {noteOpen && <NotePopup onClose={handleNoteClose} />}
    </>
  )
}
