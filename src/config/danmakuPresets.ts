import type { DanmakuStyle } from '../types';

// ============================================================
// 弹幕样式预设配置（仅前端使用）
// ============================================================

export const DANMAKU_PRESETS: Array<{
  id: string;
  name: string;
  style: DanmakuStyle;
}> = [
  {
    id: 'normal',
    name: '普通',
    style: {
      color: '#ffffff',
      fontSize: 20,
      speed: 1,
      position: 'scroll',
      border: false,
      shadow: false,
    },
  },
  {
    id: 'warm',
    name: '温暖',
    style: {
      color: '#f59e0b',
      fontSize: 24,
      speed: 1,
      position: 'scroll',
      border: false,
      shadow: true,
    },
  },
  {
    id: 'fire',
    name: '烈焰',
    style: {
      color: '#ef4444',
      fontSize: 26,
      speed: 1,
      position: 'scroll',
      border: true,
      shadow: true,
    },
  },
  {
    id: 'ocean',
    name: '海洋',
    style: {
      color: '#3b82f6',
      fontSize: 24,
      speed: 1,
      position: 'scroll',
      border: true,
      shadow: true,
    },
  },
  {
    id: 'forest',
    name: '森林',
    style: {
      color: '#10b981',
      fontSize: 24,
      speed: 1,
      position: 'scroll',
      border: false,
      shadow: true,
    },
  },
  {
    id: 'royal',
    name: '皇家',
    style: {
      color: '#a855f7',
      fontSize: 28,
      speed: 0.8,
      position: 'scroll',
      border: true,
      shadow: true,
    },
  },
];

/**
 * 根据 styleId 获取样式配置
 */
export function getDanmakuStyle(styleId: string): DanmakuStyle {
  return DANMAKU_PRESETS.find(p => p.id === styleId)?.style || DANMAKU_PRESETS[0].style;
}

/**
 * 判断是否为特殊弹幕（非普通样式）
 */
export function isSpecialDanmaku(styleId: string): boolean {
  return styleId !== 'normal';
}
