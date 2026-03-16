import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/* ── Zone definitions ──────────────────────────────────────── */
export const ZONES = [
  { id: 'home',     label: 'Home',     icon: '🏠', color: '#00f5ff', pos: [0,   0, 0]   },
  { id: 'projects', label: 'Projects', icon: '💻', color: '#bf5fff', pos: [50,  0, 0]   },
  { id: 'skills',   label: 'Skills',   icon: '⚡', color: '#00ff88', pos: [-50, 0, 0]   },
  { id: 'sports',   label: 'Sports',   icon: '🏀', color: '#ff6a00', pos: [0,   0, -50] },
  { id: 'contact',  label: 'Contact',  icon: '📡', color: '#ff3399', pos: [0,   0, 50]  },
];

export const ZONE_RADIUS = 16;

const ROAD_COLOR   = '#1a1a28';
const GROUND_COLOR = '#0c0c16';
const LINE_COLOR   = '#00f5ff';

/* ── Shared geometry / material (module-level, never re-created) ── */
const PLATFORM_GEO = new THREE.CylinderGeometry(12, 13, 0.3, 20);
const PLATFORM_MAT = new THREE.MeshStandardMaterial({ color: '#0a0a1e', metalness: 0.5, roughness: 0.5 });
const RING_GEO     = new THREE.RingGeometry(12.5, 13.5, 40);
const H_DASH_GEO   = new THREE.PlaneGeometry(6, 0.2);
const V_DASH_GEO   = new THREE.PlaneGeometry(0.2, 6);
const DASH_MAT     = new THREE.MeshStandardMaterial({ color: LINE_COLOR, emissive: LINE_COLOR, emissiveIntensity: 0.4 });
const ROAD_MAT     = new THREE.MeshStandardMaterial({ color: ROAD_COLOR, roughness: 0.9 });
const ROAD_GEO_EW  = new THREE.PlaneGeometry(220, 10);
const ROAD_GEO_NS  = new THREE.PlaneGeometry(10, 220);
const TRUNK_GEO    = new THREE.CylinderGeometry(0.18, 0.26, 2.2, 6);
const CONE_GEO_LG  = new THREE.ConeGeometry(1.4, 3.2, 8);
const CONE_GEO_SM  = new THREE.ConeGeometry(1.0, 2.2, 8);
const TRUNK_MAT    = new THREE.MeshStandardMaterial({ color: '#3d2b1a', roughness: 1 });
const CONE_MATS    = [
  new THREE.MeshStandardMaterial({ color: '#0d3020', roughness: 0.8 }),
  new THREE.MeshStandardMaterial({ color: '#0a2215', roughness: 0.8 }),
  new THREE.MeshStandardMaterial({ color: '#0f3820', roughness: 0.8 }),
];
const ROT_X_NEG90 = new THREE.Euler(-Math.PI / 2, 0, 0);

/* ══════════════════════════════════════════════════════════
   WORLD ROOT
═══════════════════════════════════════════════════════════ */
export default function World() {
  return (
    <group>
      {/* Physics ground — explicit collider (plane geometry = zero-thickness = car falls through) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[150, 0.5, 150]} position={[0, -0.55, 0]} />
        <mesh receiveShadow rotation={ROT_X_NEG90} position={[0, 0, 0]}>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color={GROUND_COLOR} roughness={1} metalness={0} />
        </mesh>
      </RigidBody>

      <Starfield />
      <GridOverlay />
      <Roads />
      <Borders />

      {/* 5 Zone Islands */}
      <HomeZone    position={ZONES[0].pos} />
      <ProjectsZone position={ZONES[1].pos} />
      <SkillsZone  position={ZONES[2].pos} />
      <SportsZone  position={ZONES[3].pos} />
      <ContactZone position={ZONES[4].pos} />

      <Trees />

      {/* Scene lighting */}
      <ambientLight intensity={0.35} color="#8899cc" />
      <hemisphereLight skyColor="#1a1a50" groundColor="#030306" intensity={0.7} />
      <directionalLight
        position={[60, 100, 40]}
        intensity={0.9}
        color="#ffe8c0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={250}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
      />
    </group>
  );
}

/* ── Starfield sky ─────────────────────────────────────────── */
function Starfield() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 280 + Math.random() * 20;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20; // keep above horizon
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.6} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

/* ── Grid overlay ──────────────────────────────────────────── */
function GridOverlay() {
  const geo = useMemo(() => {
    const size = 240, divisions = 48;
    const g = new THREE.BufferGeometry();
    const verts = [];
    const step = size / divisions, half = size / 2;
    for (let i = 0; i <= divisions; i++) {
      const p = -half + i * step;
      verts.push(-half, 0, p, half, 0, p);
      verts.push(p, 0, -half, p, 0, half);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo} position={[0, 0.01, 0]}>
      <lineBasicMaterial color="#14142a" transparent opacity={0.55} />
    </lineSegments>
  );
}

/* ── Roads ─────────────────────────────────────────────────── */
function Roads() {
  const hDashes = useMemo(() =>
    Array.from({ length: 22 }, (_, j) => [-100 + j * 10, 0.02, 0]), []);
  const vDashes = useMemo(() =>
    Array.from({ length: 22 }, (_, j) => [0, 0.02, -100 + j * 10]), []);

  return (
    <group>
      <mesh receiveShadow geometry={ROAD_GEO_EW} material={ROAD_MAT}
        rotation={ROT_X_NEG90} position={[0, 0.01, 0]} />
      <mesh receiveShadow geometry={ROAD_GEO_NS} material={ROAD_MAT}
        rotation={ROT_X_NEG90} position={[0, 0.01, 0]} />
      {hDashes.map((pos, j) => (
        <mesh key={j} geometry={H_DASH_GEO} material={DASH_MAT}
          rotation={ROT_X_NEG90} position={pos} />
      ))}
      {vDashes.map((pos, j) => (
        <mesh key={j} geometry={V_DASH_GEO} material={DASH_MAT}
          rotation={ROT_X_NEG90} position={pos} />
      ))}
    </group>
  );
}

/* ── World border walls (keep car in playfield) ────────────── */
function Borders() {
  const walls = [
    { pos: [0,   1,  105], args: [110, 2, 0.5] },
    { pos: [0,   1, -105], args: [110, 2, 0.5] },
    { pos: [ 105, 1, 0],   args: [0.5, 2, 110] },
    { pos: [-105, 1, 0],   args: [0.5, 2, 110] },
  ];
  return (
    <group>
      {walls.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <mesh visible={false} position={w.pos}>
            <boxGeometry args={w.args} />
            <meshStandardMaterial />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

/* ── Zone ring glow ────────────────────────────────────────── */
function ZoneRing({ color }) {
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.18;
  });
  return (
    <mesh geometry={RING_GEO} rotation={ROT_X_NEG90} position={[0, 0.06, 0]}>
      <meshStandardMaterial ref={matRef} color={color} emissive={color}
        emissiveIntensity={1.2} transparent opacity={0.35} />
    </mesh>
  );
}

/* ── Zone label sign ───────────────────────────────────────── */
function ZoneSign({ label, color, y = 9 }) {
  return (
    <group position={[0, y, 0]}>
      {/* Sign board */}
      <mesh castShadow>
        <boxGeometry args={[5, 1.2, 0.18]} />
        <meshStandardMaterial color="#0a0a1e" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Glowing border */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[5.1, 1.25, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
      {/* Sign post */}
      <mesh castShadow position={[0, -1.8, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.4, 6]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   HOME ZONE  — Central HQ tower with neon windows
═════════════════════════════════════════════════════════════*/
function HomeZone({ position }) {
  const lightRef = useRef();
  useFrame(({ clock }) => {
    if (lightRef.current)
      lightRef.current.intensity = 2 + Math.sin(clock.elapsedTime * 1.4) * 0.6;
  });

  return (
    <group position={position}>
      {/* Platform disc */}
      <mesh geometry={PLATFORM_GEO} material={PLATFORM_MAT} receiveShadow position={[0, 0.15, 0]} />
      <ZoneRing color="#00f5ff" />

      {/* Main tower */}
      <mesh castShadow position={[0, 7.5, 0]}>
        <boxGeometry args={[5, 15, 5]} />
        <meshStandardMaterial color="#080818" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Tower top pyramid */}
      <mesh castShadow position={[0, 16, 0]}>
        <coneGeometry args={[3.5, 4, 4]} />
        <meshStandardMaterial color="#0d0d2a" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Antenna */}
      <mesh castShadow position={[0, 19, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.5, 6]} />
        <meshStandardMaterial color="#aaa" metalness={1} roughness={0} />
      </mesh>
      <mesh position={[0, 20.3, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={5} />
      </mesh>

      {/* Window rows — right face */}
      {[2, 4.5, 7, 9.5, 12].map((y, row) =>
        [-1, 1].map((x, col) => (
          <mesh key={`wr-${row}-${col}`} position={[2.52, y, x]}>
            <boxGeometry args={[0.06, 0.8, 0.7]} />
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff"
              emissiveIntensity={row % 2 === 0 ? 2.5 : 1} />
          </mesh>
        ))
      )}
      {/* Window rows — left face */}
      {[2, 4.5, 7, 9.5, 12].map((y, row) =>
        [-1, 1].map((x, col) => (
          <mesh key={`wl-${row}-${col}`} position={[-2.52, y, x]}>
            <boxGeometry args={[0.06, 0.8, 0.7]} />
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff"
              emissiveIntensity={row % 2 !== 0 ? 2.5 : 1} />
          </mesh>
        ))
      )}

      {/* Side buildings */}
      {[[-7, 3, -3], [7, 2.5, 3], [-6, 2, 4], [6, 3.5, -4]].map(([x, h, z], i) => (
        <mesh key={i} castShadow position={[x, h, z]}>
          <boxGeometry args={[2.5, h * 2, 2.5]} />
          <meshStandardMaterial color="#080818" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Zone sign */}
      <ZoneSign label="HOME" color="#00f5ff" y={11} />

      {/* Glow light */}
      <pointLight ref={lightRef} position={[0, 10, 0]} color="#00f5ff" intensity={2} distance={30} />
      <pointLight position={[0, 20, 0]} color="#00f5ff" intensity={4} distance={20} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   PROJECTS ZONE  — Server farm / data-center cluster
═════════════════════════════════════════════════════════════*/
function ProjectsZone({ position }) {
  const blinkRef = useRef([]);
  useFrame(({ clock }) => {
    blinkRef.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = i % 2 === 0
        ? 0.4 + Math.sin(clock.elapsedTime * 2.5 + i) * 0.4
        : 0.15 + Math.sin(clock.elapsedTime * 1.8 + i * 0.7) * 0.1;
    });
  });

  return (
    <group position={position}>
      <mesh geometry={PLATFORM_GEO} material={PLATFORM_MAT} receiveShadow position={[0, 0.15, 0]} />
      <ZoneRing color="#bf5fff" />

      {/* Server rack cluster — 3 × 2 grid */}
      {[-5, 0, 5].map((x, col) =>
        [-3, 3].map((z, row) => (
          <group key={`r${col}${row}`} position={[x, 0, z]}>
            {/* Cabinet body */}
            <mesh castShadow position={[0, 3.5, 0]}>
              <boxGeometry args={[2, 7, 1.5]} />
              <meshStandardMaterial color="#080818" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* Status LEDs */}
            {[0.6, 1.5, 2.4, 3.3, 4.2, 5.1, 6.0].map((y, j) => (
              <mesh key={j} position={[0, y, 0.76]}
                ref={el => { blinkRef.current[col * 14 + row * 7 + j] = el?.material; }}>
                <boxGeometry args={[1.6, 0.22, 0.04]} />
                <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={j % 2 === 0 ? 1 : 0.2} />
              </mesh>
            ))}
          </group>
        ))
      )}

      {/* Central cooling tower */}
      <mesh castShadow position={[0, 5.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 11, 10]} />
        <meshStandardMaterial color="#060614" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Cooling fan rings */}
      {[2, 4, 6, 8, 10].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.22, 0.06, 8, 14]} />
          <meshStandardMaterial color="#bf5fff" emissive="#bf5fff" emissiveIntensity={0.8} />
        </mesh>
      ))}

      <ZoneSign label="PROJECTS" color="#bf5fff" y={10} />
      <pointLight position={[0, 8, 0]} color="#bf5fff" intensity={3} distance={28} />
      <pointLight position={[0, 1, 0]} color="#4400aa" intensity={1.5} distance={18} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   SKILLS ZONE  — Holographic tech totem poles
═════════════════════════════════════════════════════════════*/
const PILLARS = [
  { x: -8, z:  0, h: 10, color: '#00ff88', label: 'Python'  },
  { x: -3, z: -3, h:  8, color: '#00f5ff', label: 'Spark'   },
  { x:  3, z:  3, h: 12, color: '#00ff88', label: 'ML'      },
  { x:  8, z:  0, h:  9, color: '#bf5fff', label: 'AWS'     },
  { x:  0, z: -7, h:  7, color: '#00f5ff', label: 'SQL'     },
  { x:  0, z:  7, h:  8, color: '#ff6a00', label: 'Docker'  },
];

function SkillsZone({ position }) {
  const orbRefs = useRef([]);
  useFrame(({ clock }) => {
    orbRefs.current.forEach((m, i) => {
      if (m) {
        m.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 2 + i * 1.1) * 0.7;
      }
    });
  });

  return (
    <group position={position}>
      <mesh geometry={PLATFORM_GEO} material={PLATFORM_MAT} receiveShadow position={[0, 0.15, 0]} />
      <ZoneRing color="#00ff88" />

      {PILLARS.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          {/* Pillar shaft */}
          <mesh castShadow position={[0, p.h / 2, 0]}>
            <boxGeometry args={[1, p.h, 1]} />
            <meshStandardMaterial color="#071410" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Segmented glow rings up the shaft */}
          {Array.from({ length: Math.floor(p.h / 1.5) }, (_, j) => (
            <mesh key={j} position={[0, j * 1.5 + 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.55, 0.04, 6, 10]} />
              <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.5} />
            </mesh>
          ))}
          {/* Glowing orb on top */}
          <mesh position={[0, p.h + 0.6, 0]}
            ref={el => { orbRefs.current[i] = el?.material; }}>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={2} transparent opacity={0.9} />
          </mesh>
          <pointLight position={[0, p.h + 0.6, 0]} color={p.color} intensity={1.5} distance={12} />
        </group>
      ))}

      {/* Central holographic platform */}
      <mesh receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.3, 16]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.2}
          transparent opacity={0.6} metalness={0.8} roughness={0.1} />
      </mesh>

      <ZoneSign label="SKILLS" color="#00ff88" y={11} />
      <pointLight position={[0, 7, 0]} color="#00ff88" intensity={2.5} distance={28} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   SPORTS ZONE  — NBA court + stadium lights + scoreboards
═════════════════════════════════════════════════════════════*/
function SportsZone({ position }) {
  const scoreBoardRef = useRef();
  useFrame(({ clock }) => {
    if (scoreBoardRef.current) {
      scoreBoardRef.current.emissiveIntensity =
        0.6 + Math.sin(clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Full basketball court floor */}
      <mesh receiveShadow rotation={ROT_X_NEG90} position={[0, 0.02, 0]}>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial color="#7B3A10" roughness={0.7} />
      </mesh>
      {/* Court border */}
      <mesh rotation={ROT_X_NEG90} position={[0, 0.03, 0]}>
        <planeGeometry args={[26.5, 18.5]} />
        <meshStandardMaterial color="#5a2a08" roughness={0.8} />
      </mesh>

      {/* Court center circle */}
      <mesh rotation={ROT_X_NEG90} position={[0, 0.04, 0]}>
        <ringGeometry args={[3, 3.15, 32]} />
        <meshStandardMaterial color="#e8e0c0" />
      </mesh>
      {/* Half-court line */}
      <mesh rotation={ROT_X_NEG90} position={[0, 0.04, 0]}>
        <planeGeometry args={[0.12, 18]} />
        <meshStandardMaterial color="#e8e0c0" />
      </mesh>
      {/* 3-point arcs (simplified rectangles) */}
      {[-10, 10].map((x, i) => (
        <mesh key={i} rotation={ROT_X_NEG90} position={[x, 0.04, 0]}>
          <ringGeometry args={[5.5, 5.65, 24, 1, Math.PI / 6, Math.PI * 2 / 1.5]} />
          <meshStandardMaterial color="#e8e0c0" />
        </mesh>
      ))}

      {/* Hoops + backboards */}
      {[-12, 12].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Post */}
          <mesh castShadow position={[i === 0 ? -0.9 : 0.9, 2.5, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 5, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} />
          </mesh>
          {/* Backboard */}
          <mesh castShadow position={[i === 0 ? 0.6 : -0.6, 4.5, 0]}>
            <boxGeometry args={[0.12, 1.8, 2.8]} />
            <meshStandardMaterial color="#e0e8ff" transparent opacity={0.6} metalness={0.4} />
          </mesh>
          {/* Rim */}
          <mesh position={[i === 0 ? 1.2 : -1.2, 3.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.45, 0.05, 8, 16]} />
            <meshStandardMaterial color="#ff6a00" emissive="#ff6a00" emissiveIntensity={0.7} />
          </mesh>
          <pointLight position={[i === 0 ? 1.2 : -1.2, 3.8, 0]} color="#ff6a00" intensity={1.5} distance={8} />
        </group>
      ))}

      {/* Stadium light towers */}
      {[[-11, 8], [11, 8], [-11, -8], [11, -8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 10, 6]} />
            <meshStandardMaterial color="#555" metalness={0.7} />
          </mesh>
          <mesh position={[0, 10.5, 0]}>
            <boxGeometry args={[1.5, 0.4, 0.6]} />
            <meshStandardMaterial color="#fffee0" emissive="#fffee0" emissiveIntensity={2.5} />
          </mesh>
          <pointLight position={[0, 11, 0]} color="#fffee0" intensity={3} distance={25} castShadow={false} />
        </group>
      ))}

      {/* Scoreboard */}
      <mesh castShadow position={[0, 10, 0]}
        ref={el => { scoreBoardRef.current = el?.material; }}>
        <boxGeometry args={[8, 4, 0.3]} />
        <meshStandardMaterial color="#ff6a00" emissive="#ff6a00" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 14, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 7, 6]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>

      {/* Dominican flag pole */}
      <DominicanFlag position={[14, 0, 0]} />

      <ZoneSign label="SPORTS" color="#ff6a00" y={7} />
      <pointLight position={[0, 9, 0]} color="#ff6a00" intensity={2} distance={30} />

      <mesh geometry={PLATFORM_GEO} material={PLATFORM_MAT} receiveShadow
        position={[0, 0.1, 0]} visible={false} />
      <ZoneRing color="#ff6a00" />
    </group>
  );
}

function DominicanFlag({ position }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh castShadow position={[0, 4, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 8, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} />
      </mesh>
      {/* Blue panels */}
      <mesh position={[-0.4, 7.6, 0.06]}>
        <planeGeometry args={[0.8, 0.7]} />
        <meshStandardMaterial color="#002d62" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.4, 6.9, 0.06]}>
        <planeGeometry args={[0.8, 0.7]} />
        <meshStandardMaterial color="#002d62" side={THREE.DoubleSide} />
      </mesh>
      {/* Red panels */}
      <mesh position={[0.4, 7.6, 0.06]}>
        <planeGeometry args={[0.8, 0.7]} />
        <meshStandardMaterial color="#ce1126" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.4, 6.9, 0.06]}>
        <planeGeometry args={[0.8, 0.7]} />
        <meshStandardMaterial color="#ce1126" side={THREE.DoubleSide} />
      </mesh>
      {/* White cross */}
      <mesh position={[0, 7.25, 0.08]}>
        <planeGeometry args={[0.18, 1.44]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 7.25, 0.08]}>
        <planeGeometry args={[1.62, 0.18]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   CONTACT ZONE  — Deep space comms station
═════════════════════════════════════════════════════════════*/
function ContactZone({ position }) {
  const dishRef    = useRef();
  const beamRef    = useRef();
  useFrame(({ clock }) => {
    if (dishRef.current) dishRef.current.rotation.y = clock.elapsedTime * 0.3;
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.05 + Math.abs(Math.sin(clock.elapsedTime * 0.6)) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh geometry={PLATFORM_GEO} material={PLATFORM_MAT} receiveShadow position={[0, 0.15, 0]} />
      <ZoneRing color="#ff3399" />

      {/* Main dish structure */}
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 4, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      <group ref={dishRef} position={[0, 5.5, 0]}>
        <mesh castShadow rotation={[Math.PI / 3, 0, 0]}>
          <sphereGeometry args={[4, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color="#111122" metalness={0.95} roughness={0.05}
            side={THREE.DoubleSide} />
        </mesh>
        {/* Dish focal point emitter */}
        <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 3, 0, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#ff3399" emissive="#ff3399" emissiveIntensity={4} />
        </mesh>
      </group>

      {/* Transmission beam (vertical cylinder) */}
      <mesh ref={beamRef} position={[0, 30, 0]}>
        <cylinderGeometry args={[0.15, 0.8, 50, 8]} />
        <meshStandardMaterial color="#ff3399" emissive="#ff3399" emissiveIntensity={1}
          transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Small relay towers */}
      {[[-8, 3], [8, -5], [-6, -8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 3, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 6, 6]} />
            <meshStandardMaterial color="#222" metalness={0.8} />
          </mesh>
          <mesh position={[0, 6.4, 0]}>
            <sphereGeometry args={[0.2, 6, 6]} />
            <meshStandardMaterial color="#ff3399" emissive="#ff3399" emissiveIntensity={3} />
          </mesh>
          <pointLight position={[0, 6.5, 0]} color="#ff3399" intensity={2} distance={10} />
        </group>
      ))}

      <ZoneSign label="CONTACT" color="#ff3399" y={11} />
      <pointLight position={[0, 7, 0]} color="#ff3399" intensity={3} distance={30} />
    </group>
  );
}

/* ── Trees (shared geo/mat, never recreated) ───────────────── */
const TREE_POSITIONS = [
  [22,  0,  22], [-22, 0,  22], [22,  0, -22], [-22, 0, -22],
  [35,  0,  18], [-35, 0,  18], [35,  0, -18], [-35, 0, -18],
  [18,  0,  35], [-18, 0,  35], [18,  0, -35], [-18, 0, -35],
  [65,  0,  14], [65,  0, -14], [-65, 0,  14], [-65, 0, -14],
  [14,  0,  65], [-14, 0,  65], [14,  0, -65], [-14, 0, -65],
  [40,  0,  40], [-40, 0,  40], [40,  0, -40], [-40, 0, -40],
  [80,  0,   0], [-80, 0,   0], [0,   0,  80], [0,   0, -80],
];

function Trees() {
  return (
    <group>
      {TREE_POSITIONS.map((pos, i) => {
        const h   = 3.5 + (i % 4) * 0.8;
        const mat = CONE_MATS[i % 3];
        return (
          <group key={i} position={pos}>
            <mesh geometry={TRUNK_GEO} material={TRUNK_MAT} castShadow
              position={[0, h * 0.28, 0]} />
            <mesh geometry={CONE_GEO_LG} material={mat} castShadow
              position={[0, h * 0.68, 0]} />
            <mesh geometry={CONE_GEO_SM} material={mat} castShadow
              position={[0, h * 0.9,  0]} />
          </group>
        );
      })}
    </group>
  );
}
