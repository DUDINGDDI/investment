import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import BoothListPage from './pages/BoothListPage'
import BoothDetailPage from './pages/BoothDetailPage'
import HistoryPage from './pages/HistoryPage'
import ResultPage from './pages/ResultPage'
import MapPage from './pages/MapPage'
import BadgePage from './pages/BadgePage'
import AdminPage from './pages/AdminPage'
import BottomNav from './components/BottomNav'
import FloatingMenu from './components/FloatingMenu'
import AnnouncementBanner from './components/AnnouncementBanner'
import Toast from './components/Toast'
import { ToastProvider } from './components/ToastContext'
import { MissionProvider } from './components/MissionContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + var(--safe-area-bottom) + 8px)' }}>
      <AnnouncementBanner />
      {children}
      <FloatingMenu />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <MissionProvider>
        <Toast />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={
            <PrivateRoute><AppLayout><HomePage /></AppLayout></PrivateRoute>
          } />
          <Route path="/booths" element={
            <PrivateRoute><AppLayout><BoothListPage /></AppLayout></PrivateRoute>
          } />
          <Route path="/booths/:id" element={
            <PrivateRoute><AppLayout><BoothDetailPage /></AppLayout></PrivateRoute>
          } />
          <Route path="/map" element={
            <PrivateRoute><AppLayout><MapPage /></AppLayout></PrivateRoute>
          } />
          <Route path="/badges" element={
            <PrivateRoute><AppLayout><BadgePage /></AppLayout></PrivateRoute>
          } />
          <Route path="/history" element={
            <PrivateRoute><AppLayout><HistoryPage /></AppLayout></PrivateRoute>
          } />
          <Route path="/result" element={
            <PrivateRoute><AppLayout><ResultPage /></AppLayout></PrivateRoute>
          } />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </MissionProvider>
    </ToastProvider>
  )
}
