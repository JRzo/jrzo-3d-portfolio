import React, { Suspense, useCallback, useRef, useState } from 'react';
import { Sky } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import Character from './Character';
import World, { ZONES, ZONE_RADIUS } from './World';
import { StaticCharacter } from './Character';

const ZONE_RADIUS_SQ = ZONE_RADIUS * ZONE_RADIUS;
const DAY_SKY = '#c8dff0';
const NIGHT_SKY = '#0b1424';

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

export default function Scene({
  keys,
  onZoneChange,
  onWalk,
  onSprintUnlock,
  onPositionUpdate,
  onReady,
  isNight = false,
  onPhysicsError,
}) {
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

  const skyColor = isNight ? NIGHT_SKY : DAY_SKY;

  return (
    <Canvas
      camera={{ fov: 55, near: 0.5, far: 400, position: [0, 8, 16] }}
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={1}
      style={{ background: skyColor }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color(skyColor);
      }}
    >
      <ReadySignal onReady={onReady} />
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, isNight ? 60 : 80, isNight ? 180 : 220]} />
      <Sky
        distance={450000}
        sunPosition={isNight ? [1, 0.15, -1] : [0.8, 1, 0.2]}
        turbidity={isNight ? 8 : 3}
        rayleigh={isNight ? 1.5 : 2}
        mieCoefficient={isNight ? 0.03 : 0.005}
        mieDirectionalG={isNight ? 0.7 : 0.85}
      />
      <SceneErrorBoundary
        onError={() => {
          setPhysicsFailed(true);
          onPhysicsError?.();
        }}
        fallback={(
          <>
            <World enablePhysics={false} isNight={isNight} />
            <StaticCharacter />
          </>
        )}
      >
        <Suspense fallback={null}>
          {physicsFailed ? (
            <>
              <World enablePhysics={false} isNight={isNight} />
              <StaticCharacter />
            </>
          ) : (
            <Physics gravity={[0, -20, 0]} timeStep="vary">
              <World isNight={isNight} />
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
