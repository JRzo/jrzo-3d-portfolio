import { useEffect, useMemo, useRef } from 'react';
import { createMonitorTexture } from '../utils/createMonitorTexture';

/**
 * Single monitor — bezel, screen (live CanvasTexture), stand.
 *
 * Props:
 *   repo            - GitHub repo object
 *   index           - 0-based monitor index (affects accent colour)
 *   position        - [x, y, z]
 *   rotation        - [rx, ry, rz]
 *   size            - [width, height] of screen face
 *   isUltrawide     - true → slightly thinner bezel + curved tint
 *   onEnterComputer - callback when user clicks the screen (opens overlay)
 */
export default function MonitorScreen({
  repo,
  index = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [1.6, 1.0],
  isUltrawide = false,
  onEnterComputer,
}) {
  const meshRef = useRef();
  const texRef  = useRef(null);

  // Build initial texture once on mount
  const initialTexture = useMemo(() => {
    const tex = createMonitorTexture(repo, index);
    texRef.current = tex;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh texture when GitHub data arrives
  useEffect(() => {
    if (!meshRef.current) return;
    const newTex = createMonitorTexture(repo, index);
    texRef.current?.dispose();
    texRef.current = newTex;
    meshRef.current.material.map = newTex;
    meshRef.current.material.needsUpdate = true;
  }, [repo, index]);

  const [sw, sh] = size;
  const bp = isUltrawide ? 0.04 : 0.055; // bezel padding

  const ACCENTS = ['#00f5ff', '#bf5fff', '#ff3399'];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <group position={position} rotation={rotation}>
      {/* Bezel */}
      <mesh castShadow>
        <boxGeometry args={[sw + bp * 2, sh + bp * 2, 0.05]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Screen face */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0.028]}
        onClick={(e) => {
          e.stopPropagation();
          // Primary action: open the GitHub desktop overlay
          onEnterComputer?.();
        }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <planeGeometry args={[sw, sh]} />
        <meshBasicMaterial map={initialTexture} toneMapped={false} />
      </mesh>

      {/* Edge glow */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[sw + 0.016, sh + 0.016]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
          transparent
          opacity={0.07}
          toneMapped={false}
        />
      </mesh>

      {/* Ultrawide tint (subtle screen curve illusion) */}
      {isUltrawide && (
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[sw, sh]} />
          <meshStandardMaterial transparent opacity={0.04} color="#001122" />
        </mesh>
      )}

      {/* Monitor neck */}
      <mesh position={[0, -sh / 2 - 0.14, 0.01]}>
        <boxGeometry args={[0.085, 0.22, 0.085]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Monitor arm (for side monitors) */}
      {!isUltrawide && (
        <mesh position={[0, -sh / 2 - 0.09, -0.06]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.04, 0.18, 0.04]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
      )}
      {/* Stand base */}
      <mesh position={[0, -sh / 2 - 0.26, 0.12]}>
        <boxGeometry args={[isUltrawide ? 0.6 : 0.5, 0.035, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Accent LED on back of stand neck */}
      <mesh position={[0, -sh / 2 - 0.08, -0.027]}>
        <boxGeometry args={[0.04, 0.005, 0.005]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}
