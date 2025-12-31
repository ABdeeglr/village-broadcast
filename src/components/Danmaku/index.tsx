import { useEffect, useRef, useState } from 'react';
import { useDanmakuStore } from '../../store';
import { socketService } from '../../services/socket';
import type { Danmaku as DanmakuType } from '../../types';

interface DanmakuItem extends DanmakuType {
  id: string;
  element: HTMLDivElement;
  startTime: number;
  speed: number;
}

export default function DanmakuLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const danmakuListRef = useRef<Map<string, DanmakuItem>>(new Map());

  const { showDanmaku, danmakuOpacity, danmakuSpeed, addDanmaku, setDanmakuList } =
    useDanmakuStore();

  const [containerWidth, setContainerWidth] = useState(0);

  // 获取容器尺寸
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerWidth(container.offsetWidth);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 监听新弹幕
  useEffect(() => {
    const unsubscribe = socketService.onNewDanmaku((danmaku) => {
      addDanmaku(danmaku);
      createDanmakuElement(danmaku);
    });

    return unsubscribe;
  }, [containerWidth, danmakuSpeed]);

  // 监听弹幕列表（加入房间时获取现有弹幕）
  useEffect(() => {
    const unsubscribe = socketService.onDanmakuList((list) => {
      setDanmakuList(list);
      // 只显示最近 50 条弹幕
      const recentList = list.slice(-50);
      recentList.forEach((danmaku) => {
        setTimeout(() => createDanmakuElement(danmaku), Math.random() * 2000);
      });
    });

    return unsubscribe;
  }, []);

  // 创建弹幕元素
  const createDanmakuElement = (danmaku: DanmakuType) => {
    const container = containerRef.current;
    if (!container || !showDanmaku) return;

    const element = document.createElement('div');
    element.textContent = danmaku.text;

    // 基础样式
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      pointerEvents: 'none',
      fontWeight: 'bold',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
    };

    // 根据类型设置样式
    if (danmaku.type === 'special' && danmaku.effect) {
      const { color, fontSize, border, shadow } = danmaku.effect;
      Object.assign(element.style, baseStyle, {
        color: color || '#ff6b6b',
        fontSize: `${fontSize || 24}px`,
        border: border ? '2px solid rgba(255, 255, 255, 0.8)' : 'none',
        borderRadius: border ? '4px' : '0',
        padding: border ? '4px 8px' : '0',
        boxShadow: shadow ? '0 0 10px currentColor' : 'none',
      });
    } else {
      Object.assign(element.style, baseStyle, {
        color: '#ffffff',
        fontSize: '20px',
      });
    }

    // 随机垂直位置 (避免遮挡顶部和底部)
    const maxTop = container.offsetHeight - 50;
    const top = Math.random() * (maxTop - 30) + 15;
    element.style.top = `${top}px`;

    // 设置初始位置（右侧屏幕外）
    element.style.left = `${container.offsetWidth}px`;
    element.style.opacity = `${danmakuOpacity}`;

    container.appendChild(element);

    // 计算速度（基于设置的弹幕速度）
    const baseSpeed = 2; // 像素/毫秒
    const speed = baseSpeed * danmakuSpeed * (1 + Math.random() * 0.5);

    const item: DanmakuItem = {
      ...danmaku,
      id: `${danmaku.id}-${Date.now()}`,
      element,
      startTime: Date.now(),
      speed,
    };

    danmakuListRef.current.set(item.id, item);
  };

  // 动画循环
  useEffect(() => {
    const animate = () => {
      const container = containerRef.current;
      if (!container) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const now = Date.now();
      const containerWidth = container.offsetWidth;

      // 更新所有弹幕位置
      danmakuListRef.current.forEach((item, id) => {
        const elapsed = now - item.startTime;
        const distance = elapsed * item.speed;
        const x = containerWidth - distance;

        if (x < -elementWidth(item.element)) {
          // 弹幕移出屏幕，移除
          item.element.remove();
          danmakuListRef.current.delete(id);
        } else {
          item.element.style.left = `${x}px`;
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [danmakuSpeed, danmakuOpacity]);

  // 清理弹幕元素
  useEffect(() => {
    return () => {
      danmakuListRef.current.forEach((item) => {
        item.element.remove();
      });
      danmakuListRef.current.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ display: showDanmaku ? 'block' : 'none' }}
    />
  );
}

// 获取元素宽度的辅助函数
function elementWidth(element: HTMLDivElement): number {
  return element.offsetWidth;
}
