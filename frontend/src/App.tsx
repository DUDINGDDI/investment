import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import BoothListPage from './pages/BoothListPage'
import BoothDetailPage from './pages/BoothDetailPage'
import PortfolioPage from './pages/PortfolioPage'
import HistoryPage from './pages/HistoryPage'
import ResultPage from './pages/ResultPage'
import AdminPage from './pages/AdminPage'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import { ToastProvider } from './components/ToastContext'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 'calc(var(--nav-height) + var(--safe-area-bottom) + 8px)' }}>
      {children}
      <BottomNav />
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
        <Route path="/portfolio" element={
          <PrivateRoute><AppLayout><PortfolioPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute><AppLayout><HistoryPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/result" element={
          <PrivateRoute><AppLayout><ResultPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </ToastProvider>
  )
}
