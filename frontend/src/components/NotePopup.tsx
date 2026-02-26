import { useState, useEffect } from 'react'
import { noteApi } from '../api'
import { useToast } from './ToastContext'
import type { NoteResponse, UserSearchResponse } from '../types'
import styles from './NotePopup.module.css'

interface Props {
  onClose: () => void
}

type Tab = 'received' | 'sent' | 'compose'

export default function NotePopup({ onClose }: Props) {
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('received')

  const [receivedNotes, setReceivedNotes] = useState<NoteResponse[]>([])
  const [sentNotes, setSentNotes] = useState<NoteResponse[]>([])

  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResponse[]>([])
  const [selectedUser, setSelectedUser] = useState<UserSearchResponse | null>(null)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (tab === 'received') {
      noteApi.getReceived().then(res => setReceivedNotes(res.data)).catch(() => {})
    }
  }, [tab])

  useEffect(() => {
    if (tab === 'sent') {
      noteApi.getSent().then(res => setSentNotes(res.data)).catch(() => {})
    }
  }, [tab])

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return
    try {
      const res = await noteApi.searchUsers(searchKeyword.trim())
      setSearchResults(res.data)
    } catch {
      showToast('검색 중 오류가 발생했습니다', 'error')
    }
  }

  const handleSelectUser = (user: UserSearchResponse) => {
    setSelectedUser(user)
    setSearchResults([])
    setSearchKeyword('')
  }

  const handleSend = async () => {
    if (!selectedUser || !content.trim()) return
    setSending(true)
    try {
      await noteApi.send({ receiverId: selectedUser.userId, content: content.trim() })
      showToast('쪽지가 전송되었습니다', 'success')
      setContent('')
      setSelectedUser(null)
      setTab('sent')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || '전송에 실패했습니다'
      showToast(msg, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (noteId: number) => {
    try {
      await noteApi.markAsRead(noteId)
      setReceivedNotes(prev => prev.map(n => n.id === noteId ? { ...n, isRead: true } : n))
    } catch {
      // 무시
    }
  }

  const handleReply = (note: NoteResponse) => {
    handleMarkAsRead(note.id)
    setSelectedUser({ userId: note.senderId, name: note.senderName, company: note.senderCompany, uniqueCode: '' })
    setContent('')
    setTab('compose')
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return '방금'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={e => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <h2 className={styles.popupTitle}>쪽지</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'received' ? styles.tabActive : ''}`}
            onClick={() => setTab('received')}
          >받은 쪽지</button>
          <button
            className={`${styles.tab} ${tab === 'sent' ? styles.tabActive : ''}`}
            onClick={() => setTab('sent')}
          >보낸 쪽지</button>
          <button
            className={`${styles.tab} ${tab === 'compose' ? styles.tabActive : ''}`}
            onClick={() => setTab('compose')}
          >쪽지 보내기</button>
        </div>

        <div className={styles.popupBody}>
          {tab === 'received' && (
            receivedNotes.length === 0 ? (
              <p className={styles.empty}>받은 쪽지가 없습니다</p>
            ) : (
              receivedNotes.map(note => (
                <div
                  key={note.id}
                  className={`${styles.noteItem} ${!note.isRead ? styles.noteUnread : ''}`}
                  onClick={() => handleMarkAsRead(note.id)}
                >
                  <div className={styles.noteTop}>
                    <span className={styles.noteSender}>from {note.senderName}{note.senderCompany ? ` · ${note.senderCompany}` : ''}</span>
                    <span className={styles.noteTime}>{formatTime(note.createdAt)}</span>
                  </div>
                  <p className={styles.noteContent}>{note.content}</p>
                  <button
                    className={styles.replyBtn}
                    onClick={(e) => { e.stopPropagation(); handleReply(note) }}
                  >답장</button>
                </div>
              ))
            )
          )}

          {tab === 'sent' && (
            sentNotes.length === 0 ? (
              <p className={styles.empty}>보낸 쪽지가 없습니다</p>
            ) : (
              sentNotes.map(note => (
                <div key={note.id} className={styles.noteItem}>
                  <div className={styles.noteTop}>
                    <span className={styles.noteSender}>To. {note.receiverName}{note.receiverCompany ? ` · ${note.receiverCompany}` : ''}</span>
                    <span className={styles.noteTime}>{formatTime(note.createdAt)}</span>
                  </div>
                  <p className={styles.noteContent}>{note.content}</p>
                </div>
              ))
            )
          )}

          {tab === 'compose' && (
            <div className={styles.composeArea}>
              {selectedUser ? (
                <div className={styles.selectedUser}>
                  <span>To: {selectedUser.name}{selectedUser.company ? ` · ${selectedUser.company}` : ''}</span>
                  <button onClick={() => setSelectedUser(null)} className={styles.clearBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className={styles.searchArea}>
                  <input
                    className={styles.searchInput}
                    placeholder="이름으로 검색..."
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <button className={styles.searchBtn} onClick={handleSearch}>검색</button>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map(user => (
                    <button
                      key={user.userId}
                      className={styles.userItem}
                      onClick={() => handleSelectUser(user)}
                    >
                      <span className={styles.userName}>{user.name}{user.company ? ` · ${user.company}` : ''}</span>
                      <span className={styles.userCode}>{user.uniqueCode}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedUser && (
                <>
                  <div className={styles.inputArea}>
                    <textarea
                      className={styles.messageInput}
                      placeholder="쪽지 내용 (50자 이내)"
                      maxLength={50}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      rows={3}
                    />
                    <span className={styles.charCount}>{content.length}/50</span>
                  </div>
                  <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={sending || !content.trim()}
                  >
                    {sending ? '전송 중...' : '보내기'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
