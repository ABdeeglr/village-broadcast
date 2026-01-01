前端 src 目录结构解析

  src/
  ├── App.tsx              # 应用根组件
  ├── main.tsx             # 应用入口文件
  ├── index.css            # 全局样式
  │
  ├── assets/              # 静态资源（图片、字体等）
  │
  ├── pages/               # 页面组件（路由级组件）
  │   ├── Login/           # 登录/注册页面
  │   ├── Live/            # 直播观看页面
  │   ├── Admin/           # 管理后台页面
  │   └── Profile/         # 个人中心页面
  │
  ├── components/          # 可复用组件
  │   ├── AppRouter.tsx    # 路由配置组件
  │   ├── VideoPlayer/     # HLS 视频播放器组件
  │   ├── Danmaku/         # 弹幕层组件
  │   ├── ChatInput/       # 弹幕输入框组件
  │   ├── ChatHistory/     # 弹幕历史记录组件
  │   └── OnlineUsers/     # 在线用户显示组件
  │
  ├── store/               # 状态管理
  │   └── index.ts         # Zustand stores (用户、直播、弹幕、在线用户)
  │
  ├── services/            # 外部服务封装
  │   ├── api.ts           # HTTP API (axios)
  │   └── socket.ts        # Socket.io 客户端
  │
  ├── types/               # TypeScript 类型定义
  │   └── index.ts         # 全局类型定义
  │
  ├── config/              # 配置文件
  │   └── danmakuPresets.ts # 弹幕样式预设
  │
  ├── hooks/               # 自定义 React Hooks
  │   └── (空，待扩展)
  │
  └── utils/               # 工具函数
      └── (空，待扩展)

  ---
  各目录详细说明

  1. 根目录文件

  | 文件      | 用途                           |
  |-----------|--------------------------------|
  | App.tsx   | 应用根组件，渲染 AppRouter     |
  | main.tsx  | React 入口，挂载到 DOM         |
  | index.css | 全局 CSS 样式（Tailwind 指令） |

  2. pages/ - 页面组件

  路由级组件，对应应用的不同页面：

  | 目录     | 用途                 | 路由     |
  |----------|----------------------|----------|
  | Login/   | 登录/注册页面        | /login   |
  | Live/    | 直播观看页面         | /live    |
  | Admin/   | 管理后台（推流配置） | /admin   |
  | Profile/ | 个人中心（修改资料） | /profile |

  3. components/ - 可复用组件

  UI 组件，可被多个页面复用：

  | 组件          | 用途                         |
  |---------------|------------------------------|
  | AppRouter.tsx | React Router 配置，路由守卫  |
  | VideoPlayer/  | HLS 视频播放器（含全屏控制） |
  | Danmaku/      | 滚动弹幕覆盖层               |
  | ChatInput/    | 弹幕输入框                   |
  | ChatHistory/  | 弹幕历史记录（侧边栏）       |
  | OnlineUsers/  | 在线用户显示（头像/数量）    |

  4. store/ - 状态管理

  使用 Zustand 管理全局状态：

  | Store               | 用途               | 持久化          |
  |---------------------|--------------------|-----------------|
  | useUserStore        | 用户信息、登录状态 | ✅ localStorage |
  | useStreamStore      | 直播状态、观看人数 | ❌              |
  | useDanmakuStore     | 弹幕列表、显示设置 | ✅ localStorage |
  | useOnlineUsersStore | 在线用户列表       | ❌              |

  5. services/ - 外部服务

  与后端通信的封装层：

  | 文件      | 用途                         | 协议      |
  |-----------|------------------------------|-----------|
  | api.ts    | HTTP API 客户端 (axios)      | REST      |
  | socket.ts | WebSocket 客户端 (Socket.io) | WebSocket |

  关键功能：
  - api.ts：JWT token 自动注入、401 自动跳转登录
  - socket.ts：房间管理、事件监听

  6. types/ - 类型定义

  TypeScript 全局类型：

  // 主要类型
  User, UserRole, OnlineUser
  StreamStatus, StreamConfig
  Danmaku, DanmakuStyle
  ApiResponse, LoginRequest, ...

  7. config/ - 配置文件

  应用级配置：

  | 文件              | 用途                    |
  |-------------------|-------------------------|
  | danmakuPresets.ts | 弹幕样式预设（6种预设） |

  8. hooks/ - 自定义 Hooks

  当前为空，预留给复用的 React 逻辑。

  9. utils/ - 工具函数

  当前为空，预留给纯函数工具。

  ---
  数据流向

  用户交互
      │
      ▼
  Pages (页面组件)
      │
      ├─────────────┬─────────────┬──────────────┐
      ▼             ▼             ▼              ▼
  Components    Services      Store         Types
   (UI组件)     (API调用)    (状态管理)     (类型定义)
      │             │             │
      └─────────────┴─────────────┘
                    │
                    ▼
              后端 API / Socket.io
