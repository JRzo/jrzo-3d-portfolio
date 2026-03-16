import { useState, useCallback, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/ui/Navigation';
import Panel from './components/ui/Panel';
import AchievementStack, { notifyAchievement } from './components/ui/AchievementToast';
import MiniMap from './components/ui/MiniMap';
import { useAchievements } from './hooks/useAchievements';
import { useKeyboard } from './hooks/useKeyboard';

// Minimum squared distance the car must move before we trigger a minimap redraw.
// This prevents React re-rendering the entire tree at 60fps.
// 0.25 → ~0.5 world units of movement threshold.
const POS_UPDATE_THRESHOLD_SQ = 0.25;

export default function App() {
  const [ready,      setReady]      = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [openPanel,  setOpenPanel]  = useState(null);
  const [carPos,     setCarPos]     = useState({ x: 0, z: 0 });

  const keys = useKeyboard();

  // Throttle car position → only trigger React update when car moves ≥0.5 units.
  // Without this, setCarPos fires at 60fps and re-renders the entire App tree.
  const lastCarPos = useRef({ x: 0, z: 0 });
  const updateCarPos = useCallback((pos) => {
    const prev = lastCarPos.current;
    const dx = pos.x - prev.x;
    const dz = pos.z - prev.z;
    if (dx * dx + dz * dz >= POS_UPDATE_THRESHOLD_SQ) {
      lastCarPos.current = pos;
      setCarPos(pos);
    }
  }, []);

  // Achievements — uses refs internally so these callbacks are stable
  const achievements = useAchievements(notifyAchievement);

  // Zone tracking — deduplicated so the same zone only triggers once until you leave
  const lastZone = useRef(null);
  const onZoneChange = useCallback((zoneId) => {
    // zoneId may be null when car is between zones
    if (zoneId === lastZone.current) return;
    lastZone.current = zoneId;
    setActiveZone(zoneId);
    if (zoneId) achievements.onZoneEnter(zoneId);
  }, [achievements]);

  // Nav icon click — toggle panel for that zone
  const handleNavClick = useCallback((zoneId) => {
    setOpenPanel((prev) => (prev === zoneId ? null : zoneId));
  }, []);

  // ESC to close panel
  useEffect(() => {
    const handler = (e) => { if (e.code === 'Escape') setOpenPanel(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {!ready && <LoadingScreen onLoaded={() => setReady(true)} />}

      <div style={{ width: '100vw', height: '100vh' }}>
        <Scene
          keys={keys}
          onZoneChange={onZoneChange}
          onDrive={achievements.onDrive}
          onSpeedDemon={achievements.onSpeedDemon}
          onPositionUpdate={updateCarPos}
        />
      </div>

      {ready && (
        <>
          <Navigation
            activeZone={activeZone}
            openPanel={openPanel}
            onNavClick={handleNavClick}
          />
          <Panel zone={openPanel} onClose={() => setOpenPanel(null)} />
          <MiniMap carPos={carPos} activeZone={activeZone} />
          <AchievementStack />
          <div className="controls-hint">
            <span><kbd>W A S D</kbd> Drive</span>
            <span><kbd>Click nav icon</kbd> Open zone</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
        </>
      )}
    </>
  );
}
