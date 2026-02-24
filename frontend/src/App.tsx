import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import BoothListPage from './pages/BoothListPage'
import BoothDetailPage from './pages/BoothDetailPage'
import HistoryPage from './pages/HistoryPage'
import ResultPage from './pages/ResultPage'
import MapPage from './pages/MapPage'
import ZoneBoothListPage from './pages/ZoneBoothListPage'
import AdminPage from './pages/AdminPage'
import MyPage from './pages/MyPage'
import QrPage from './pages/QrPage'
import TopTabBar from './components/TopTabBar'
import FloatingMenu from './components/FloatingMenu'
import AnnouncementBanner from './components/AnnouncementBanner'
import AppHeader from './components/AppHeader'
import Toast from './components/Toast'
import { ToastProvider } from './components/ToastContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <AppHeader />
      <AnnouncementBanner />
      <TopTabBar />
      {children}
      <FloatingMenu />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
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
        <Route path="/map/:zoneId" element={
          <PrivateRoute><AppLayout><ZoneBoothListPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute><AppLayout><HistoryPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/result" element={
          <PrivateRoute><AppLayout><ResultPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/mypage" element={
          <PrivateRoute><AppLayout><MyPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/qr" element={
          <PrivateRoute><AppLayout><QrPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </ToastProvider>
  )
}
