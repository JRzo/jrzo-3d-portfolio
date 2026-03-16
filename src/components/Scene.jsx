import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Vector3 } from 'three';

import Lighting   from './Lighting';
import Room       from './Room';
import Desk       from './Desk';
import Bookshelf  from './Bookshelf';
import WallDecor  from './WallDecor';
import Terminal   from './Terminal';
import Avatar     from './Avatar';
import Bed        from './Bed';
import Closet     from './Closet';
import { useGitHub } from '../hooks/useGitHub';

// Camera destination when zooming into the computer
const CAM_DEFAULT = { pos: new Vector3(0, 2.0, 5.2),    look: new Vector3(0, 1.1, -1.5) };
const CAM_MONITOR = { pos: new Vector3(0, 1.85, -1.4),  look: new Vector3(0, 1.85, -3.3) };

// ── Camera animation controller ────────────────────────────────────
function CameraController({ computerMode, onArrived, controlsRef }) {
  const { camera } = useThree();
  const arrived    = useRef(false);

  useEffect(() => {
    if (!computerMode) arrived.current = false;
  }, [computerMode]);

  useFrame(() => {
    if (!controlsRef.current) return;
    const dest = computerMode ? CAM_MONITOR : CAM_DEFAULT;

    camera.position.lerp(dest.pos, computerMode ? 0.07 : 0.05);
    controlsRef.current.target.lerp(dest.look, computerMode ? 0.07 : 0.05);
    controlsRef.current.update();

    // Disable manual orbit while zooming in
    controlsRef.current.enabled = !computerMode;

    // Fire callback once camera is close enough
    if (computerMode && !arrived.current) {
      const dist = camera.position.distanceTo(dest.pos);
      if (dist < 0.3) {
        arrived.current = true;
        onArrived?.();
      }
    }
  });

  return null;
}

// ── All 3D content ────────────────────────────────────────────────
function Experience({ computerMode, onEnterComputer }) {
  const { repos } = useGitHub('JRzo');

  return (
    <>
      <Lighting />
      <Room />
      <Desk repos={repos} onEnterComputer={onEnterComputer} />
      <Bookshelf />
      <WallDecor />
      <Terminal />
      <Avatar />
      <Bed />
      <Closet />
    </>
  );
}

// ── Main Canvas export ────────────────────────────────────────────
export default function Scene({ computerMode, onEnterComputer, onComputerArrived }) {
  const controlsRef = useRef();

  return (
    <Canvas
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
      dpr={[1, 2]}
      toneMapping={2}
      toneMappingExposure={0.9}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 2.0, 5.2]}
        fov={62}
        near={0.1}
        far={60}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={2.0}
        maxDistance={9}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.1}
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
        target={[0, 1.1, -1.5]}
      />

      <CameraController
        computerMode={computerMode}
        onArrived={onComputerArrived}
        controlsRef={controlsRef}
      />

      <Suspense fallback={null}>
        <Experience computerMode={computerMode} onEnterComputer={onEnterComputer} />
      </Suspense>

      <EffectComposer multisampling={4}>
        <Bloom intensity={1.4} luminanceThreshold={0.85} luminanceSmoothing={0.03} mipmapBlur radius={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
