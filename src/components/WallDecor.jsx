import { useMemo } from 'react';
import { createPosterTexture, createDominicanFlagTexture } from '../utils/createPosterTexture';

// ── Framed poster ─────────────────────────────────────────────────
function Poster({ type, position, rotation = [0, 0, 0] }) {
  const texture = useMemo(() => createPosterTexture(type), [type]);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[1.08, 1.62, 0.04]} />
        <meshStandardMaterial color="#111" roughness={0.45} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[0.95, 1.48]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Dominican flag (landscape, framed) ───────────────────────────
function DominicanFlag({ position, rotation = [0, 0, 0] }) {
  const texture = useMemo(() => createDominicanFlagTexture(), []);
  return (
    <group position={position} rotation={rotation}>
      {/* Frame — gold */}
      <mesh castShadow>
        <boxGeometry args={[1.52, 1.02, 0.04]} />
        <meshStandardMaterial color="#8a6e00" roughness={0.4} metalness={0.8} emissive="#6a5000" emissiveIntensity={0.1} />
      </mesh>
      {/* Flag face */}
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[1.38, 0.88]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Corner rosettes */}
      {[[-0.72, 0.47], [0.72, 0.47], [-0.72, -0.47], [0.72, -0.47]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.022]}>
          <circleGeometry args={[0.038, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} emissive="#d4af37" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ── Basketball ────────────────────────────────────────────────────
function Basketball({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.235, 32, 32]} />
        <meshStandardMaterial color="#c44200" roughness={0.65} />
      </mesh>
      <mesh><torusGeometry args={[0.24, 0.0055, 8, 48]} /><meshStandardMaterial color="#1a1a1a" roughness={0.9} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.24, 0.0055, 8, 48]} /><meshStandardMaterial color="#1a1a1a" roughness={0.9} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.24, 0.0055, 8, 24, Math.PI]} /><meshStandardMaterial color="#1a1a1a" roughness={0.9} /></mesh>
    </group>
  );
}

// ── Baseball bat ─────────────────────────────────────────────────
function BaseballBat({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -0.48, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.038, 0.62, 12]} />
        <meshStandardMaterial color="#5c3a18" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.058, 0.038, 0.28, 12]} />
        <meshStandardMaterial color="#5c3a18" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.072, 0.058, 0.44, 14]} />
        <meshStandardMaterial color="#5c3a18" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.073, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5c3a18" roughness={0.58} />
      </mesh>
      <mesh position={[0, -0.81, 0]}>
        <cylinderGeometry args={[0.048, 0.036, 0.045, 12]} />
        <meshStandardMaterial color="#4a2e10" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.24, 12]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── Soccer ball ──────────────────────────────────────────────────
function SoccerBall({ position }) {
  const patches = [
    [0, 0.228, 0],[0,-0.228,0],[0.216,0.07,0.065],[-0.216,0.07,0.065],
    [0.133,-0.18,0.165],[-0.133,-0.18,0.165],[0,0.07,0.228],
  ];
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.228, 32, 32]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.55} />
      </mesh>
      {patches.map((p, i) => (
        <mesh key={i} position={p}>
          <dodecahedronGeometry args={[0.072, 0]} />
          <meshStandardMaterial color="#111" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function WallDecor() {
  return (
    <group>
      {/* ── Sports posters on right wall ── */}
      <Poster type="nba"      position={[4.96, 1.88, -2.7]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster type="baseball" position={[4.96, 1.88, -1.0]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster type="soccer"   position={[4.96, 1.88,  0.7]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── Dominican Republic flag — back wall left of desk ── */}
      <DominicanFlag position={[-3.2, 2.1, -4.48]} rotation={[0, 0, 0]} />

      {/* ── Sports corner (right side, forward) ── */}
      <group position={[3.4, 0, 1.5]}>
        {/* Floor mat */}
        <mesh position={[0.4, 0.004, 0.55]}>
          <boxGeometry args={[2.0, 0.005, 2.0]} />
          <meshStandardMaterial color="#0c0c1a" roughness={0.9} />
        </mesh>
        {/* Corner neon border */}
        <mesh position={[0.4, 0.007, 1.54]}>
          <boxGeometry args={[2.0, 0.006, 0.006]} />
          <meshStandardMaterial color="#ff3399" emissive="#ff3399" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        {/* "SPORTS CORNER" label strip */}
        <mesh position={[0.4, 0.012, 1.52]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 0.1]} />
          <meshStandardMaterial color="#ff3399" emissive="#ff3399" emissiveIntensity={0.4} transparent opacity={0.5} toneMapped={false} />
        </mesh>

        {/* Basketball on plinth */}
        <Basketball position={[-0.3, 0.235, 0.3]} />
        <mesh position={[-0.3, 0.05, 0.3]}>
          <cylinderGeometry args={[0.13, 0.15, 0.1, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Baseball bat leaning */}
        <BaseballBat position={[0.82, 0.52, 0.9]} rotation={[0.2, -0.1, 0.16]} />

        {/* Soccer ball */}
        <SoccerBall position={[0.18, 0.228, 0.82]} />
      </group>
    </group>
  );
}
