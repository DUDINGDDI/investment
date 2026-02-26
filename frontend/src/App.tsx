import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import BoothListPage from './pages/BoothListPage'
import BoothDetailPage from './pages/BoothDetailPage'
import HistoryPage from './pages/HistoryPage'
import ResultPage from './pages/ResultPage'
import MapPage from './pages/MapPage'
import BadgePage from './pages/BadgePage'
import AdminPage from './pages/AdminPage'
import AdminTicketScanPage from './pages/AdminTicketScanPage'
import IdeaBoardPage from './pages/IdeaBoardPage'
import MyPage from './pages/MyPage'
import QrPage from './pages/QrPage'
import ZoneBoothListPage from './pages/ZoneBoothListPage'
import StockHomePage from './pages/StockHomePage'
import StockBoothListPage from './pages/StockBoothListPage'
import StockBoothDetailPage from './pages/StockBoothDetailPage'
import StockHistoryPage from './pages/StockHistoryPage'
import CospiPage from './pages/CospiPage'
import TopTabBar from './components/TopTabBar'
import StockTopTabBar from './components/StockTopTabBar'
import FloatingMenu from './components/FloatingMenu'
import AnnouncementBanner from './components/AnnouncementBanner'
import AppHeader from './components/AppHeader'
import Toast from './components/Toast'
import { ToastProvider } from './components/ToastContext'
import { MissionProvider } from './components/MissionContext'

function PrivateLayout() {
  const token = sessionStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return (
    <div style={{ paddingBottom: '80px' }}>
      <AppHeader />
      <AnnouncementBanner />
      <Outlet />
      <FloatingMenu />
    </div>
  )
}

function WithTopTabBar() {
  return (
    <>
      <TopTabBar />
      <Outlet />
    </>
  )
}

function WithStockTopTabBar() {
  return (
    <>
      <StockTopTabBar />
      <Outlet />
    </>
  )
}

export default function App() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    const updateZoom = () => {
      const vw = window.innerWidth
      if (vw < 480) {
        (root.style as CSSStyleDeclaration & { zoom: string }).zoom = String(vw / 480)
      } else {
        (root.style as CSSStyleDeclaration & { zoom: string }).zoom = ''
      }
    }

    updateZoom()
    window.addEventListener('resize', updateZoom)
    return () => window.removeEventListener('resize', updateZoom)
  }, [])

  return (
    <ToastProvider>
      <MissionProvider>
      <Toast />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<PrivateLayout />}>
          <Route element={<WithTopTabBar />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/booths" element={<BoothListPage />} />
            <Route path="/booths/:id" element={<BoothDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/map/:zoneId" element={<ZoneBoothListPage />} />
            <Route path="/badges" element={<BadgePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/qr" element={<QrPage />} />
          </Route>
          <Route element={<WithStockTopTabBar />}>
            <Route path="/stocks" element={<StockHomePage />} />
            <Route path="/stocks/booths" element={<StockBoothListPage />} />
            <Route path="/stocks/cospi" element={<CospiPage />} />
            <Route path="/stocks/history" element={<StockHistoryPage />} />
          </Route>
          <Route path="/stocks/booths/:id" element={<StockBoothDetailPage />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/ticket-scan" element={<AdminTicketScanPage />} />
        <Route path="/idea-board/:boothId" element={<IdeaBoardPage />} />
      </Routes>
      </MissionProvider>
    </ToastProvider>
  )
}
