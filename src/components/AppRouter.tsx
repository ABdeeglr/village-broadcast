import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useUserStore } from '../store';

// 懒加载页面组件
const LoginPage = lazy(() => import('../pages/Login'));
const LivePage = lazy(() => import('../pages/Live'));
const AdminPage = lazy(() => import('../pages/Admin'));
const ProfilePage = lazy(() => import('../pages/Profile'));

// 加载中组件
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-400/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-amber-400 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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

          {/* 个人中心 */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 页面 */}
          <Route path="*" element={<Navigate to="/live" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
