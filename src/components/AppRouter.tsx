import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '../store';
import LoginPage from '../pages/Login';
import LivePage from '../pages/Live';
import AdminPage from '../pages/Admin';

/**
 * 受保护的路由组件
 */
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, user } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/live" replace />;
  }

  return children;
}

/**
 * 应用路由配置
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 默认重定向到直播页 */}
        <Route path="/" element={<Navigate to="/live" replace />} />

        {/* 登录页 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 直播观看页 */}
        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <LivePage />
            </ProtectedRoute>
          }
        />

        {/* 管理页（仅管理员） */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 404 页面 */}
        <Route path="*" element={<Navigate to="/live" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
