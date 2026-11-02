import { useEffect, useRef, useState } from 'react';

let apiPromise;
function loadPlayerApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => { script.remove(); apiPromise = undefined; reject(new Error('Player unavailable')); };
      document.head.append(script);
    });
  }
  return apiPromise;
}

// Mounted only after a visitor chooses a film. Never start playback automatically.
export default function YouTubePlayer({ videoId, title }) {
  const container = useRef(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    let player;
    const timeout = window.setTimeout(() => { if (active) setStatus('failed'); }, 20000);
    const mount = document.createElement('div');
    container.current.append(mount);
    loadPlayerApi().then(YT => {
      if (!active) return;
      player = new YT.Player(mount, {
        host: 'https://www.youtube-nocookie.com',
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 0, controls: 1, playsinline: 1, rel: 0, fs: 1, origin: window.location.origin },
        events: {
          onReady: event => {
            if (!active) return;
            window.clearTimeout(timeout);
            const iframe = event.target.getIframe();
            iframe.title = title;
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            setStatus('ready');
          },
          onError: () => { if (active) { window.clearTimeout(timeout); setStatus('failed'); } },
        },
      });
    }).catch(() => { if (active) { window.clearTimeout(timeout); setStatus('failed'); } });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      player?.destroy();
      mount.remove();
    };
  }, [videoId, title]);

  return <div className="relative h-full min-h-[200px] w-full">
    <div ref={container} className={`h-full w-full ${status === 'failed' ? 'hidden' : ''}`} />
    {status === 'loading' && <div role="status" className="absolute inset-0 grid animate-pulse place-items-center bg-[#0a211b] text-sm text-emerald-100">Loading video player…</div>}
    {status === 'failed' && <div role="alert" className="absolute inset-0 grid place-items-center p-5 text-center text-sm text-white">This film may be unavailable, restricted, or blocked by your browser. Try the original video below.</div>}
  </div>;
}
