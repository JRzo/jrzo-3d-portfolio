/**
 * Platform bed — back-right corner of the room.
 * Includes: frame, mattress, comforter, pillows, nightstand, lamp, under-bed LED strip.
 */
export default function Bed() {
  const frameColor = '#1a0e08';
  const frameM = { color: frameColor, roughness: 0.4, metalness: 0.1 };
  const mattressM = { color: '#e8e0d0', roughness: 0.9 };
  const comforterM = { color: '#1e1e38', roughness: 0.95 };
  const pillowM = { color: '#c8c0b0', roughness: 0.9 };

  return (
    // Positioned in back-right corner: x~3.2, z~-2.8
    <group position={[3.2, 0, -2.5]}>

      {/* ── Bed frame ── */}
      {/* Base platform */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.24, 2.1]} />
        <meshStandardMaterial {...frameM} />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, 0.7, -1.06]} castShadow>
        <boxGeometry args={[1.55, 1.14, 0.08]} />
        <meshStandardMaterial {...frameM} />
      </mesh>
      {/* Headboard panel inset */}
      <mesh position={[0, 0.72, -1.02]}>
        <boxGeometry args={[1.35, 0.9, 0.02]} />
        <meshStandardMaterial color="#120a04" roughness={0.5} />
      </mesh>
      {/* Headboard LED groove */}
      <mesh position={[0, 0.15, -1.01]}>
        <boxGeometry args={[1.52, 0.018, 0.018]} />
        <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* Foot board (lower) */}
      <mesh position={[0, 0.4, 1.06]} castShadow>
        <boxGeometry args={[1.55, 0.56, 0.07]} />
        <meshStandardMaterial {...frameM} />
      </mesh>

      {/* Side rails */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.74, 0.22, 0]} castShadow>
          <boxGeometry args={[0.06, 0.12, 2.1]} />
          <meshStandardMaterial {...frameM} />
        </mesh>
      ))}

      {/* ── Under-bed LED ── */}
      <mesh position={[0, 0.004, 0]}>
        <boxGeometry args={[1.5, 0.006, 2.05]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.5} toneMapped={false} transparent opacity={0.5} />
      </mesh>

      {/* ── Mattress ── */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[1.46, 0.2, 2.0]} />
        <meshStandardMaterial {...mattressM} />
      </mesh>
      {/* Mattress border stitching */}
      <mesh position={[0, 0.33, 0]}>
        <boxGeometry args={[1.48, 0.005, 2.02]} />
        <meshStandardMaterial color="#d0c8b8" roughness={0.95} />
      </mesh>

      {/* ── Comforter ── */}
      <mesh position={[0, 0.46, 0.15]} castShadow>
        <boxGeometry args={[1.44, 0.14, 1.7]} />
        <meshStandardMaterial {...comforterM} />
      </mesh>
      {/* Comforter fold at top */}
      <mesh position={[0, 0.5, -0.7]}>
        <boxGeometry args={[1.44, 0.1, 0.2]} />
        <meshStandardMaterial color="#282848" roughness={0.95} />
      </mesh>
      {/* Comforter accent stripe */}
      <mesh position={[0, 0.535, -0.7]}>
        <boxGeometry args={[1.44, 0.016, 0.22]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* ── Pillows ── */}
      {[-0.34, 0.34].map((x, i) => (
        <mesh key={i} position={[x, 0.55, -0.72]} castShadow>
          <boxGeometry args={[0.6, 0.14, 0.38]} />
          <meshStandardMaterial {...pillowM} />
        </mesh>
      ))}

      {/* ── Nightstand ── */}
      <group position={[-1.1, 0, -0.5]}>
        {/* Body */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.44, 0.56, 0.38]} />
          <meshStandardMaterial {...frameM} />
        </mesh>
        {/* Drawer front */}
        <mesh position={[0, 0.3, 0.192]}>
          <boxGeometry args={[0.36, 0.16, 0.01]} />
          <meshStandardMaterial color="#281808" roughness={0.5} />
        </mesh>
        {/* Drawer handle */}
        <mesh position={[0, 0.3, 0.198]}>
          <boxGeometry args={[0.1, 0.018, 0.01]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Top surface */}
        <mesh position={[0, 0.57, 0]}>
          <boxGeometry args={[0.44, 0.022, 0.38]} />
          <meshStandardMaterial color="#281808" roughness={0.35} />
        </mesh>
        {/* Lamp base */}
        <mesh position={[0, 0.62, 0.04]}>
          <cylinderGeometry args={[0.055, 0.07, 0.04, 12]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Lamp pole */}
        <mesh position={[0, 0.82, 0.04]}>
          <cylinderGeometry args={[0.012, 0.012, 0.38, 8]} />
          <meshStandardMaterial color="#777" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Lamp shade */}
        <mesh position={[0, 1.04, 0.04]}>
          <coneGeometry args={[0.12, 0.2, 12, 1, true]} />
          <meshStandardMaterial color="#f5e6c8" roughness={0.7} side={2} />
        </mesh>
        {/* Lamp bulb glow */}
        <pointLight position={[0, 0.98, 0.04]} intensity={4} color="#ffd060" distance={1.8} decay={2} />
        {/* Phone on nightstand */}
        <mesh position={[0.12, 0.595, -0.06]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.075, 0.005, 0.14]} />
          <meshStandardMaterial color="#111" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Phone screen glow */}
        <mesh position={[0.12, 0.598, -0.06]} rotation={[0, 0.3, 0]}>
          <planeGeometry args={[0.065, 0.13]} />
          <meshBasicMaterial color="#334" toneMapped={false} />
        </mesh>
      </group>

      {/* ── Small rug in front of bed ── */}
      <mesh position={[0, 0.002, 1.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 0.7]} />
        <meshStandardMaterial color="#1a1030" roughness={0.98} />
      </mesh>
    </group>
  );
}
