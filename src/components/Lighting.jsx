// RectAreaLight requires this initialisation — without it the lights emit nothing.
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init();

export default function Lighting() {
  return (
    <>
      {/* ── Base fill ── bright enough to see the whole room ── */}
      <ambientLight intensity={0.55} color="#ccd4ff" />

      {/* Hemisphere: warm floor bounce + cool sky from ceiling */}
      <hemisphereLight
        skyColor="#c8d8ff"
        groundColor="#221a0a"
        intensity={0.6}
      />

      {/* Primary ceiling directional (shadows) */}
      <directionalLight
        position={[2, 6, 3]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* ── Monitor RectAreaLights (cyan screen glow) ── */}
      {/* NOTE: RectAreaLights shine in the -Z direction of their local frame.
               We rotate 180° Y so they face into the room (toward +Z). */}
      <rectAreaLight
        position={[-1.6, 1.72, -2.75]}
        rotation={[0, Math.PI, 0]}
        width={1.3}
        height={0.9}
        intensity={12}
        color="#00f5ff"
      />
      <rectAreaLight
        position={[0, 1.85, -2.75]}
        rotation={[0, Math.PI, 0]}
        width={1.65}
        height={1.05}
        intensity={15}
        color="#00f5ff"
      />
      <rectAreaLight
        position={[1.6, 1.72, -2.75]}
        rotation={[0, Math.PI, 0]}
        width={1.3}
        height={0.9}
        intensity={12}
        color="#00f5ff"
      />

      {/* ── Neon accent point lights ── */}
      {/* Left wall purple */}
      <pointLight position={[-4.6, 2.4,  0]}   intensity={8}  color="#bf5fff" distance={8}  decay={2} />
      {/* Right wall pink */}
      <pointLight position={[ 4.6, 2.4,  0]}   intensity={8}  color="#ff3399" distance={8}  decay={2} />
      {/* Back wall cyan */}
      <pointLight position={[ 0,   3.1, -4.0]} intensity={6}  color="#00f5ff" distance={6}  decay={2} />
      {/* Front fill */}
      <pointLight position={[ 0,   2.5,  3.5]} intensity={4}  color="#aaccff" distance={7}  decay={2} />

      {/* Terminal hologram — green */}
      <pointLight position={[2.8, 1.8, -1.2]} intensity={10} color="#00ff88" distance={4}  decay={2} />

      {/* Character warm key light */}
      <spotLight
        position={[0, 3.4, 1.0]}
        intensity={18}
        color="#ffd580"
        angle={Math.PI / 5}
        penumbra={0.7}
        distance={7}
        decay={2}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      {/* Desk under-light (monitor bounce fill) */}
      <pointLight position={[0, 1.1, -3.0]} intensity={5} color="#00c8ff" distance={3} decay={2} />
    </>
  );
}
