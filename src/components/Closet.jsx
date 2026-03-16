/**
 * Walk-in/wardrobe closet — front-left corner of the room.
 * Two sliding panel doors, partially open to reveal hanging clothes.
 */
export default function Closet() {
  const woodM    = { color: '#1a0e06', roughness: 0.45, metalness: 0.05 };
  const darkWood = { color: '#120a04', roughness: 0.5 };
  const handleM  = { color: '#666', metalness: 0.85, roughness: 0.15 };

  // Clothes hanging inside — simplified colour blocks
  const clothes = [
    '#1a1a2e', '#0d2137', '#1a0a00', '#2d1a00',
    '#000d1a', '#1a001a', '#0a1a0a', '#2a1400',
    '#ffffff', '#111111', '#1e1e3e',
  ];

  return (
    // Front-left corner, against left wall (x=-5)
    <group position={[-3.8, 0, 2.8]}>

      {/* ── Back panel (inside wall) ── */}
      <mesh position={[0, 1.3, -0.36]}>
        <boxGeometry args={[2.1, 2.6, 0.03]} />
        <meshStandardMaterial {...darkWood} />
      </mesh>

      {/* ── Top panel ── */}
      <mesh position={[0, 2.62, 0]} castShadow>
        <boxGeometry args={[2.1, 0.06, 0.72]} />
        <meshStandardMaterial {...woodM} />
      </mesh>

      {/* ── Side panels ── */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.06, 1.3, 0]} castShadow>
          <boxGeometry args={[0.05, 2.6, 0.72]} />
          <meshStandardMaterial {...woodM} />
        </mesh>
      ))}

      {/* ── Clothes hanging rod ── */}
      <mesh position={[0, 2.1, -0.1]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 2.0, 10]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rod brackets */}
      {[-0.9, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 2.1, -0.1]}>
          <boxGeometry args={[0.04, 0.14, 0.04]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* ── Hanging clothes (simplified) ── */}
      {clothes.map((color, i) => {
        const x = -0.85 + i * 0.175;
        return (
          <group key={i} position={[x, 0, -0.12]}>
            {/* Hanger */}
            <mesh position={[0, 2.04, 0]}>
              <boxGeometry args={[0.22, 0.01, 0.01]} />
              <meshStandardMaterial color="#aaa" metalness={0.7} />
            </mesh>
            {/* Hanger hook */}
            <mesh position={[0, 2.08, 0]}>
              <torusGeometry args={[0.022, 0.006, 6, 12, Math.PI]} />
              <meshStandardMaterial color="#aaa" metalness={0.7} />
            </mesh>
            {/* Garment */}
            <mesh position={[0, 1.62, 0]} castShadow>
              <boxGeometry args={[0.16, 0.72, 0.04]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          </group>
        );
      })}

      {/* ── Shoes on floor inside ── */}
      {[
        { x: -0.7,  color: '#111', w: 0.12 },
        { x: -0.5,  color: '#cc4400', w: 0.11 },
        { x: -0.28, color: '#ffffff', w: 0.12 },
        { x: -0.06, color: '#1a1a2e', w: 0.11 },
        { x:  0.18, color: '#111', w: 0.12 },
        { x:  0.42, color: '#888', w: 0.11 },
      ].map(({ x, color, w }, i) => (
        <mesh key={i} position={[x, 0.04, -0.14]} castShadow>
          <boxGeometry args={[w, 0.08, 0.26]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}

      {/* ── Closet LED strip (inside top) ── */}
      <mesh position={[0, 2.56, -0.33]}>
        <boxGeometry args={[1.9, 0.01, 0.01]} />
        <meshStandardMaterial color="#fff8e0" emissive="#fff8e0" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.5, -0.2]} intensity={3} color="#fff0cc" distance={2} decay={2} />

      {/* ── Sliding door LEFT (slightly open — slid right) ── */}
      <group position={[0.28, 1.3, 0.34]}>
        <mesh castShadow>
          <boxGeometry args={[1.04, 2.6, 0.04]} />
          <meshStandardMaterial {...woodM} />
        </mesh>
        {/* Door panel inset */}
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[0.92, 2.44, 0.01]} />
          <meshStandardMaterial color="#160c06" roughness={0.4} />
        </mesh>
        {/* Handle */}
        <mesh position={[-0.38, 0, 0.035]}>
          <boxGeometry args={[0.03, 0.22, 0.03]} />
          <meshStandardMaterial {...handleM} />
        </mesh>
        {/* Horizontal rail groove */}
        <mesh position={[0, -1.28, 0]}>
          <boxGeometry args={[1.04, 0.016, 0.044]} />
          <meshStandardMaterial color="#0c0702" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* ── Sliding door RIGHT (nearly closed) ── */}
      <group position={[-0.52, 1.3, 0.34]}>
        <mesh castShadow>
          <boxGeometry args={[1.04, 2.6, 0.04]} />
          <meshStandardMaterial {...woodM} />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[0.92, 2.44, 0.01]} />
          <meshStandardMaterial color="#160c06" roughness={0.4} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.38, 0, 0.035]}>
          <boxGeometry args={[0.03, 0.22, 0.03]} />
          <meshStandardMaterial {...handleM} />
        </mesh>
        <mesh position={[0, -1.28, 0]}>
          <boxGeometry args={[1.04, 0.016, 0.044]} />
          <meshStandardMaterial color="#0c0702" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* ── Floor rail ── */}
      <mesh position={[0, 0.008, 0.34]}>
        <boxGeometry args={[2.1, 0.016, 0.05]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
