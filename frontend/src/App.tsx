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
import MyPage from './pages/MyPage'
import QrPage from './pages/QrPage'
import ZoneBoothListPage from './pages/ZoneBoothListPage'
import StockHomePage from './pages/StockHomePage'
import StockBoothListPage from './pages/StockBoothListPage'
import StockBoothDetailPage from './pages/StockBoothDetailPage'
import StockHistoryPage from './pages/StockHistoryPage'
import TopTabBar from './components/TopTabBar'
import StockTopTabBar from './components/StockTopTabBar'
import FloatingMenu from './components/FloatingMenu'
import AnnouncementBanner from './components/AnnouncementBanner'
import AppHeader from './components/AppHeader'
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
    <div style={{ paddingBottom: '80px' }}>
      <AppHeader />
      <AnnouncementBanner />
      <TopTabBar />
      {children}
      <FloatingMenu />
    </div>
  )
}

function StockAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <AppHeader />
      <AnnouncementBanner />
      <StockTopTabBar />
      {children}
      <FloatingMenu />
    </div>
  )
}

function StockDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <AppHeader />
      <AnnouncementBanner />
      {children}
      <FloatingMenu />
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
        <Route path="/map/:zoneId" element={
          <PrivateRoute><AppLayout><ZoneBoothListPage /></AppLayout></PrivateRoute>
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
        <Route path="/mypage" element={
          <PrivateRoute><AppLayout><MyPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/qr" element={
          <PrivateRoute><AppLayout><QrPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/stocks" element={
          <PrivateRoute><StockAppLayout><StockHomePage /></StockAppLayout></PrivateRoute>
        } />
        <Route path="/stocks/booths" element={
          <PrivateRoute><StockAppLayout><StockBoothListPage /></StockAppLayout></PrivateRoute>
        } />
        <Route path="/stocks/booths/:id" element={
          <PrivateRoute><StockDetailLayout><StockBoothDetailPage /></StockDetailLayout></PrivateRoute>
        } />
        <Route path="/stocks/history" element={
          <PrivateRoute><StockAppLayout><StockHistoryPage /></StockAppLayout></PrivateRoute>
        } />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      </MissionProvider>
    </ToastProvider>
  )
}
