/**
 * Avatar component
 *
 * ── HOW TO SWAP IN YOUR REAL CHARACTER ─────────────────────────────────────
 *
 *  1. Build your avatar at  https://readyplayer.me
 *     ▸ Select male, ~6'1" Afro-Latino appearance
 *     ▸ Choose a tech-wear hoodie or clean jersey
 *     ▸ Download the .glb file  →  place at /public/avatar.glb
 *
 *  2. Get animations from  https://mixamo.com
 *     ▸ Upload your .glb, choose "Typing" or "Standing Idle"
 *     ▸ Download FBX → convert:  npx @gltf-transform/cli fromfbx typing.fbx typing.glb
 *
 *  3. Set AVATAR_READY = true below — GLTFAvatar renders automatically.
 *
 * ── CONTROLS ────────────────────────────────────────────────────────────────
 *  W / ↑   move forward     S / ↓   move backward
 *  A / ←   strafe left      D / →   strafe right
 *  Character turns to face the direction of movement.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboard } from '../hooks/useKeyboard';
// import { useGLTF, useAnimations } from '@react-three/drei';   ← uncomment with GLB

const AVATAR_READY = false; // ← flip to true after adding /public/avatar.glb

const SPEED   = 2.8;   // units per second
const TURN_SP = 12;    // rotation lerp speed
// Room walk bounds (keep inside walls)
const BOUNDS  = { minX: -4.2, maxX: 4.2, minZ: -3.8, maxZ: 3.8 };

// ── Low-poly placeholder character ───────────────────────────────
function PlaceholderCharacter() {
  const rootRef = useRef();
  const headRef = useRef();
  const rArmRef = useRef();
  const lArmRef = useRef();
  const keys    = useKeyboard();

  // Movement state (avoids React re-renders)
  const vel = useRef({ x: 0, z: 0 });

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (!rootRef.current) return;

    // ── Keyboard input ──────────────────────────────
    const fwd  = keys.current.has('KeyW') || keys.current.has('ArrowUp');
    const back = keys.current.has('KeyS') || keys.current.has('ArrowDown');
    const left = keys.current.has('KeyA') || keys.current.has('ArrowLeft');
    const right= keys.current.has('KeyD') || keys.current.has('ArrowRight');

    let dx = 0, dz = 0;
    if (fwd)   dz -= 1;
    if (back)  dz += 1;
    if (left)  dx -= 1;
    if (right) dx += 1;

    const moving = dx !== 0 || dz !== 0;

    if (moving) {
      // Normalise diagonal movement
      const len = Math.sqrt(dx * dx + dz * dz);
      dx /= len; dz /= len;

      // Apply speed
      const nx = rootRef.current.position.x + dx * SPEED * delta;
      const nz = rootRef.current.position.z + dz * SPEED * delta;

      // Clamp to room bounds
      rootRef.current.position.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, nx));
      rootRef.current.position.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, nz));

      // Rotate to face movement direction
      const targetAngle = Math.atan2(dx, dz);
      const cur = rootRef.current.rotation.y;
      // Shortest-path lerp
      let diff = targetAngle - cur;
      while (diff >  Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      rootRef.current.rotation.y += diff * Math.min(TURN_SP * delta, 1);
    }

    // ── Idle animations (always running) ──────────
    // Breathing
    const breathScale = 1 + Math.sin(t * 1.4) * 0.004;
    rootRef.current.scale.y = breathScale;

    // Head look-around (only when not moving)
    if (headRef.current) {
      const targetLook = moving ? 0 : Math.sin(t * 0.35) * 0.14;
      headRef.current.rotation.y += (targetLook - headRef.current.rotation.y) * 0.05;
    }

    // Arm typing motion (only when near desk, i.e. not moving much)
    if (rArmRef.current) {
      const intensity = moving ? 0.0 : 0.07;
      rArmRef.current.rotation.x = -0.35 + Math.sin(t * 4.2) * intensity;
    }
    if (lArmRef.current) {
      const intensity = moving ? 0.0 : 0.06;
      lArmRef.current.rotation.x = -0.22 + Math.sin(t * 4.2 + 1.1) * intensity;
    }

    // Walking arm swing
    if (moving && lArmRef.current && rArmRef.current) {
      rArmRef.current.rotation.x = Math.sin(t * 6) * 0.4;
      lArmRef.current.rotation.x = -Math.sin(t * 6) * 0.4;
    }
  });

  const skin   = '#6b3a2a';
  const hoodie = '#1a1a2e';
  const accent = '#252540';
  const pants  = '#0d0d1a';
  const shoe   = '#1a1a1a';

  return (
    <group ref={rootRef} position={[0, 0, -1.0]}>
      {/* ── Torso ── */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <boxGeometry args={[0.46, 0.52, 0.26]} />
        <meshStandardMaterial color={hoodie} roughness={0.75} />
      </mesh>
      {/* Hoodie front panel */}
      <mesh position={[0, 1.22, 0.133]}>
        <planeGeometry args={[0.4, 0.46]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 1.52, 0.1]}>
        <boxGeometry args={[0.28, 0.06, 0.06]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* Hoodie pocket */}
      <mesh position={[0, 1.04, 0.135]}>
        <boxGeometry args={[0.22, 0.1, 0.01]} />
        <meshStandardMaterial color="#1c1c36" roughness={0.9} />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, 1.57, 0]}>
        <cylinderGeometry args={[0.062, 0.07, 0.14, 10]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* ── Head ── */}
      <group ref={headRef} position={[0, 1.74, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.28, 0.26]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {/* Afro */}
        <mesh position={[0, 0.14, 0]}>
          <sphereGeometry args={[0.17, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.68]} />
          <meshStandardMaterial color="#120600" roughness={0.92} />
        </mesh>
        {/* Side puff */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.13, 0.04, 0]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#120600" roughness={0.92} />
          </mesh>
        ))}
        {/* Eyes */}
        {[-0.07, 0.07].map((x, i) => (
          <mesh key={i} position={[x, 0.03, 0.133]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
        {/* Brows */}
        {[-0.07, 0.07].map((x, i) => (
          <mesh key={i} position={[x, 0.065, 0.134]}>
            <boxGeometry args={[0.045, 0.012, 0.005]} />
            <meshStandardMaterial color="#2a1200" roughness={0.9} />
          </mesh>
        ))}
        {/* Nose */}
        <mesh position={[0, -0.02, 0.136]}>
          <boxGeometry args={[0.028, 0.024, 0.01]} />
          <meshStandardMaterial color="#7a4030" roughness={0.7} />
        </mesh>
      </group>

      {/* ── Left arm ── */}
      <group ref={lArmRef} position={[-0.3, 1.18, 0]}>
        <mesh castShadow rotation={[0.1, 0, 0.14]}>
          <boxGeometry args={[0.12, 0.44, 0.14]} />
          <meshStandardMaterial color={hoodie} roughness={0.75} />
        </mesh>
        <mesh position={[-0.01, -0.26, 0.06]}>
          <boxGeometry args={[0.1, 0.08, 0.12]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>

      {/* ── Right arm ── */}
      <group ref={rArmRef} position={[0.3, 1.22, 0.06]}>
        <mesh castShadow rotation={[-0.35, 0, -0.1]}>
          <boxGeometry args={[0.12, 0.42, 0.14]} />
          <meshStandardMaterial color={hoodie} roughness={0.75} />
        </mesh>
        <mesh position={[0.01, -0.24, 0.12]}>
          <boxGeometry args={[0.1, 0.08, 0.12]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>

      {/* ── Legs ── */}
      {[-0.12, 0.12].map((x, i) => (
        <group key={i} position={[x, 0.68, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.46, 0.22]} />
            <meshStandardMaterial color={pants} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.26, 0.05]} castShadow>
            <boxGeometry args={[0.17, 0.08, 0.29]} />
            <meshStandardMaterial color={shoe} roughness={0.45} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.305, 0.055]}>
            <boxGeometry args={[0.175, 0.015, 0.295]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── GLTF Avatar (uncomment when /public/avatar.glb is ready) ────
/*
function GLTFAvatar() {
  const groupRef = useRef();
  const { scene, animations } = useGLTF('/avatar.glb');
  const { actions, names } = useAnimations(animations, groupRef);
  const keys = useKeyboard();

  useEffect(() => {
    const pick =
      names.find((n) => /typing/i.test(n)) ||
      names.find((n) => /idle/i.test(n)) ||
      names[0];
    if (pick && actions[pick]) {
      actions[pick].reset().fadeIn(0.5).play();
      return () => { actions[pick]?.fadeOut(0.5); };
    }
  }, [actions, names]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const fwd  = keys.current.has('KeyW') || keys.current.has('ArrowUp');
    const back = keys.current.has('KeyS') || keys.current.has('ArrowDown');
    const left = keys.current.has('KeyA') || keys.current.has('ArrowLeft');
    const right= keys.current.has('KeyD') || keys.current.has('ArrowRight');
    let dx = (right ? 1 : 0) - (left ? 1 : 0);
    let dz = (back  ? 1 : 0) - (fwd  ? 1 : 0);
    if (dx || dz) {
      const len = Math.sqrt(dx*dx + dz*dz);
      dx /= len; dz /= len;
      groupRef.current.position.x = Math.max(-4.2, Math.min(4.2, groupRef.current.position.x + dx * SPEED * delta));
      groupRef.current.position.z = Math.max(-3.8, Math.min(3.8, groupRef.current.position.z + dz * SPEED * delta));
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -1]}>
      <primitive object={scene} />
    </group>
  );
}
useGLTF.preload('/avatar.glb');
*/

export default function Avatar() {
  return <PlaceholderCharacter />;
}
