import { useState, useEffect, useCallback } from 'react';

let _notify = null;

/** Call from anywhere: notify({ icon, name, desc }) */
export function notifyAchievement(achievement) {
  _notify?.(achievement);
}

export default function AchievementStack() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((achievement) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...achievement, id, out: false }]);

    // Start exit animation after 3.2 s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, out: true } : t))
      );
    }, 3200);

    // Remove from DOM after exit animation (350 ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  useEffect(() => {
    _notify = add;
    return () => { _notify = null; };
  }, [add]);

  if (!toasts.length) return null;

  return (
    <div className="achievement-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`achievement-toast ${t.out ? 'out' : ''}`}>
          <div className="toast-icon">{t.icon}</div>
          <div>
            <div className="toast-label">Achievement Unlocked</div>
            <div className="toast-name">{t.name}</div>
            <div className="toast-desc">{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
