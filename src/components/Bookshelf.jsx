/**
 * Bookshelf — left wall, 4 shelves packed with tech + hobby books.
 * Book titles reflect the owner's skillset: AI/ML, Data Engineering, Python, SQL, etc.
 */

const BOOKS = [
  // ── Shelf 0: Data & ML fundamentals ──
  { color: '#3572A5', w: 0.068 }, // Python Data Science Handbook
  { color: '#c8001a', w: 0.055 }, // Clean Code
  { color: '#1a3a8f', w: 0.095 }, // Designing Data-Intensive Apps
  { color: '#2d6a2d', w: 0.072 }, // SICP
  { color: '#8f1a5a', w: 0.105 }, // Deep Learning (Goodfellow)
  // ── Shelf 1: Engineering & Architecture ──
  { color: '#004080', w: 0.095 }, // System Design Interview
  { color: '#5a3a00', w: 0.082 }, // The Pragmatic Programmer
  { color: '#3d0050', w: 0.108 }, // Introduction to Algorithms
  { color: '#5a1a00', w: 0.062 }, // The Goal
  { color: '#003355', w: 0.072 }, // Atomic Habits
  // ── Shelf 2: AI / LLM / Cloud ──
  { color: '#1f1f6e', w: 0.09  }, // Building ML Powered Apps
  { color: '#006644', w: 0.075 }, // Spark: The Definitive Guide
  { color: '#4a0000', w: 0.088 }, // Fundamentals of Data Engineering
  { color: '#2a0050', w: 0.08  }, // Hands-On ML (Géron)
  { color: '#1a4a1a', w: 0.062 }, // Zero to One
  // ── Shelf 3: Broader tech + personal ──
  { color: '#1a2040', w: 0.095 }, // Thinking Fast & Slow
  { color: '#003a2a', w: 0.078 }, // The Lean Startup
  { color: '#3d1a00', w: 0.092 }, // Database Internals
  { color: '#00263d', w: 0.07  }, // Site Reliability Engineering
  { color: '#2a1a2a', w: 0.065 }, // Mythical Man-Month
];

const BOOKS_PER_SHELF = 5;

function lighten(hex, a = 45) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + a);
  const g = Math.min(255, ((n >> 8)  & 0xff) + a);
  const b = Math.min(255, ( n        & 0xff) + a);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function Book({ x, y, color, width, height = 0.27, depth = 0.22 }) {
  return (
    <group position={[x, y, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      {/* Spine highlight */}
      <mesh position={[width / 2 - 0.003, 0, 0]}>
        <boxGeometry args={[0.004, height + 0.002, depth + 0.002]} />
        <meshStandardMaterial color={lighten(color)} roughness={0.5} />
      </mesh>
      {/* Page edge (top) */}
      <mesh position={[0, height / 2 + 0.002, 0.01]}>
        <boxGeometry args={[width - 0.008, 0.004, depth - 0.04]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Bookshelf() {
  const sW = 1.28, sD = 0.25, sT = 0.038;
  const shelfYs = [0.36, 0.76, 1.18, 1.60];
  const topY = 2.05;

  const rows = Array.from({ length: 4 }, (_, i) =>
    BOOKS.slice(i * BOOKS_PER_SHELF, i * BOOKS_PER_SHELF + BOOKS_PER_SHELF)
  );

  return (
    <group position={[-4.55, 0, -1.7]} rotation={[0, Math.PI / 2, 0]}>
      {/* Back panel */}
      <mesh position={[0, 1.1, -sD / 2 + 0.016]}>
        <boxGeometry args={[sW + 0.1, 2.2, 0.032]} />
        <meshStandardMaterial color="#190e08" roughness={0.6} />
      </mesh>

      {/* Shelves */}
      {shelfYs.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[sW, sT, sD]} />
          <meshStandardMaterial color="#2a1810" roughness={0.55} metalness={0.08} />
        </mesh>
      ))}
      {/* Top */}
      <mesh position={[0, topY, 0]} castShadow>
        <boxGeometry args={[sW, sT, sD]} />
        <meshStandardMaterial color="#2a1810" roughness={0.55} metalness={0.08} />
      </mesh>

      {/* Side panels */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (sW / 2 + 0.02), 1.1, 0]} castShadow>
          <boxGeometry args={[0.038, 2.2, sD]} />
          <meshStandardMaterial color="#2a1810" roughness={0.55} metalness={0.08} />
        </mesh>
      ))}

      {/* Books per shelf */}
      {rows.map((row, si) => {
        let xCursor = -sW / 2 + 0.04;
        return row.map((book, bi) => {
          const bx = xCursor + book.w / 2;
          const by = shelfYs[si] + sT / 2 + 0.27 / 2 + 0.001;
          xCursor += book.w + 0.013;
          return <Book key={`${si}-${bi}`} x={bx} y={by} color={book.color} width={book.w} />;
        });
      })}

      {/* Decorations on top shelf */}
      {/* Trophy */}
      <mesh position={[0.46, topY + sT / 2 + 0.07, 0]} castShadow>
        <coneGeometry args={[0.05, 0.14, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.15} emissive="#d4af37" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.46, topY + sT / 2 + 0.01, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.02, 8]} />
        <meshStandardMaterial color="#8a7000" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Small figurine (cube bot) */}
      <mesh position={[-0.44, topY + sT / 2 + 0.055, 0]} castShadow>
        <boxGeometry args={[0.08, 0.1, 0.07]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.4} toneMapped={false} roughness={0.4} />
      </mesh>
      <mesh position={[-0.44, topY + sT / 2 + 0.115, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Plant pot */}
      <mesh position={[0.08, topY + sT / 2 + 0.06, -0.04]} castShadow>
        <cylinderGeometry args={[0.045, 0.038, 0.1, 10]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, topY + sT / 2 + 0.12, -0.04]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color="#2d6a2d" roughness={0.9} />
      </mesh>

      {/* LED strip */}
      <mesh position={[0, topY + sT / 2 + 0.002, sD / 2 - 0.007]}>
        <boxGeometry args={[sW - 0.05, 0.008, 0.008]} />
        <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}
