 组件结构

  AppRouter
  ├── BrowserRouter          # React Router 路由容器
  ├── Suspense               # 懒加载加载状态
  ├── PageLoader             # 加载动画组件
  └── Routes                 # 路由定义
      ├── /                  → 重定向到 /live
      ├── /login             → 登录页（公开）
      ├── /live              → 直播页（需登录）
      ├── /admin             → 管理后台（仅管理员）
      ├── /profile           → 个人中心（需登录）
      └── *                  → 404 重定向到 /live

  ---
  核心功能

  1. 懒加载 (第 5-9 行)

  const LoginPage = lazy(() => import('../pages/Login'));
  const LivePage = lazy(() => import('../pages/Live'));
  const AdminPage = lazy(() => import('../pages/Admin'));
  const ProfilePage = lazy(() => import('../pages/Profile'));

  好处:
  - 减少初始加载体积
  - 按需加载页面组件
  - 提升首屏加载速度

  2. 加载状态组件 (第 12-24 行)

  function PageLoader() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400/30 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  3. 受保护路由组件 (第 29-41 行)

  function ProtectedRoute({ children, requireAdmin = false }) {
    const { isAuthenticated, user } = useUserStore();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;  // 未登录 → 跳转登录
    }

    if (requireAdmin && user?.role !== 'admin') {
      return <Navigate to="/live" replace />;   // 非管理员 → 跳转直播页
    }

    return children;  // 验证通过 → 渲染子组件
  }

  访问控制逻辑:

  | 页面     | 要求     | 未满足时行为 |
  |----------|----------|--------------|
  | /login   | 公开     | -            |
  | /live    | 需登录   | → /login     |
  | /profile | 需登录   | → /login     |
  | /admin   | 需管理员 | → /live      |

  4. 路由配置 (第 50-89 行)

  <Routes>
    {/* 默认重定向 */}
    <Route path="/" element={<Navigate to="/live" replace />} />

    {/* 登录页 - 公开 */}
    <Route path="/login" element={<LoginPage />} />

    {/* 直播页 - 需登录 */}
    <Route path="/live" element={<ProtectedRoute><LivePage /></ProtectedRoute>} />

    {/* 管理页 - 仅管理员 */}
    <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />

    {/* 个人中心 - 需登录 */}
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

    {/* 404 */}
    <Route path="*" element={<Navigate to="/live" replace />} />
  </Routes>

  ---
  路由流程图

  用户访问 URL
       │
       ▼
  ┌─────────────────┐
  │  AppRouter      │
  │  检查路由       │
  └────────┬────────┘
           │
      ┌────┴────┐
      │         │
      ▼         ▼
  /login    其他路径
      │         │
      │         ▼
      │    检查 ProtectedRoute
      │         │
      │    ┌────┴────┐
      │    │         │
      │  已登录   未登录
      │    │         │
      │    ▼         ▼
      │  渲染页面 → /login
      │
      ▼
  渲染 LoginPage

  ---
  与 App.tsx 的关系

  // App.tsx
  export default function App() {
    return <AppRouter />;
  }

  App.tsx 是 React 入口组件，它直接渲染 AppRouter，后者负责整个应用的路由管理。
