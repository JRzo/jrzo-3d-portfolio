import { useState, useEffect } from 'react';

const STEPS = [
  [350,  18, 'Compiling shaders…'],
  [700,  36, 'Loading room geometry…'],
  [1050, 54, 'Texturing surfaces…'],
  [1350, 70, 'Setting up monitors…'],
  [1650, 85, 'Fetching GitHub data…'],
  [1900, 95, 'Warming up bloom pass…'],
  [2100, 100, 'Ready. Enter the room.'],
];

export default function LoadingScreen({ onLoaded }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing…');
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timers = STEPS.map(([delay, pct, msg]) =>
      setTimeout(() => {
        setProgress(pct);
        setStatus(msg);
        if (pct === 100) {
          setTimeout(() => {
            setFading(true);
            setTimeout(onLoaded, 600);
          }, 350);
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [onLoaded]);

  return (
    <div className={`loading-screen${fading ? ' fade-out' : ''}`}>
      <div className="loading-logo">
        <span style={{ color: '#00f5ff' }}>JR</span>
        <span style={{ color: '#bf5fff' }}>ZO</span>
      </div>
      <div className="loading-subtitle">AI Data Engineer II</div>

      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-status">{status}</div>
    </div>
  );
}
