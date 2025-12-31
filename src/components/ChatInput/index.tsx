import { useState, type FormEvent } from 'react';
import { useUserStore } from '../../store';
import { socketService } from '../../services/socket';
import type { DanmakuEffect } from '../../types';

interface ChatInputProps {
  roomId: string;
}

export default function ChatInput({ roomId }: ChatInputProps) {
  const { user } = useUserStore();
  const [message, setMessage] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [effectConfig, setEffectConfig] = useState<DanmakuEffect>({
    color: '#f59e0b',
    fontSize: 24,
    speed: 1,
    position: 'scroll',
    border: false,
    shadow: true,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (user?.role === 'guest') {
      alert('游客无法发送弹幕，请先登录');
      return;
    }

    socketService.sendDanmaku(
      roomId,
      message,
      isSpecial ? 'special' : 'normal',
      isSpecial ? effectConfig : undefined
    );

    setMessage('');
  };

  const colors = [
    { color: '#f59e0b', name: 'amber' },
    { color: '#10b981', name: 'emerald' },
    { color: '#3b82f6', name: 'blue' },
    { color: '#ef4444', name: 'red' },
    { color: '#a855f7', name: 'purple' },
    { color: '#ffffff', name: 'white' },
  ];

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            发送弹幕
          </h3>
          {user?.role !== 'guest' && (
            <span className="text-xs text-gray-500">按 Enter 发送</span>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* 游客提示 */}
        {user?.role === 'guest' && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-300 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            游客只能观看，登录后可发送弹幕
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 输入框 */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入弹幕内容..."
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
            rows={3}
            disabled={user?.role === 'guest'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          {/* 特效弹幕选项 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  disabled={user?.role === 'guest'}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  isSpecial ? 'bg-amber-500' : 'bg-slate-700'
                } ${user?.role === 'guest' ? 'opacity-50' : ''}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                    isSpecial ? 'translate-x-5' : 'translate-x-1'
                  } mt-1`} />
                </div>
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">特效弹幕</span>
            </label>

            {isSpecial && (
              <div className="pl-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                {/* 颜色选择 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10">颜色</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {colors.map(({ color, name }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setEffectConfig({ ...effectConfig, color })}
                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                          effectConfig.color === color
                            ? 'border-white ring-2 ring-amber-400/50'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>

                {/* 字体大小 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10">大小</span>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    value={effectConfig.fontSize}
                    onChange={(e) =>
                      setEffectConfig({ ...effectConfig, fontSize: Number(e.target.value) })
                    }
                    className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-xs text-gray-400 w-10 text-right">{effectConfig.fontSize}px</span>
                </div>

                {/* 边框和发光 */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={effectConfig.border ?? false}
                      onChange={(e) =>
                        setEffectConfig({ ...effectConfig, border: e.target.checked })
                      }
                      className="rounded border-slate-600 bg-slate-700 text-amber-400 focus:ring-amber-400/50"
                    />
                    <span>边框</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={effectConfig.shadow ?? false}
                      onChange={(e) =>
                        setEffectConfig({ ...effectConfig, shadow: e.target.checked })
                      }
                      className="rounded border-slate-600 bg-slate-700 text-amber-400 focus:ring-amber-400/50"
                    />
                    <span>发光</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 发送按钮 */}
          <button
            type="submit"
            disabled={!message.trim() || user?.role === 'guest'}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium rounded-xl hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 transition-all shadow-lg shadow-amber-500/20"
          >
            发送弹幕
          </button>
        </form>

        {/* 用户信息 */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'G'}
                </span>
              </div>
              <div>
                <p className="text-sm text-white">{user?.username || '游客'}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? '管理员' : user?.role === 'guest' ? '游客' : '村民'}
                </p>
              </div>
            </div>
            {user?.role !== 'guest' && (
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" title="在线" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
