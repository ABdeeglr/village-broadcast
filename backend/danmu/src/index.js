import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3002;
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Socket.io 服务器
const io = new Server(PORT, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// ============================================================
// 房间数据结构（可扩展）
// ============================================================

const rooms = new Map();
// roomId -> {
//   users: Map<socketId, OnlineUser>,
//   danmakuList: [],
//   isLive: boolean,
//   createdAt: number
// }

// 在线用户结构（可扩展）
// OnlineUser = {
//   id, username, nickname, avatar, role,
//   joinedAt, lastActivity, isActive, metadata
// }

// 生成房间
function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      danmakuList: [],
      isLive: false,
      createdAt: Date.now()
    });
  }
  return rooms.get(roomId);
}

// ============================================================
// 用户信息构建（可扩展）
// ============================================================

function buildOnlineUser(socket, userFromToken) {
  const baseUser = userFromToken || {
    id: 'guest-' + socket.id,
    username: 'guest',
    role: 'guest',
    nickname: null,
    avatar: null
  };

  return {
    // 基础信息
    id: baseUser.id,
    username: baseUser.username,
    nickname: baseUser.nickname,
    avatar: baseUser.avatar,
    role: baseUser.role,

    // 在线状态信息
    socketId: socket.id,
    joinedAt: Date.now(),
    lastActivity: Date.now(),
    isActive: true,

    // 扩展字段（用于未来功能）
    metadata: {
      // 可添加：观看进度、发送弹幕数、互动状态等
      danmakuCount: 0,
      watchTime: 0
    }
  };
}

// ============================================================
// 广播事件（可扩展）
// ============================================================

// 广播在线用户列表
function broadcastOnlineUsers(roomId, room) {
  const usersList = Array.from(room.users.values());

  io.to(roomId).emit('online_users', {
    users: usersList,
    count: usersList.length,
    timestamp: Date.now()
  });
}

// 广播用户上线
function broadcastUserOnline(roomId, user) {
  io.to(roomId).emit('user_online', {
    user,
    timestamp: Date.now()
  });
}

// 广播用户下线
function broadcastUserOffline(roomId, userId) {
  io.to(roomId).emit('user_offline', {
    userId,
    timestamp: Date.now()
  });
}

// ============================================================
// JWT 验证
// ============================================================

async function verifyToken(token) {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// ============================================================
// 中间件：验证用户身份
// ============================================================

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    // 允许游客连接
    socket.data.user = buildOnlineUser(socket, null);
    return next();
  }

  const user = await verifyToken(token);
  socket.data.user = buildOnlineUser(socket, user);

  next();
});

// ============================================================
// 连接处理
// ============================================================

io.on('connection', (socket) => {
  const onlineUser = socket.data.user;
  console.log(`用户连接: ${onlineUser.username} (${onlineUser.role})`);

  // 加入房间
  socket.on('join_room', ({ roomId }) => {
    const room = getRoom(roomId);

    socket.join(roomId);

    // 存储用户信息（覆盖同一用户的其他连接）
    room.users.set(socket.id, onlineUser);

    // 发送当前弹幕列表
    socket.emit('danmaku_list', room.danmakuList);

    // 发送直播状态
    socket.emit('stream_status', {
      isLive: room.isLive,
      viewerCount: room.users.size,
      streamName: roomId
    });

    // 广播在线用户列表（给所有人）
    broadcastOnlineUsers(roomId, room);

    // 单独通知新用户上线（给房间内其他人）
    socket.to(roomId).emit('user_online', {
      user: onlineUser,
      timestamp: Date.now()
    });

    console.log(`${onlineUser.username} 加入房间 ${roomId}, 当前在线: ${room.users.size}`);
  });

  // 离开房间
  socket.on('leave_room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      handleUserLeave(socket, roomId, room);
    }
  });

  // 更新活跃状态
  socket.on('activity', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        if (user) {
          user.lastActivity = Date.now();
          user.isActive = true;

          // 5秒后标记为不活跃
          setTimeout(() => {
            const u = room.users.get(socket.id);
            if (u) u.isActive = false;
          }, 5000);
        }
      }
    }
  });

  // 发送弹幕
  socket.on('send_danmaku', async ({ roomId, text, styleId }) => {
    const room = getRoom(roomId);

    // 游客不能发送弹幕
    if (onlineUser.role === 'guest') {
      socket.emit('error', { message: '游客无法发送弹幕' });
      return;
    }

    // 过滤敏感词
    const filteredText = text.replace(/fuck|shit/gi, '***');

    const danmaku = {
      id: 'dm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      text: filteredText,
      styleId: styleId || 'normal',  // 只转发 styleId，样式配置由前端管理
      user: {
        id: onlineUser.id,
        nickname: onlineUser.nickname || onlineUser.username,
        role: onlineUser.role,
        avatar: onlineUser.avatar
      },
      timestamp: Date.now()
    };

    // 更新用户弹幕计数
    const user = room.users.get(socket.id);
    if (user && user.metadata) {
      user.metadata.danmakuCount = (user.metadata.danmakuCount || 0) + 1;
    }

    // 添加到弹幕列表
    room.danmakuList.push(danmaku);
    if (room.danmakuList.length > 1000) {
      room.danmakuList.shift();
    }

    // 广播弹幕
    io.to(roomId).emit('new_danmaku', danmaku);

    // 广播更新的用户信息（包含新的弹幕计数）
    broadcastOnlineUsers(roomId, room);

    console.log(`弹幕: ${onlineUser.username} -> ${roomId}: ${filteredText}`);
  });

  // 检查直播状态
  socket.on('check_stream', ({ roomId }) => {
    const room = getRoom(roomId);
    socket.emit('stream_status', {
      isLive: room.isLive,
      viewerCount: room.users.size,
      streamName: roomId
    });
  });

  // 断开连接
  socket.on('disconnect', () => {
    // 清理用户所在的所有房间
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        handleUserLeave(socket, roomId, room);
      }
    }
    console.log(`用户断开连接: ${onlineUser.username}`);
  });
});

// 处理用户离开房间
function handleUserLeave(socket, roomId, room) {
  const user = room.users.get(socket.id);
  const userId = user?.id;

  room.users.delete(socket.id);
  socket.leave(roomId);

  // 如果房间为空，清理房间
  if (room.users.size === 0) {
    rooms.delete(roomId);
  } else {
    // 广播用户下线
    if (userId) {
      broadcastUserOffline(roomId, userId);
    }
    // 广播更新后的在线列表
    broadcastOnlineUsers(roomId, room);
  }

  console.log(`${user?.username || '用户'} 离开房间 ${roomId}, 剩余: ${room.users.size}`);
}

// ============================================================
// 外部接口
// ============================================================

// 设置直播状态
export function setLiveStatus(roomId, isLive) {
  const room = getRoom(roomId);
  room.isLive = isLive;

  io.to(roomId).emit('stream_status', {
    isLive: room.isLive,
    viewerCount: room.users.size,
    streamName: roomId
  });
}

// 获取房间状态
export function getRoomStatus(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  return {
    roomId,
    userCount: room.users.size,
    users: Array.from(room.users.values()),
    isLive: room.isLive,
    danmakuCount: room.danmakuList.length
  };
}

// 启动服务器
console.log(`弹幕服务运行在端口 ${PORT}`);
console.log(`CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
