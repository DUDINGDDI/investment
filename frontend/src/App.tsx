import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import BoothListPage from './pages/BoothListPage'
import BoothDetailPage from './pages/BoothDetailPage'
import HistoryPage from './pages/HistoryPage'
import ResultPage from './pages/ResultPage'
import MapPage from './pages/MapPage'

import AdminPage from './pages/AdminPage'
import AdminTicketScanPage from './pages/AdminTicketScanPage'
import AdminExecutivePage from './pages/AdminExecutivePage'
import IdeaBoardPage from './pages/IdeaBoardPage'
import MyPage from './pages/MyPage'
import QrPage from './pages/QrPage'
import ZoneBoothListPage from './pages/ZoneBoothListPage'
import StockHomePage from './pages/StockHomePage'
import StockBoothListPage from './pages/StockBoothListPage'
import StockBoothDetailPage from './pages/StockBoothDetailPage'
import StockHistoryPage from './pages/StockHistoryPage'
// import ReportPage from './pages/ReportPage'

import { PmInvestmentGate } from './components/InvestmentGate'
import BottomNavBar from './components/BottomNavBar'
import AnnouncementBanner from './components/AnnouncementBanner'
import AppHeader from './components/AppHeader'
import Toast from './components/Toast'
import { ToastProvider } from './components/ToastContext'
import { MissionProvider } from './components/MissionContext'
import MissionCompletePopup from './components/MissionCompletePopup'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PrivateLayout() {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return (
    <div style={{ paddingBottom: '80px' }}>
      <AppHeader />
      <AnnouncementBanner />
      <Outlet />
      <BottomNavBar />
    </div>
  )
}

function WithTopTabBar() {
  return (
    <>
      <Outlet />
    </>
  )
}

function WithStockTopTabBar() {
  return (
    <>
      <Outlet />
    </>
  )
}

export default function App() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    const updateZoom = () => {
      const maxWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--app-max-width'))
      const vw = window.innerWidth
      if (vw < maxWidth) {
        // 작은 화면: 축소
        (root.style as CSSStyleDeclaration & { zoom: string }).zoom = String(vw / maxWidth)
      } else if (vw > maxWidth * 1.1) {
        // 태블릿/큰 화면: 뷰포트의 92%를 채우도록 확대
        const scale = Math.min((vw * 0.92) / maxWidth, 2.0)
        ;(root.style as CSSStyleDeclaration & { zoom: string }).zoom = String(scale)
      } else {
        (root.style as CSSStyleDeclaration & { zoom: string }).zoom = ''
      }
    }

    updateZoom()
    window.addEventListener('resize', updateZoom)

    // PWA 또는 태블릿: 첫 터치 시 전체화면 진입
    const requestFullscreen = () => {
      const doc = document.documentElement
      if (!document.fullscreenElement && doc.requestFullscreen) {
        doc.requestFullscreen().catch(() => {})
      }
      document.removeEventListener('click', requestFullscreen)
    }
    // standalone 모드(홈화면 추가)이거나 태블릿 크기일 때 전체화면 시도
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || (navigator as unknown as { standalone: boolean }).standalone
    if (isStandalone || window.innerWidth >= 768) {
      document.addEventListener('click', requestFullscreen)
    }

    return () => {
      window.removeEventListener('resize', updateZoom)
      document.removeEventListener('click', requestFullscreen)
    }
  }, [])

  return (
    <ToastProvider>
      <MissionProvider>
      <ScrollToTop />
      <Toast />
      <MissionCompletePopup />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<PrivateLayout />}>
          <Route element={<WithTopTabBar />}>
            <Route element={<PmInvestmentGate />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/booths" element={<BoothListPage />} />
              <Route path="/booths/:id" element={<BoothDetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
            <Route path="/map" element={<MapPage />} />
            <Route path="/map/:zoneId" element={<ZoneBoothListPage />} />
            <Route path="/result" element={<ResultPage />} />
            {/* <Route path="/report" element={<ReportPage />} /> */}
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/qr" element={<QrPage />} />
          </Route>
          <Route element={<WithStockTopTabBar />}>
            <Route path="/stocks" element={<StockHomePage />} />
            <Route path="/stocks/booths" element={<StockBoothListPage />} />
            <Route path="/stocks/history" element={<StockHistoryPage />} />
          </Route>
          <Route path="/stocks/booths/:id" element={<StockBoothDetailPage />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/ticket-scan" element={<AdminTicketScanPage />} />
        <Route path="/executive" element={<AdminExecutivePage />} />
        <Route path="/idea-board/:boothId" element={<IdeaBoardPage />} />
      </Routes>
      </MissionProvider>
    </ToastProvider>
  )
}
