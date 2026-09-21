import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import Login from './pages/login'
import LoginPage from './pages/auth/login-form'
import AdminDashboard from './pages/admin/admin-dashboard'
import BuildingFloorManagement from './pages/admin/building-floor-management'
import UnitManagement from './pages/admin/unit-management'
import Dashboard from './pages/dashboard'
import Students from './pages/students/index'
import Rooms from './pages/rooms/index'
import TaiSan from './pages/assets'
import ViPhamKyLuat from './pages/violations-disciplines/index'
import PhanCongVeSinhPage from './pages/cleaning-assignments/index'
import VanBanSoDoPage from './pages/documents-diagrams'
import Profile from './pages/account/profile'
import ChangePassword from './pages/account/change-password'
import Dev from './pages/test/Dev'
import MainLayout from './layouts/MainLayout'
import { useAuth } from './hooks/useAuth'
import NhatKyHeThongPage from './pages/nhat-ky-he-thong'
import DataImportSessionsPage from './pages/data-import-sessions'
import NhapLieuPage from './pages/nhap-lieu'
import RoomAssignmentHistoryPage from './pages/room-assignment-history'
import { systemTheme } from './theme/system-theme'
import ThongKeHuHong from './pages/asset-repair-history'
import BackgroundManager from './components/BackgroundManager'

function LoginRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${systemTheme.background.page} 0%, ${systemTheme.brand.primarySoft} 100%)`,
      }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    )
  }

  if (user) {
    const isAdmin = user.role?.name === 'ADMIN' || user.roleId === 1
    return <Navigate to={isAdmin ? "/admin" : "/trang-chu"} replace />
  }
  return <LoginPage />
}

function LandingRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${systemTheme.background.page} 0%, ${systemTheme.brand.primarySoft} 100%)`,
      }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    )
  }

  if (user) {
    const isAdmin = user.role?.name === 'ADMIN' || user.roleId === 1
    return <Navigate to={isAdmin ? "/admin" : "/trang-chu"} replace />
  }
  return <Login />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${systemTheme.background.page} 0%, ${systemTheme.brand.primarySoft} 100%)`,
      }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    )
  }

  const isAdmin = user?.role?.name === 'ADMIN' || user?.roleId === 1
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <>
      <BackgroundManager />
      <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<MainLayout />}>
        <Route path="/nguoi-dung" element={<Profile />} />
        <Route path="/doi-mat-khau" element={<ChangePassword />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/toa-nha-tang" element={<AdminRoute><BuildingFloorManagement /></AdminRoute>} />
        <Route path="/admin/don-vi" element={<AdminRoute><UnitManagement /></AdminRoute>} />
        <Route path="/trang-chu" element={<Dashboard />} />
        <Route path="/hoc-vien" element={<Students />} />
        <Route path="/phong" element={<Rooms />} />
        <Route path="/thong-ke-hu-hong" element={<ThongKeHuHong />} />
        <Route path="/tai-san" element={<TaiSan />} />
        <Route path="/vi-pham-ky-luat" element={<ViPhamKyLuat />} />
        <Route path="/phan-cong-ve-sinh" element={<PhanCongVeSinhPage />} />
        <Route path="/van-ban-so-do" element={<VanBanSoDoPage />} />
        <Route path="/dev" element={<Dev />} />
        <Route path="/nhat-ky-he-thong" element={<NhatKyHeThongPage />} />
        <Route path="/dieu-chinh-phong" element={<RoomAssignmentHistoryPage />} />
        <Route path="/phien-nhap-du-lieu" element={<DataImportSessionsPage />} />
        <Route path="/nhap-lieu" element={<NhapLieuPage />} />
      </Route>
      </Routes>
    </>
  )
}

export default App