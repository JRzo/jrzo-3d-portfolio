import MonitorScreen from './MonitorScreen';

export const DESK_POS = [0, 0, -3.3];

/**
 * Modern high-end developer desk:
 *  - Motorized standing-desk frame (visible brackets)
 *  - Ultra-wide curved centre monitor
 *  - Two side monitors on arms
 *  - Full-tower RGB PC with glass panel
 *  - Mechanical keyboard (TKL layout), large mouse pad
 *  - Headset stand, mic arm, stream deck, webcam
 *  - LED underglow and cable management
 */
export default function Desk({ repos = [], onEnterComputer }) {
  const deskW = 4.4, deskD = 1.1, deskH = 0.055;
  const legH = 0.76, surfaceY = legH + deskH / 2;

  // Desk frame cross-brace positions
  const legPos = [
    [-deskW / 2 + 0.14, legH / 2, -deskD / 2 + 0.12],
    [ deskW / 2 - 0.14, legH / 2, -deskD / 2 + 0.12],
    [-deskW / 2 + 0.14, legH / 2,  deskD / 2 - 0.12],
    [ deskW / 2 - 0.14, legH / 2,  deskD / 2 - 0.12],
  ];

  return (
    <group position={DESK_POS}>

      {/* ── Desk surface ── */}
      <mesh position={[0, surfaceY, 0]} castShadow receiveShadow>
        <boxGeometry args={[deskW, deskH, deskD]} />
        <meshStandardMaterial color="#1c1208" roughness={0.35} metalness={0.06} />
      </mesh>
      {/* Desk edge banding (metallic strip) */}
      <mesh position={[0, surfaceY, deskD / 2]}>
        <boxGeometry args={[deskW, 0.008, 0.008]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ── Legs (adjustable frame style) ── */}
      {legPos.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.048, legH, 0.048]} />
            <meshStandardMaterial color="#333" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Leg foot pad */}
          <mesh position={[0, -legH / 2, 0]}>
            <cylinderGeometry args={[0.038, 0.042, 0.02, 8]} />
            <meshStandardMaterial color="#222" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Cross-brace */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[deskW - 0.3, 0.025, 0.025]} />
        <meshStandardMaterial color="#333" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* ── Full-tower PC ── */}
      <group position={[-1.9, 0, -0.32]}>
        {/* Main body */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.24, 0.76, 0.52]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Glass side panel */}
        <mesh position={[0.121, 0.38, 0]}>
          <boxGeometry args={[0.005, 0.7, 0.46]} />
          <meshStandardMaterial color="#88aacc" transparent opacity={0.18} roughness={0.05} metalness={0.1} />
        </mesh>
        {/* Inside visible — RGB fans (3) */}
        {[0.16, 0, -0.16].map((z, i) => (
          <group key={i} position={[0.05, 0.42, z]}>
            <mesh>
              <cylinderGeometry args={[0.07, 0.07, 0.012, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#111" roughness={0.4} metalness={0.7} />
            </mesh>
            <mesh>
              <torusGeometry args={[0.065, 0.008, 8, 24]} />
              <meshStandardMaterial
                color={['#00f5ff', '#bf5fff', '#ff3399'][i]}
                emissive={['#00f5ff', '#bf5fff', '#ff3399'][i]}
                emissiveIntensity={2.5}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
        {/* Liquid cooling rad glow */}
        <mesh position={[0.05, 0.68, 0]}>
          <boxGeometry args={[0.01, 0.22, 0.38]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1} transparent opacity={0.5} toneMapped={false} />
        </mesh>
        {/* Front RGB strip */}
        <mesh position={[0.121, 0.38, -0.26]}>
          <boxGeometry args={[0.005, 0.62, 0.008]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        {/* Power button */}
        <mesh position={[0, 0.7, 0.261]}>
          <circleGeometry args={[0.015, 12]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={5} toneMapped={false} />
        </mesh>
        {/* PC light contribution */}
        <pointLight position={[0.15, 0.4, 0]} intensity={2} color="#00f5ff" distance={1.5} decay={2} />
      </group>

      {/* ── Desk mat ── */}
      <mesh position={[0.3, surfaceY + 0.004, 0.06]}>
        <boxGeometry args={[2.6, 0.005, 0.9]} />
        <meshStandardMaterial color="#060610" roughness={0.96} />
      </mesh>
      {/* Desk mat RGB edge */}
      <mesh position={[0.3, surfaceY + 0.007, 0.06 + 0.455]}>
        <boxGeometry args={[2.6, 0.006, 0.006]} />
        <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* ── TKL Mechanical keyboard ── */}
      <group position={[0.2, surfaceY + 0.038, 0.22]}>
        <mesh castShadow>
          <boxGeometry args={[0.68, 0.02, 0.25]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Key rows — subtle grid */}
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
            <mesh key={`${row}-${col}`} position={[-0.3 + col * 0.052, 0.013, -0.09 + row * 0.048]}>
              <boxGeometry args={[0.044, 0.008, 0.04]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
            </mesh>
          ))
        )}
        {/* Per-key RGB glow (accent keys) */}
        <mesh position={[0, 0.016, 0.085]}>
          <boxGeometry args={[0.68, 0.003, 0.008]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
      </group>

      {/* ── Mouse ── */}
      <mesh position={[0.62, surfaceY + 0.034, 0.2]} castShadow>
        <boxGeometry args={[0.078, 0.02, 0.14]} />
        <meshStandardMaterial color="#111" roughness={0.35} metalness={0.65} />
      </mesh>
      <mesh position={[0.62, surfaceY + 0.046, 0.18]}>
        <boxGeometry args={[0.016, 0.008, 0.016]} />
        <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* ── Headset stand ── */}
      <group position={[1.7, surfaceY, 0.1]}>
        {/* Base */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.08, 0.02, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pole */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.36, 8]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Hook */}
        <mesh position={[0, 0.37, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.07, 0.01, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#444" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Headset on stand */}
        <mesh position={[0, 0.44, 0]}>
          <torusGeometry args={[0.065, 0.015, 8, 20, Math.PI * 1.1]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.5} metalness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.068, 0.35, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.055, 10]} />
            <meshStandardMaterial color="#0d0d0d" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── Mic arm + mic ── */}
      <group position={[-0.85, surfaceY, -0.48]}>
        {/* Arm */}
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.012, 0.56, 0.012]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.08, 0.58, 0]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.012, 0.32, 0.012]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Mic capsule */}
        <mesh position={[0.18, 0.68, 0]}>
          <cylinderGeometry args={[0.025, 0.022, 0.1, 12]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Mic RGB ring */}
        <mesh position={[0.18, 0.71, 0]}>
          <torusGeometry args={[0.026, 0.004, 8, 20]} />
          <meshStandardMaterial color="#ff3399" emissive="#ff3399" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>

      {/* ── Stream deck (macro pad) ── */}
      <mesh position={[-0.3, surfaceY + 0.032, 0.36]} castShadow>
        <boxGeometry args={[0.16, 0.018, 0.1]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* 3x3 button grid */}
      {[-1, 0, 1].map((row) =>
        [-1, 0, 1].map((col) => (
          <mesh key={`${row}-${col}`} position={[-0.3 + col * 0.048, surfaceY + 0.043, 0.36 + row * 0.03]}>
            <boxGeometry args={[0.036, 0.006, 0.022]} />
            <meshStandardMaterial
              color={['#00f5ff', '#bf5fff', '#ff3399'][(Math.abs(row + col)) % 3]}
              emissive={['#00f5ff', '#bf5fff', '#ff3399'][(Math.abs(row + col)) % 3]}
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
        ))
      )}

      {/* ── Webcam on centre monitor (added in MonitorScreen group) ── */}
      <mesh position={[0, surfaceY + 1.96, -0.1]}>
        <boxGeometry args={[0.1, 0.028, 0.028]} />
        <meshStandardMaterial color="#111" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, surfaceY + 1.96, -0.087]}>
        <circleGeometry args={[0.01, 12]} />
        <meshStandardMaterial color="#001133" roughness={0.1} />
      </mesh>

      {/* ── Mug ── */}
      <mesh position={[1.5, surfaceY + 0.065, 0.06]} castShadow>
        <cylinderGeometry args={[0.048, 0.042, 0.11, 14]} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.6} />
      </mesh>
      <mesh position={[1.545, surfaceY + 0.07, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.026, 0.008, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.6} />
      </mesh>

      {/* ── Underglow LED strip ── */}
      <mesh position={[0, 0.004, 0]}>
        <boxGeometry args={[deskW - 0.1, 0.005, deskD - 0.1]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.06, 0]} intensity={3} color="#00f5ff" distance={2.5} decay={2} />

      {/* ── Three Monitors ── */}
      {/* Left — standard 27" angled in */}
      <MonitorScreen
        repo={repos[0]}
        index={0}
        position={[-1.55, surfaceY + 0.88, -0.1]}
        rotation={[0, 0.3, 0]}
        size={[1.28, 0.82]}
        onEnterComputer={onEnterComputer}
      />
      {/* Centre — ultra-wide 34" curved, slightly taller mount */}
      <MonitorScreen
        repo={repos[1]}
        index={1}
        position={[0, surfaceY + 0.98, -0.1]}
        rotation={[0, 0, 0]}
        size={[1.78, 0.88]}
        isUltrawide
        onEnterComputer={onEnterComputer}
      />
      {/* Right — standard 27" angled in */}
      <MonitorScreen
        repo={repos[2]}
        index={2}
        position={[1.55, surfaceY + 0.88, -0.1]}
        rotation={[0, -0.3, 0]}
        size={[1.28, 0.82]}
        onEnterComputer={onEnterComputer}
      />

      {/* ── Desk Chair ── */}
      <group position={[0, 0, 1.0]}>
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.66, 0.072, 0.66]} />
          <meshStandardMaterial color="#16162a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[0.58, 0.028, 0.58]} />
          <meshStandardMaterial color="#1c1c38" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.02, -0.32]} castShadow>
          <boxGeometry args={[0.62, 0.74, 0.072]} />
          <meshStandardMaterial color="#16162a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.44, -0.31]}>
          <boxGeometry args={[0.36, 0.2, 0.068]} />
          <meshStandardMaterial color="#1c1c38" roughness={0.7} />
        </mesh>
        {/* Red accent stripe on backrest */}
        <mesh position={[0, 1.02, -0.285]}>
          <boxGeometry args={[0.06, 0.74, 0.004]} />
          <meshStandardMaterial color="#ff3399" emissive="#ff3399" emissiveIntensity={1} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.036, 0.036, 0.52, 10]} />
          <meshStandardMaterial color="#555" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.036, 5]} />
          <meshStandardMaterial color="#2e2e2e" metalness={0.8} roughness={0.3} />
        </mesh>
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <mesh key={i} position={[Math.cos((deg * Math.PI) / 180) * 0.33, 0.01, Math.sin((deg * Math.PI) / 180) * 0.33]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.37, 0.78, -0.06]}>
              <boxGeometry args={[0.052, 0.3, 0.052]} />
              <meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[s * 0.37, 0.94, 0.12]}>
              <boxGeometry args={[0.052, 0.036, 0.34]} />
              <meshStandardMaterial color="#16162a" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
