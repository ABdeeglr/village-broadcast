# Pages/Live 说明

## 组件层级结构

  LivePage (src/pages/Live/index.tsx)
  │
  ├── 顶部导航栏 (header)
  │   ├── Logo + 标题
  │   ├── OnlineUsersDisplay (在线人数)
  │   ├── 用户信息卡片
  │   ├── 管理后台按钮 (仅管理员)
  │   └── 退出登录按钮
  │
  ├── 主内容区
  │   │
  │   ├── 视频播放区域
  │   │   ├── VideoPlayer (HLS 播放器 + 全屏控制)
  │   │   ├── DanmakuLayer (弹幕覆盖层)
  │   │   ├── 直播状态徽章
  │   │   └── 观看人数
  │   │
  │   └── 控制栏和输入区
  │       │
  │       ├── 左侧栏
  │       │   ├── 直播控制栏
  │       │   │   ├── 状态指示器
  │       │   │   ├── OnlineUsersDisplay (在线用户头像)
  │       │   │   └── 弹幕开关按钮
  │       │   └── ChatInput (弹幕输入框)
  │       │
  │       └── 右侧栏
  │           └── ChatHistory (弹幕历史记录)

  各组件功能

  | 组件               | 文件路径                | 功能                      |
  |--------------------|-------------------------|---------------------------|
  | VideoPlayer        | components/VideoPlayer/ | HLS 视频播放、全屏控制    |
  | DanmakuLayer       | components/Danmaku/     | 滚动弹幕覆盖层            |
  | ChatInput          | components/ChatInput/   | 弹幕输入框                |
  | ChatHistory        | components/ChatHistory/ | 弹幕历史记录（侧边栏）    |
  | OnlineUsersDisplay | components/OnlineUsers/ | 在线用户显示（人数/头像） |

  依赖的服务

  | 服务                 | 文件路径           | 用途               |
  |----------------------|--------------------|--------------------|
  | socketService        | services/socket.ts | Socket.io 连接管理 |
  | checkStreamAvailable | services/api.ts    | 检查直播状态       |
  | getHlsUrl            | services/api.ts    | 获取 HLS 播放地址  |

  使用的 Store

  | Store           | 用途               |
  |-----------------|--------------------|
  | useUserStore    | 用户信息、登出     |
  | useStreamStore  | 直播状态、观看人数 |
  | useDanmakuStore | 弹幕显示开关       |
