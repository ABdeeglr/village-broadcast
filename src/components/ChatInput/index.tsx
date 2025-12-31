import { useState, type FormEvent, useRef, useEffect } from 'react';
import { useUserStore } from '../../store';
import { socketService } from '../../services/socket';
import { DANMAKU_PRESETS } from '../../config/danmakuPresets';

interface ChatInputProps {
  roomId: string;
}

export default function ChatInput({ roomId }: ChatInputProps) {
  const { user } = useUserStore();
  const [message, setMessage] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('normal');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedPreset = DANMAKU_PRESETS.find((p) => p.id === selectedPresetId) || DANMAKU_PRESETS[0];

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStyleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (user?.role === 'guest') {
      alert('游客无法发送弹幕，请先登录');
      return;
    }

    // 只发送 styleId，不发送完整样式
    socketService.sendDanmaku(roomId, message, selectedPresetId);

    setMessage('');
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          发送弹幕
        </h3>
      </div>

      <div className="p-3">
        {/* 游客提示 */}
        {user?.role === 'guest' && (
          <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center gap-2">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            游客只能观看，登录后可发送弹幕
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* 输入框 */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入弹幕内容..."
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-sm"
            rows={2}
            disabled={user?.role === 'guest'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          {/* 控制栏 */}
          <div className="flex items-center gap-2">
            {/* 弹幕样式选择器 */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowStyleMenu(!showStyleMenu)}
                disabled={user?.role === 'guest'}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${selectedPresetId === 'normal'
                    ? 'border-slate-700 bg-slate-800/50 text-gray-300'
                    : 'border-amber-400/50 bg-amber-400/10'
                  }
                  ${user?.role === 'guest' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/50'}
                `}
                style={{
                  ...(selectedPresetId !== 'normal' && {
                    borderColor: `${selectedPreset.style.color}40`,
                    color: selectedPreset.style.color,
                  }),
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: selectedPreset.style.color,
                    boxShadow: selectedPreset.style.shadow ? `0 0 6px ${selectedPreset.style.color}` : undefined,
                  }}
                />
                <span>{selectedPreset.name}</span>
                <svg className={`w-3 h-3 transition-transform ${showStyleMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 下拉菜单 - 使用 fixed 定位弹出向下 */}
              {showStyleMenu && (
                <div className="fixed z-[100] animate-in fade-in-0 duration-150" style={{
                  top: `${(menuRef.current?.getBoundingClientRect().bottom || 0) + 4}px`,
                  left: `${menuRef.current?.getBoundingClientRect().left || 0}px`,
                }}>
                  <div className="w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                    {DANMAKU_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetId(preset.id);
                          setShowStyleMenu(false);
                        }}
                        className={`
                          w-full px-3 py-2 flex items-center gap-2 text-xs transition-colors
                          ${selectedPresetId === preset.id ? 'bg-amber-400/20' : 'hover:bg-slate-800'}
                        `}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: preset.style.color,
                            boxShadow: preset.style.shadow ? `0 0 6px ${preset.style.color}` : undefined,
                            border: preset.style.border ? `1px solid ${preset.style.color}` : undefined,
                          }}
                        />
                        <span className="text-gray-300">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1" />

            {/* 发送按钮 */}
            <button
              type="submit"
              disabled={!message.trim() || user?.role === 'guest'}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 transition-all shadow-lg shadow-amber-500/20"
            >
              发送
            </button>
          </div>
        </form>

        {/* 用户信息 */}
        <div className="mt-3 pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'G'}
                </span>
              </div>
              <div>
                <p className="text-xs text-white">{user?.username || '游客'}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? '管理员' : user?.role === 'guest' ? '游客' : '村民'}
                </p>
              </div>
            </div>
            {user?.role !== 'guest' && (
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" title="在线" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
