import { useState, useCallback, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/ui/Navigation';
import Panel from './components/ui/Panel';
import AchievementStack, { notifyAchievement } from './components/ui/AchievementToast';
import MiniMap from './components/ui/MiniMap';
import { useAchievements } from './hooks/useAchievements';
import { useKeyboard } from './hooks/useKeyboard';
import { ZONES } from './components/World';

const POS_THRESHOLD_SQ = 0.25;

export default function App() {
  // ready = true only after BOTH the loading animation completes AND the physics
  // scene fires its first frame (guarantees Rapier WASM is loaded and rendering).
  const [ready,        setReady]        = useState(false);
  const [activeZone,   setActiveZone]   = useState(null);
  const [openPanel,    setOpenPanel]    = useState(null);
  const [charPos,      setCharPos]      = useState({ x: 0, z: 0 });

  const sceneReadyRef   = useRef(false);
  const loadingDoneRef  = useRef(false);

  const trySetReady = useCallback(() => {
    if (sceneReadyRef.current && loadingDoneRef.current) setReady(true);
  }, []);

  const onSceneReady = useCallback(() => {
    sceneReadyRef.current = true;
    trySetReady();
  }, [trySetReady]);

  const onLoadingComplete = useCallback(() => {
    loadingDoneRef.current = true;
    trySetReady();
  }, [trySetReady]);

  const keys = useKeyboard();

  /* Throttled position → avoid 60fps React re-renders */
  const lastPos = useRef({ x: 0, z: 0 });
  const updatePos = useCallback((pos) => {
    const dx = pos.x - lastPos.current.x;
    const dz = pos.z - lastPos.current.z;
    if (dx * dx + dz * dz >= POS_THRESHOLD_SQ) {
      lastPos.current = pos;
      setCharPos(pos);
    }
  }, []);

  const achievements = useAchievements(notifyAchievement);

  const lastZone = useRef(null);
  const onZoneChange = useCallback((zoneId) => {
    if (zoneId === lastZone.current) return;
    lastZone.current = zoneId;
    setActiveZone(zoneId);
    if (zoneId) achievements.onZoneEnter(zoneId);
  }, [achievements]);

  const handleNavClick = useCallback((zoneId) => {
    setOpenPanel((prev) => (prev === zoneId ? null : zoneId));
  }, []);

  /* E = enter/close zone, ESC = close panel */
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Escape') {
        setOpenPanel(null);
      } else if (e.code === 'KeyE') {
        setOpenPanel((prev) => {
          if (prev) return null;
          return lastZone.current ?? null;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const zoneMeta   = activeZone ? ZONES.find(z => z.id === activeZone) : null;
  const showPrompt = activeZone && !openPanel;

  return (
    <>
      {/* Loading screen renders on top; Canvas renders behind it from the start
          so Rapier/Three.js can initialize while the user watches the progress bar */}
      {!ready && <LoadingScreen onLoaded={onLoadingComplete} />}

      <div style={{ width: '100vw', height: '100vh' }}>
        <Scene
          keys={keys}
          onZoneChange={onZoneChange}
          onWalk={achievements.onWalk}
          onSprintUnlock={achievements.onSprintUnlock}
          onPositionUpdate={updatePos}
          onReady={onSceneReady}
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

          {/* Zone entry prompt */}
          <div
            className={`zone-prompt ${showPrompt ? 'visible' : ''}`}
            style={zoneMeta ? { borderColor: zoneMeta.color, color: zoneMeta.color } : {}}
            onClick={() => showPrompt && setOpenPanel(activeZone)}
          >
            <kbd style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 5, padding: '1px 7px',
              fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
            }}>E</kbd>
            {zoneMeta && <span>Enter {zoneMeta.label}</span>}
          </div>

          <MiniMap carPos={charPos} activeZone={activeZone} />
          <AchievementStack />

          <div className="controls-hint">
            <span><kbd>W A S D</kbd> Walk</span>
            <span><kbd>Shift</kbd> Run</span>
            <span><kbd>Space</kbd> Jump</span>
            <span><kbd>E</kbd> Enter</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
        </>
      )}
    </>
  );
}
