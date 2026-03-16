import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/* ── Zone definitions ──────────────────────────────────────── */
export const ZONES = [
  { id: 'home',     label: 'Home',     icon: '🏠', color: '#f4a261', pos: [0,   0, 0]   },
  { id: 'projects', label: 'Projects', icon: '💻', color: '#9b5de5', pos: [55,  0, 0]   },
  { id: 'skills',   label: 'Skills',   icon: '⚡', color: '#06d6a0', pos: [-55, 0, 0]   },
  { id: 'sports',   label: 'Sports',   icon: '🏀', color: '#ef476f', pos: [0,   0, -55] },
  { id: 'contact',  label: 'Contact',  icon: '📡', color: '#118ab2', pos: [0,   0, 55]  },
];

export const ZONE_RADIUS = 18;

/* ── Material palette ──────────────────────────────────────── */
// Bruno Simon uses flat, matte colors — NO metalness, low roughness on nothing
const M = (color, opts = {}) =>
  new THREE.MeshLambertMaterial({ color, ...opts });

// Ground & roads
const GND_MAT     = M('#3d7a3a');          // bright grass green
const ROAD_MAT    = M('#5a5a4a');          // warm asphalt
const SIDEWALK_MAT = M('#a89f8c');         // light beige pavement
const DASH_MAT    = M('#ffd166');          // warm yellow dashes

// Zone platform colors
const ZONE_BASE_MATS = {
  home:     M('#f4a261'),
  projects: M('#9b5de5'),
  skills:   M('#06d6a0'),
  sports:   M('#ef476f'),
  contact:  M('#118ab2'),
};

// Shared geometry (created once at module level)
const ROT_X_NEG90  = new THREE.Euler(-Math.PI / 2, 0, 0);
const PLAT_GEO     = new THREE.CylinderGeometry(14, 15, 0.6, 20);
const RING_GEO     = new THREE.RingGeometry(14.5, 15.8, 36);
const H_DASH_GEO   = new THREE.PlaneGeometry(5, 0.28);
const V_DASH_GEO   = new THREE.PlaneGeometry(0.28, 5);
const ROAD_GEO_EW  = new THREE.PlaneGeometry(240, 10);
const ROAD_GEO_NS  = new THREE.PlaneGeometry(10, 240);
const TRUNK_GEO    = new THREE.CylinderGeometry(0.22, 0.32, 2.4, 7);
const CONE_GEO_LG  = new THREE.ConeGeometry(2.0, 3.8, 8);
const CONE_GEO_SM  = new THREE.ConeGeometry(1.4, 2.4, 8);
const TRUNK_MAT    = M('#7c5c3e');
const TREE_MATS    = [M('#2d6a30'), M('#3a7a35'), M('#254f28')];

/* ══════════════════════════════════════════════════════════
   WORLD ROOT
═══════════════════════════════════════════════════════════ */
export default function World() {
  return (
    <group>
      {/* Physics ground — explicit cuboid (plane = zero-thickness = car falls through) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[150, 0.5, 150]} position={[0, -0.55, 0]} />
        <mesh receiveShadow rotation={ROT_X_NEG90}>
          <planeGeometry args={[400, 400]} />
          <meshLambertMaterial color="#3d7a3a" />
        </mesh>
      </RigidBody>

      {/* Subtle tile pattern on ground */}
      <TileGrid />

      {/* Roads */}
      <Roads />

      {/* Invisible border walls */}
      <Borders />

      {/* Zone islands */}
      <HomeZone    position={ZONES[0].pos} />
      <ProjectsZone position={ZONES[1].pos} />
      <SkillsZone  position={ZONES[2].pos} />
      <SportsZone  position={ZONES[3].pos} />
      <ContactZone position={ZONES[4].pos} />

      {/* Decorative */}
      <Trees />
      <Lampposts />

      {/* ── LIGHTING — Bruno Simon style: strong sun + fill ── */}

      {/* Strong warm sun from upper-right — main light source */}
      <directionalLight
        position={[80, 120, 60]}
        intensity={2.8}
        color="#fff8e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={280}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0002}
      />

      {/* Sky fill — bright blue from above */}
      <hemisphereLight skyColor="#87ceeb" groundColor="#3d7a3a" intensity={1.2} />

      {/* Soft ambient so shadows aren't pitch black */}
      <ambientLight intensity={0.5} color="#fff5e0" />

      {/* Each zone emits its own colored fill light */}
      <pointLight position={[0,   8, 0]}   color="#f4a261" intensity={2} distance={35} />
      <pointLight position={[55,  8, 0]}   color="#9b5de5" intensity={2} distance={35} />
      <pointLight position={[-55, 8, 0]}   color="#06d6a0" intensity={2} distance={35} />
      <pointLight position={[0,   8, -55]} color="#ef476f" intensity={2} distance={35} />
      <pointLight position={[0,   8, 55]}  color="#118ab2" intensity={2} distance={35} />
    </group>
  );
}

/* ── Subtle ground tile grid ───────────────────────────────── */
function TileGrid() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v = [];
    const s = 200, div = 40, step = s / div, half = s / 2;
    for (let i = 0; i <= div; i++) {
      const p = -half + i * step;
      v.push(-half, 0, p, half, 0, p);
      v.push(p, 0, -half, p, 0, half);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo} position={[0, 0.03, 0]}>
      <lineBasicMaterial color="#2a5c28" transparent opacity={0.4} />
    </lineSegments>
  );
}

/* ── Roads ─────────────────────────────────────────────────── */
function Roads() {
  const hDashes = useMemo(() =>
    Array.from({ length: 24 }, (_, j) => [-110 + j * 10, 0.04, 0]), []);
  const vDashes = useMemo(() =>
    Array.from({ length: 24 }, (_, j) => [0, 0.04, -110 + j * 10]), []);

  return (
    <group>
      {/* Sidewalk border — slightly wider & lighter */}
      <mesh receiveShadow geometry={new THREE.PlaneGeometry(246, 14)}
        material={SIDEWALK_MAT} rotation={ROT_X_NEG90} position={[0, 0.01, 0]} />
      <mesh receiveShadow geometry={new THREE.PlaneGeometry(14, 246)}
        material={SIDEWALK_MAT} rotation={ROT_X_NEG90} position={[0, 0.01, 0]} />

      {/* Road surface */}
      <mesh receiveShadow geometry={ROAD_GEO_EW} material={ROAD_MAT}
        rotation={ROT_X_NEG90} position={[0, 0.02, 0]} />
      <mesh receiveShadow geometry={ROAD_GEO_NS} material={ROAD_MAT}
        rotation={ROT_X_NEG90} position={[0, 0.02, 0]} />

      {/* Yellow dashes */}
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

/* ── Zone platform helper ──────────────────────────────────── */
function ZonePlatform({ id }) {
  return (
    <mesh geometry={PLAT_GEO} material={ZONE_BASE_MATS[id]}
      receiveShadow position={[0, 0.3, 0]} castShadow />
  );
}

/* ── Zone ring ─────────────────────────────────────────────── */
function ZoneRing({ color }) {
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.5 + Math.sin(clock.elapsedTime * 2.2) * 0.2;
  });
  return (
    <mesh geometry={RING_GEO} rotation={ROT_X_NEG90} position={[0, 0.08, 0]}>
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.6} />
    </mesh>
  );
}

/* ── Zone sign ─────────────────────────────────────────────── */
function ZoneSign({ label, color, y = 10 }) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow>
        <boxGeometry args={[6, 1.4, 0.3]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, -1.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 6]} />
        <meshLambertMaterial color="#5a4a3a" />
      </mesh>
    </group>
  );
}

/* ── Box building helper ───────────────────────────────────── */
function Building({ pos, w, h, d, color, roofColor }) {
  return (
    <group position={pos} castShadow>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {roofColor && (
        <mesh castShadow position={[0, h + 0.25, 0]}>
          <boxGeometry args={[w + 0.2, 0.5, d + 0.2]} />
          <meshLambertMaterial color={roofColor} />
        </mesh>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   HOME ZONE — Colorful HQ + personal tower, warm orange theme
═════════════════════════════════════════════════════════════*/
function HomeZone({ position }) {
  const flagRef = useRef();
  useFrame(({ clock }) => {
    if (flagRef.current)
      flagRef.current.rotation.y = Math.sin(clock.elapsedTime * 1.2) * 0.15;
  });

  return (
    <group position={position}>
      <ZonePlatform id="home" />
      <ZoneRing color="#f4a261" />

      {/* Main tower — warm orange/yellow */}
      <mesh castShadow receiveShadow position={[0, 8, 0]}>
        <boxGeometry args={[6, 16, 6]} />
        <meshLambertMaterial color="#e76f51" />
      </mesh>
      {/* Tower roof */}
      <mesh castShadow position={[0, 17, 0]}>
        <coneGeometry args={[4.2, 5, 4]} />
        <meshLambertMaterial color="#f4a261" />
      </mesh>
      {/* Windows — bright yellow */}
      {[2.5, 5.5, 8.5, 11.5, 14.5].map((y, row) =>
        [-1.5, 1.5].map((x, col) => (
          <mesh key={`${row}-${col}`} position={[3.02, y, x]}>
            <boxGeometry args={[0.08, 1.1, 0.9]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
        ))
      )}
      {[2.5, 5.5, 8.5, 11.5, 14.5].map((y, row) =>
        [-1.5, 1.5].map((x, col) => (
          <mesh key={`b${row}-${col}`} position={[-3.02, y, x]}>
            <boxGeometry args={[0.08, 1.1, 0.9]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
        ))
      )}
      {/* Antenna */}
      <mesh castShadow position={[0, 20.8, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.8, 6]} />
        <meshLambertMaterial color="#c0c0c0" />
      </mesh>
      <mesh position={[0, 22.4, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>

      {/* Side buildings */}
      <Building pos={[-9, 0, -4]} w={3.5} h={8}  d={3.5} color="#f4845f" roofColor="#e76f51" />
      <Building pos={[ 9, 0,  4]} w={3.5} h={10} d={3.5} color="#e9c46a" roofColor="#f4a261" />
      <Building pos={[-8, 0,  5]} w={2.8} h={6}  d={2.8} color="#f9c784" roofColor="#e9c46a" />
      <Building pos={[ 8, 0, -5]} w={2.8} h={7}  d={2.8} color="#e76f51" roofColor="#e9c46a" />

      {/* Dominican flag pole + flag */}
      <group position={[11, 0, -8]} ref={flagRef}>
        <mesh castShadow position={[0, 5, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 10, 6]} />
          <meshLambertMaterial color="#c0c0c0" />
        </mesh>
        {/* Flag — blue/red with white cross (DR flag) */}
        <mesh position={[1.0, 8.8, 0.05]}>
          <planeGeometry args={[2.0, 1.5]} />
          <meshBasicMaterial color="#002d62" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.0, 8.8, 0.06]}>
          {/* White cross vertical */}
          <planeGeometry args={[0.22, 1.52]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.0, 8.8, 0.07]}>
          {/* White cross horizontal */}
          <planeGeometry args={[2.02, 0.22]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.48, 9.37, 0.04]}>
          <planeGeometry args={[0.98, 0.73]} />
          <meshBasicMaterial color="#002d62" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.52, 8.23, 0.04]}>
          <planeGeometry args={[0.98, 0.73]} />
          <meshBasicMaterial color="#002d62" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.48, 8.23, 0.04]}>
          <planeGeometry args={[0.98, 0.73]} />
          <meshBasicMaterial color="#ce1126" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.52, 9.37, 0.04]}>
          <planeGeometry args={[0.98, 0.73]} />
          <meshBasicMaterial color="#ce1126" side={THREE.DoubleSide} />
        </mesh>
      </group>

      <ZoneSign label="HOME" color="#e76f51" y={13} />
      <pointLight position={[0, 16, 0]} color="#ffd166" intensity={3} distance={30} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   PROJECTS ZONE — Purple data-center with blinking LEDs
═════════════════════════════════════════════════════════════*/
function ProjectsZone({ position }) {
  const ledRefs = useRef([]);
  useFrame(({ clock }) => {
    ledRefs.current.forEach((m, i) => {
      if (m) m.color.setHex(
        Math.sin(clock.elapsedTime * 3 + i * 0.8) > 0.2 ? 0x9b5de5 : 0x5a108f
      );
    });
  });

  return (
    <group position={position}>
      <ZonePlatform id="projects" />
      <ZoneRing color="#9b5de5" />

      {/* Server racks — 3 × 2 */}
      {[-6, 0, 6].map((x, col) =>
        [-4, 4].map((z, row) => (
          <group key={`${col}-${row}`} position={[x, 0, z]}>
            {/* Cabinet */}
            <mesh castShadow receiveShadow position={[0, 4, 0]}>
              <boxGeometry args={[2.4, 8, 1.8]} />
              <meshLambertMaterial color="#3d1f6b" />
            </mesh>
            {/* Front panel */}
            <mesh position={[0, 4, 0.92]}>
              <boxGeometry args={[2.2, 7.8, 0.05]} />
              <meshLambertMaterial color="#2a1248" />
            </mesh>
            {/* LED rows */}
            {[0.8, 1.8, 2.8, 3.8, 4.8, 5.8, 6.8].map((y, j) => (
              <mesh key={j} position={[0, y, 0.96]}
                ref={el => {
                  if (el) ledRefs.current[col * 14 + row * 7 + j] = el.material;
                }}>
                <boxGeometry args={[1.8, 0.28, 0.02]} />
                <meshBasicMaterial color="#9b5de5" />
              </mesh>
            ))}
          </group>
        ))
      )}

      {/* Central data spine */}
      <mesh castShadow position={[0, 6, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 12, 12]} />
        <meshLambertMaterial color="#5a108f" />
      </mesh>
      {/* Glow rings on spine */}
      {[1, 3, 5, 7, 9, 11].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.42, 0.08, 8, 16]} />
          <meshBasicMaterial color="#c77dff" />
        </mesh>
      ))}

      <ZoneSign label="PROJECTS" color="#9b5de5" y={11} />
      <pointLight position={[0, 10, 0]} color="#c77dff" intensity={4} distance={30} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   SKILLS ZONE — Green tech totem poles with glowing orbs
═════════════════════════════════════════════════════════════*/
const SKILL_PILLARS = [
  { x: -9,  z:  0, h: 12, color: '#06d6a0', label: 'Python'  },
  { x: -4,  z: -5, h:  9, color: '#48cae4', label: 'Spark'   },
  { x:  4,  z:  5, h: 14, color: '#06d6a0', label: 'ML/AI'   },
  { x:  9,  z:  0, h: 10, color: '#0077b6', label: 'AWS'     },
  { x:  0,  z: -8, h:  8, color: '#48cae4', label: 'SQL'     },
  { x:  0,  z:  8, h: 10, color: '#90e0ef', label: 'Docker'  },
  { x: -5,  z:  6, h:  7, color: '#06d6a0', label: 'dbt'     },
  { x:  5,  z: -6, h:  8, color: '#0077b6', label: 'Airflow' },
];

function SkillsZone({ position }) {
  const orbRefs = useRef([]);
  useFrame(({ clock }) => {
    orbRefs.current.forEach((m, i) => {
      if (m) m.opacity = 0.7 + Math.sin(clock.elapsedTime * 2.2 + i * 0.9) * 0.3;
    });
  });

  return (
    <group position={position}>
      <ZonePlatform id="skills" />
      <ZoneRing color="#06d6a0" />

      {/* Holographic base disc */}
      <mesh rotation={ROT_X_NEG90} position={[0, 0.35, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#06d6a0" transparent opacity={0.18} />
      </mesh>

      {SKILL_PILLARS.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          {/* Pillar body — bright colored, not dark */}
          <mesh castShadow receiveShadow position={[0, p.h / 2, 0]}>
            <boxGeometry args={[1.2, p.h, 1.2]} />
            <meshLambertMaterial color={p.color} />
          </mesh>
          {/* Bright orb on top */}
          <mesh position={[0, p.h + 0.8, 0]}
            ref={el => { orbRefs.current[i] = el?.material; }}>
            <sphereGeometry args={[0.65, 14, 14]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.9} />
          </mesh>
          <pointLight position={[0, p.h + 0.8, 0]} color={p.color} intensity={2} distance={14} />
        </group>
      ))}

      {/* Skill name bars (bar chart) — on the ground */}
      {[
        { x: -9, w: 0.9, color: '#06d6a0' },
        { x: -6, w: 0.8, color: '#48cae4' },
        { x: -3, w: 0.7, color: '#06d6a0' },
        { x:  0, w: 0.6, color: '#0077b6' },
        { x:  3, w: 0.8, color: '#90e0ef' },
        { x:  6, w: 0.7, color: '#06d6a0' },
      ].map((b, i) => (
        <mesh key={i} receiveShadow position={[b.x, 0.2, -11]}>
          <boxGeometry args={[1.2, 0.4, b.w * 4]} />
          <meshLambertMaterial color={b.color} />
        </mesh>
      ))}

      <ZoneSign label="SKILLS" color="#06d6a0" y={12} />
      <pointLight position={[0, 8, 0]} color="#06d6a0" intensity={3} distance={30} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   SPORTS ZONE — NBA court + baseball + DR culture
═════════════════════════════════════════════════════════════*/
function SportsZone({ position }) {
  const rimRef1 = useRef();
  const rimRef2 = useRef();
  useFrame(({ clock }) => {
    const glow = 0.5 + Math.sin(clock.elapsedTime * 1.5) * 0.3;
    if (rimRef1.current) rimRef1.current.intensity = glow * 2;
    if (rimRef2.current) rimRef2.current.intensity = glow * 2;
  });

  return (
    <group position={position}>
      <ZoneRing color="#ef476f" />

      {/* Basketball court floor */}
      <mesh receiveShadow rotation={ROT_X_NEG90} position={[0, 0.03, 0]}>
        <planeGeometry args={[28, 20]} />
        <meshLambertMaterial color="#c8792a" />
      </mesh>
      {/* Court border stripe */}
      <mesh receiveShadow rotation={ROT_X_NEG90} position={[0, 0.02, 0]}>
        <planeGeometry args={[29.5, 21.5]} />
        <meshLambertMaterial color="#a0601c" />
      </mesh>

      {/* Court lines */}
      <mesh rotation={ROT_X_NEG90} position={[0, 0.05, 0]}>
        <ringGeometry args={[3.6, 3.78, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={ROT_X_NEG90} position={[0, 0.05, 0]}>
        <planeGeometry args={[0.14, 20]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Hoops */}
      {[-13, 13].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh castShadow position={[0, 3, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 6, 8]} />
            <meshLambertMaterial color="#888888" />
          </mesh>
          {/* Backboard */}
          <mesh castShadow position={[i === 0 ? 0.8 : -0.8, 5.5, 0]}>
            <boxGeometry args={[0.15, 2.2, 3.2]} />
            <meshLambertMaterial color="#e8f0ff" />
          </mesh>
          {/* Rim — bright orange */}
          <mesh position={[i === 0 ? 1.5 : -1.5, 4.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.48, 0.06, 8, 16]} />
            <meshBasicMaterial color="#ff8c00" />
          </mesh>
          <pointLight
            ref={i === 0 ? rimRef1 : rimRef2}
            position={[i === 0 ? 1.5 : -1.5, 4.6, 0]}
            color="#ff8c00" intensity={2} distance={8} />
        </group>
      ))}

      {/* Stadium light towers — 4 corners */}
      {[[-12, -9], [12, -9], [-12, 9], [12, 9]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 6, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 12, 6]} />
            <meshLambertMaterial color="#888888" />
          </mesh>
          <mesh position={[0, 12.5, 0]}>
            <boxGeometry args={[2.2, 0.5, 0.8]} />
            <meshBasicMaterial color="#fffde0" />
          </mesh>
          <pointLight position={[0, 13, 0]} color="#fffce0" intensity={4} distance={28} castShadow={false} />
        </group>
      ))}

      {/* Scoreboard */}
      <mesh castShadow position={[0, 11, 0]}>
        <boxGeometry args={[10, 4.5, 0.5]} />
        <meshLambertMaterial color="#ef476f" />
      </mesh>
      <mesh position={[0, 11, 0.28]}>
        <boxGeometry args={[9.5, 4.0, 0.05]} />
        <meshBasicMaterial color="#1a0008" />
      </mesh>
      {/* Score numbers (abstract bright rectangles) */}
      {[-3.5, -1.2, 1.2, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 11, 0.32]}>
          <boxGeometry args={[0.8, 2.2, 0.04]} />
          <meshBasicMaterial color={i < 2 ? '#ffd166' : '#06d6a0'} />
        </mesh>
      ))}
      <mesh position={[0, 14, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5.5, 6]} />
        <meshLambertMaterial color="#888888" />
      </mesh>

      {/* Baseball corner — small diamond */}
      <group position={[17, 0, 10]}>
        <mesh receiveShadow rotation={ROT_X_NEG90} position={[0, 0.05, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshLambertMaterial color="#c8a96e" />
        </mesh>
        {/* Bases */}
        {[[0,4],[4,0],[0,-4],[-4,0]].map(([bx, bz], i) => (
          <mesh key={i} castShadow position={[bx, 0.1, bz]}>
            <boxGeometry args={[0.7, 0.2, 0.7]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
        ))}
        {/* Pitcher mound */}
        <mesh castShadow position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 0.3, 12]} />
          <meshLambertMaterial color="#b89060" />
        </mesh>
        {/* Bat */}
        <mesh castShadow position={[3, 0.8, -2]} rotation={[0, 0.3, Math.PI / 3]}>
          <cylinderGeometry args={[0.1, 0.22, 3, 8]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      </group>

      {/* Soccer mini-field */}
      <group position={[-18, 0, -8]}>
        <mesh receiveShadow rotation={ROT_X_NEG90} position={[0, 0.05, 0]}>
          <planeGeometry args={[12, 9]} />
          <meshLambertMaterial color="#2d9e2d" />
        </mesh>
        {/* Goal posts */}
        {[-4.8, 4.8].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh castShadow position={[-0.6, 1.2, 0]}>
              <boxGeometry args={[0.1, 2.4, 0.1]} />
              <meshLambertMaterial color="#ffffff" />
            </mesh>
            <mesh castShadow position={[0.6, 1.2, 0]}>
              <boxGeometry args={[0.1, 2.4, 0.1]} />
              <meshLambertMaterial color="#ffffff" />
            </mesh>
            <mesh castShadow position={[0, 2.4, 0]}>
              <boxGeometry args={[1.3, 0.1, 0.1]} />
              <meshLambertMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {/* Soccer ball */}
        <mesh castShadow position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.45, 10, 10]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
      </group>

      <ZoneSign label="SPORTS" color="#ef476f" y={8} />
      <pointLight position={[0, 8, 0]} color="#ef476f" intensity={3} distance={35} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   CONTACT ZONE — Deep-space comms, bright blue station
═════════════════════════════════════════════════════════════*/
function ContactZone({ position }) {
  const dishRef = useRef();
  const beamRef = useRef();
  useFrame(({ clock }) => {
    if (dishRef.current) dishRef.current.rotation.y = clock.elapsedTime * 0.35;
    if (beamRef.current)
      beamRef.current.material.opacity = 0.08 + Math.abs(Math.sin(clock.elapsedTime * 0.7)) * 0.22;
  });

  return (
    <group position={position}>
      <ZonePlatform id="contact" />
      <ZoneRing color="#118ab2" />

      {/* Main dish mount */}
      <mesh castShadow receiveShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 6, 10]} />
        <meshLambertMaterial color="#2a6496" />
      </mesh>
      {/* Dish */}
      <group ref={dishRef} position={[0, 7.5, 0]}>
        <mesh castShadow rotation={[Math.PI / 3, 0, 0]}>
          <sphereGeometry args={[5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshLambertMaterial color="#1a5f8a" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <sphereGeometry args={[5.05, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshBasicMaterial color="#48cae4" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
        {/* Focal emitter */}
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.3, 10, 10]} />
          <meshBasicMaterial color="#48cae4" />
        </mesh>
      </group>

      {/* Transmission beam */}
      <mesh ref={beamRef} position={[0, 35, 0]}>
        <cylinderGeometry args={[0.2, 1.2, 60, 10]} />
        <meshBasicMaterial color="#48cae4" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Relay towers */}
      {[[-10, 4], [10, -6], [-8, -9], [9, 7]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 7, 6]} />
            <meshLambertMaterial color="#2a6496" />
          </mesh>
          <mesh position={[0, 7.3, 0]}>
            <sphereGeometry args={[0.28, 8, 8]} />
            <meshBasicMaterial color="#48cae4" />
          </mesh>
          <pointLight position={[0, 7.5, 0]} color="#48cae4" intensity={2.5} distance={12} />
        </group>
      ))}

      {/* Control building */}
      <Building pos={[-7, 0, 2]} w={4.5} h={5} d={4} color="#1a6fa8" roofColor="#118ab2" />
      <Building pos={[7, 0, -3]} w={3.5} h={4} d={3.5} color="#1a5f8a" roofColor="#2196f3" />

      <ZoneSign label="CONTACT" color="#118ab2" y={12} />
      <pointLight position={[0, 9, 0]} color="#48cae4" intensity={3.5} distance={32} />
    </group>
  );
}

/* ── Lampposts along roads ─────────────────────────────────── */
const LAMP_POSITIONS = [
  [-20, 6], [20, 6], [-20, -6], [20, -6],
  [6, -20], [6, 20], [-6, -20], [-6, 20],
  [-38, 6], [38, 6], [-38, -6], [38, -6],
  [6, -38], [6, 38], [-6, -38], [-6, 38],
];

function Lampposts() {
  return (
    <group>
      {LAMP_POSITIONS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.1, 0.13, 5, 6]} />
            <meshLambertMaterial color="#555566" />
          </mesh>
          <mesh castShadow position={[0, 5.2, 0]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshBasicMaterial color="#fffde0" />
          </mesh>
          <pointLight position={[0, 5.4, 0]} color="#fff8c0" intensity={1.5} distance={15} castShadow={false} />
        </group>
      ))}
    </group>
  );
}

/* ── Trees ─────────────────────────────────────────────────── */
const TREE_POSITIONS = [
  [25, 0, 25], [-25, 0, 25], [25, 0, -25], [-25, 0, -25],
  [38, 0, 18], [-38, 0, 18], [38, 0, -18], [-38, 0, -18],
  [18, 0, 38], [-18, 0, 38], [18, 0, -38], [-18, 0, -38],
  [70, 0, 12], [70, 0, -12], [-70, 0, 12], [-70, 0, -12],
  [12, 0, 70], [-12, 0, 70], [12, 0, -70], [-12, 0, -70],
  [45, 0, 45], [-45, 0, 45], [45, 0, -45], [-45, 0, -45],
  [85, 0, 0],  [-85, 0, 0],  [0, 0, 85],  [0, 0, -85],
  [60, 0, 30], [-60, 0, 30], [60, 0, -30], [-60, 0, -30],
];

function Trees() {
  return (
    <group>
      {TREE_POSITIONS.map((pos, i) => {
        const h = 4 + (i % 5) * 0.9;
        const mat = TREE_MATS[i % 3];
        return (
          <group key={i} position={pos}>
            <mesh geometry={TRUNK_GEO} material={TRUNK_MAT} castShadow
              position={[0, h * 0.28, 0]} />
            <mesh geometry={CONE_GEO_LG} material={mat} castShadow
              position={[0, h * 0.7, 0]} />
            <mesh geometry={CONE_GEO_SM} material={mat} castShadow
              position={[0, h * 0.92, 0]} />
          </group>
        );
      })}
    </group>
  );
}

/* ── Invisible border walls ────────────────────────────────── */
function Borders() {
  const walls = [
    { pos: [0,   2,  110], args: [220, 4, 1] },
    { pos: [0,   2, -110], args: [220, 4, 1] },
    { pos: [ 110, 2, 0],   args: [1, 4, 220] },
    { pos: [-110, 2, 0],   args: [1, 4, 220] },
  ];
  return (
    <>
      {walls.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <mesh visible={false} position={w.pos}>
            <boxGeometry args={w.args} />
            <meshStandardMaterial />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
