import React, { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { Fog } from 'three';
import Character from './Character';
import World, { ZONES, ZONE_RADIUS } from './World';
import { StaticCharacter } from './Character';

const ZONE_RADIUS_SQ = ZONE_RADIUS * ZONE_RADIUS;
const SKY_COLOR = '#c8dff0';

/* Fires onReady on the very first useFrame tick inside <Physics>,
   guaranteeing Rapier WASM is fully loaded before we dismiss the loading screen. */
function ReadySignal({ onReady }) {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) { fired.current = true; onReady?.(); }
  });
  return null;
}

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    // eslint-disable-next-line no-console
    console.error('[Scene] Runtime error:', err);
    this.props.onError?.(err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default function Scene({ keys, onZoneChange, onWalk, onSprintUnlock, onPositionUpdate, onReady }) {
  const handlePositionUpdate = useCallback((pos) => {
    onPositionUpdate?.(pos);
    let activeZone = null;
    for (const zone of ZONES) {
      const dx = pos.x - zone.pos[0];
      const dz = pos.z - zone.pos[2];
      if (dx * dx + dz * dz < ZONE_RADIUS_SQ) { activeZone = zone.id; break; }
    }
    onZoneChange?.(activeZone);
  }, [onPositionUpdate, onZoneChange]);

  const [physicsFailed, setPhysicsFailed] = useState(false);

  return (
    <Canvas
      camera={{ fov: 55, near: 0.5, far: 400, position: [0, 8, 16] }}
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={1}
      style={{ background: SKY_COLOR }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color(SKY_COLOR);
        scene.fog = new Fog(SKY_COLOR, 80, 220);
      }}
    >
      <ReadySignal onReady={onReady} />
      <SceneErrorBoundary
        onError={() => setPhysicsFailed(true)}
        fallback={(
          <>
            <World enablePhysics={false} />
            <StaticCharacter />
          </>
        )}
      >
        <Suspense fallback={null}>
          {physicsFailed ? (
            <>
              <World enablePhysics={false} />
              <StaticCharacter />
            </>
          ) : (
            <Physics gravity={[0, -20, 0]} timeStep="vary">
              <World />
              <Character
                keys={keys}
                onWalk={onWalk}
                onSprintUnlock={onSprintUnlock}
                onPositionUpdate={handlePositionUpdate}
              />
            </Physics>
          )}
        </Suspense>
      </SceneErrorBoundary>
    </Canvas>
  );
}
