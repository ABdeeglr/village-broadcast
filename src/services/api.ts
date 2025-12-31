import axios from 'axios';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  StreamStatus,
  StreamConfig,
  User
} from '../types';

// ============================================================
// API 基础配置
// ============================================================

// 后端 API 基础地址（通过环境变量配置）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const VIDEO_BASE_URL = import.meta.env.VITE_VIDEO_BASE_URL || 'http://localhost:8080';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，清除本地存储并跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ============================================================
// 用户认证 API
// ============================================================

/**
 * POST /api/auth/login
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post('/auth/login', data);
}

/**
 * POST /api/auth/register
 * 用户注册
 */
export async function register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post('/auth/register', data);
}

/**
 * POST /api/auth/logout
 * 用户登出
 */
export async function logout(): Promise<ApiResponse> {
  return apiClient.post('/auth/logout');
}

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiClient.get('/auth/me');
}

// ============================================================
// 直播相关 API
// ============================================================

/**
 * GET /api/stream/status
 * 获取直播状态
 */
export async function getStreamStatus(): Promise<ApiResponse<StreamStatus>> {
  return apiClient.get('/stream/status');
}

/**
 * GET /api/stream/config
 * 获取推流配置（仅管理员）
 */
export async function getStreamConfig(): Promise<ApiResponse<StreamConfig>> {
  return apiClient.get('/stream/config');
}

/**
 * POST /api/stream/refresh-key
 * 刷新推流密钥（仅管理员）
 */
export async function refreshStreamKey(): Promise<ApiResponse<{ streamKey: string }>> {
  return apiClient.post('/stream/refresh-key');
}

// ============================================================
// HLS 视频地址
// ============================================================

/**
 * 获取 HLS 播放地址
 * @param streamName 流名称，默认为 'live'
 */
export function getHlsUrl(streamName: string = 'live'): string {
  return `${VIDEO_BASE_URL}/live/${streamName}.m3u8`;
}

/**
 * 检查 HLS 流是否可用
 * @param streamName 流名称，默认为 'live'
 */
export async function checkStreamAvailable(streamName: string = 'live'): Promise<boolean> {
  try {
    const response = await fetch(getHlsUrl(streamName), { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================
// 导出配置常量
// ============================================================

export const API_CONFIG = {
  API_BASE_URL,
  VIDEO_BASE_URL,
  SOCKET_URL,
};

export default apiClient;
