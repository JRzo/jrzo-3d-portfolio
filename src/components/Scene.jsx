import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Car from './Car';
import World, { ZONES, ZONE_RADIUS } from './World';

// Pre-compute squared zone radius to avoid Math.sqrt every frame
const ZONE_RADIUS_SQ = ZONE_RADIUS * ZONE_RADIUS;

export default function Scene({ keys, onZoneChange, onDrive, onSpeedDemon, onPositionUpdate }) {
  // useCallback so Car never gets a new function reference from a parent re-render
  const handlePositionUpdate = useCallback((pos) => {
    onPositionUpdate?.(pos);

    // Zone detection — use squared distance (no sqrt) for performance
    let activeZone = null;
    for (const zone of ZONES) {
      const dx = pos.x - zone.pos[0];
      const dz = pos.z - zone.pos[2];
      if (dx * dx + dz * dz < ZONE_RADIUS_SQ) {
        activeZone = zone.id;
        break;
      }
    }
    // Always report current zone (or null when between zones) — App deduplicates
    onZoneChange?.(activeZone);
  }, [onPositionUpdate, onZoneChange]);

  return (
    <Canvas
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 5.5, 11] }}
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ background: '#050508' }}
    >
      <Suspense fallback={null}>
        <Physics gravity={[0, -20, 0]} timeStep="vary">
          <World />
          <Car
            keys={keys}
            onDrive={onDrive}
            onSpeedDemon={onSpeedDemon}
            onPositionUpdate={handlePositionUpdate}
          />
        </Physics>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            intensity={0.7}
            mipmapBlur
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
