// Room dimensions (metres)
export const ROOM = { W: 10, H: 3.2, D: 9 };

function NeonStrip({ position, rotation = [0, 0, 0], length, color }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[length, 0.035, 0.035]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={4}
        toneMapped={false}
      />
    </mesh>
  );
}

function Column({ position }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.18, ROOM.H, 0.18]} />
      <meshStandardMaterial color="#1c1c2e" roughness={0.6} metalness={0.35} />
    </mesh>
  );
}

export default function Room() {
  const { W, H, D } = ROOM;

  return (
    <group>
      {/* ── Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#141414" roughness={0.35} metalness={0.08} />
      </mesh>

      {/* Floor grid */}
      <gridHelper
        args={[W, 22, '#15253a', '#0f0f1a']}
        position={[0, 0.002, 0]}
      />

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.9} />
      </mesh>

      {/* ── Back wall ── */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#11111e" roughness={0.75} />
      </mesh>

      {/* ── Left wall ── */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-W / 2, H / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#0f0f1c" roughness={0.75} />
      </mesh>

      {/* ── Right wall ── */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[W / 2, H / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#0f0f1c" roughness={0.75} />
      </mesh>

      {/* ── Ceiling neon perimeter ── */}
      {/* Front & back */}
      <NeonStrip position={[0, H - 0.02, -D / 2 + 0.08]} length={W} color="#00f5ff" />
      <NeonStrip position={[0, H - 0.02,  D / 2 - 0.08]} length={W} color="#00f5ff" />
      {/* Left & right */}
      <NeonStrip
        position={[-W / 2 + 0.08, H - 0.02, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={D}
        color="#bf5fff"
      />
      <NeonStrip
        position={[W / 2 - 0.08, H - 0.02, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={D}
        color="#bf5fff"
      />

      {/* ── Floor baseboard neon ── */}
      <NeonStrip
        position={[-W / 2 + 0.04, 0.018, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={D}
        color="#bf5fff"
      />
      <NeonStrip
        position={[W / 2 - 0.04, 0.018, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={D}
        color="#bf5fff"
      />

      {/* ── Corner columns ── */}
      {[
        [-W / 2 + 0.09, H / 2, -D / 2 + 0.09],
        [ W / 2 - 0.09, H / 2, -D / 2 + 0.09],
        [-W / 2 + 0.09, H / 2,  D / 2 - 0.09],
        [ W / 2 - 0.09, H / 2,  D / 2 - 0.09],
      ].map((pos, i) => <Column key={i} position={pos} />)}

      {/* ── Ceiling panels (decorative) ── */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <mesh key={i} position={[x, H - 0.04, -1]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 3]} />
          <meshStandardMaterial color="#0d0d1a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
