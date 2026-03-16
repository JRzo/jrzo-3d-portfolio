import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Fog } from 'three';
import Car from './Car';
import World, { ZONES, ZONE_RADIUS } from './World';

const ZONE_RADIUS_SQ = ZONE_RADIUS * ZONE_RADIUS;

// Sky color — matches Bruno Simon warm daytime feel
const SKY_COLOR = '#87ceeb';

export default function Scene({ keys, onZoneChange, onDrive, onSpeedDemon, onPositionUpdate }) {
  const handlePositionUpdate = useCallback((pos) => {
    onPositionUpdate?.(pos);

    let activeZone = null;
    for (const zone of ZONES) {
      const dx = pos.x - zone.pos[0];
      const dz = pos.z - zone.pos[2];
      if (dx * dx + dz * dz < ZONE_RADIUS_SQ) {
        activeZone = zone.id;
        break;
      }
    }
    onZoneChange?.(activeZone);
  }, [onPositionUpdate, onZoneChange]);

  return (
    <Canvas
      camera={{ fov: 55, near: 0.5, far: 500, position: [0, 8, 16] }}
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ background: SKY_COLOR }}
      onCreated={({ scene }) => {
        // Fog makes the world feel alive — distant areas fade into the sky colour
        scene.background = new Fog(SKY_COLOR, 80, 260).color;
        scene.fog = new Fog(SKY_COLOR, 80, 260);
      }}
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

        {/* Low bloom threshold to catch the neon emissives, but mild so day-time colors stay clean */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.85}
            luminanceSmoothing={0.5}
            intensity={0.5}
            mipmapBlur
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
