import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
// import { changePassword, updateProfile, getCurrentUser } from '../../services/api';
import { changePassword, updateProfile} from '../../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useUserStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 修改昵称
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // 修改密码
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 预设头像
  const presetAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  ];

  useEffect(() => {
    setNickname(user?.nickname || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await updateProfile({ nickname, avatar });
      if (response.success && response.data) {
        setUser(response.data);
        showMessage('success', '资料更新成功');
      } else {
        showMessage('error', response.message || '更新失败');
      }
    } catch (err: unknown) {
      showMessage('error', err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage('error', '两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('error', '新密码至少 6 个字符');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await changePassword({ oldPassword, newPassword });
      if (response.success) {
        showMessage('success', '密码修改成功');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showMessage('error', response.message || '修改失败');
      }
    } catch (err: unknown) {
      showMessage('error', err instanceof Error ? err.message : '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50">
        <div className="text-center">
          <p className="text-gray-500">请先登录</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/live')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">个人中心</h1>
              <p className="text-xs text-gray-500">账户设置</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="退出登录"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-2xl">
        {/* 用户卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400"></div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
                <p className="text-gray-500">{nickname || '未设置昵称'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role === 'admin' ? '管理员' : user.role === 'guest' ? '游客' : '村民'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 选项卡 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
          {/* Tab 切换 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              个人资料
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              修改密码
            </button>
          </div>

          <div className="p-6">
            {/* 消息提示 */}
            {message && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* 个人资料 Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* 昵称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="请输入昵称"
                  />
                </div>

                {/* 头像选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择头像</label>
                  <div className="grid grid-cols-6 gap-3 mb-3">
                    {presetAvatars.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAvatar(preset)}
                        className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-110 ${
                          avatar === preset ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200'
                        }`}
                      >
                        <img src={preset} alt={`头像 ${index + 1}`} className="w-full h-full rounded-lg" />
                      </button>
                    ))}
                  </div>

                  {/* 自定义头像 URL */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                      placeholder="或输入图片 URL"
                    />
                    {avatar && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                        <img src={avatar} alt="预览" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium rounded-xl hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-200"
                >
                  {loading ? '保存中...' : '保存资料'}
                </button>
              </form>
            )}

            {/* 修改密码 Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">当前密码</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="请输入当前密码"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="请输入新密码（至少 6 个字符）"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="请再次输入新密码"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium rounded-xl hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-200"
                >
                  {loading ? '修改中...' : '修改密码'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
