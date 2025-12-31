import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  hlsUrl: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export default function VideoPlayer({ hlsUrl, autoPlay = true, muted = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);

    // 检查浏览器是否支持 HLS
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // 浏览器可能阻止自动播放，需要用户交互
            console.log('Auto-play blocked, waiting for user interaction');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error:', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error:', data);
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error:', data);
              setError('视频加载失败');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 原生支持 HLS
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          video.play().catch(() => {
            console.log('Auto-play blocked, waiting for user interaction');
          });
        }
      });

      video.addEventListener('error', () => {
        setError('视频加载失败');
      });
    } else {
      setError('您的浏览器不支持 HLS 播放');
    }
  }, [hlsUrl, autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        muted={muted}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* 错误提示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white">
            <p className="text-xl mb-2">视频加载失败</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      )}

      {/* 播放/暂停按钮 */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        <div className="bg-black bg-opacity-50 rounded-full p-4">
          {isPlaying ? (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}
