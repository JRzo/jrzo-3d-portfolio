/**
 * Columbia University Campus — drivable low-poly recreation
 *
 * Layout (top-down, +Z = south):
 *
 *   x: -75 ────────────────────────────── x: 75
 *   z:-60  [Pupin]──────── [Low Library] ────── [Hamilton]
 *          Amsterdam Ave   Central Path     Jerome Greene
 *   z:-25  ────── [College Walk / 116th St] ──────────
 *   z: 25  [Lerner]────────[South Field]──────── [Dodge]
 *   z: 60  ──────── [Butler Library] ────────────────
 *
 * Zones:
 *   Home     → Low Library  (central dome, iconic steps)
 *   Projects → Butler Library (south, pillared façade)
 *   Skills   → Pupin Hall   (northwest, tall physics tower)
 *   Sports   → Dodge Gym    (east, sports/culture + DR flag)
 *   Contact  → Lerner Hall  (west-central, modern glass)
 */

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

/* ── Zone definitions ─────────────────────────────────────── */
export const ZONES = [
  { id: 'home',     label: 'Low Library',   icon: '🏛️', color: '#f4a261', pos: [0,    0, -22] },
  { id: 'projects', label: 'Butler Library',icon: '📚', color: '#9b5de5', pos: [0,    0,  62] },
  { id: 'skills',   label: 'Pupin Hall',    icon: '⚡', color: '#06d6a0', pos: [-58,  0, -28] },
  { id: 'sports',   label: 'Dodge / Field', icon: '🏀', color: '#ef476f', pos: [58,   0,  18] },
  { id: 'contact',  label: 'Lerner Hall',   icon: '📡', color: '#118ab2', pos: [-42,  0,  22] },
];

export const ZONE_RADIUS = 20;

/* ── Campus colour palette ────────────────────────────────── */
const COL_BRICK       = '#9e3a1a';   // Columbia brick red
const COL_BRICK_DARK  = '#7a2c12';
const COL_STONE       = '#d4c8b0';   // cream limestone trim
const COL_STONE_DARK  = '#b0a490';
const COL_DOME        = '#4a7c3a';   // verdigris green dome
const COL_ROOF        = '#3d5c2a';   // darker roof
const COL_GRASS       = '#4a7c3a';
const COL_QUAD        = '#5a8c45';
const COL_PATH        = '#c8b48a';   // stone walkway
const COL_ROAD        = '#6a6a58';
const COL_SKY         = '#87ceeb';

const ROT90 = new THREE.Euler(-Math.PI / 2, 0, 0);

/* ── Reusable geometry / material (module-level) ─────────────*/
const PATH_MAT    = new THREE.MeshLambertMaterial({ color: COL_PATH });
const ROAD_MAT    = new THREE.MeshLambertMaterial({ color: COL_ROAD });
const GRASS_MAT   = new THREE.MeshLambertMaterial({ color: COL_GRASS });
const QUAD_MAT    = new THREE.MeshLambertMaterial({ color: COL_QUAD });
const STONE_MAT   = new THREE.MeshLambertMaterial({ color: COL_STONE });
const STONE_D_MAT = new THREE.MeshLambertMaterial({ color: COL_STONE_DARK });
const BRICK_MAT   = new THREE.MeshLambertMaterial({ color: COL_BRICK });
const BRICK_D_MAT = new THREE.MeshLambertMaterial({ color: COL_BRICK_DARK });
const DOME_MAT    = new THREE.MeshLambertMaterial({ color: COL_DOME });
const ROOF_MAT    = new THREE.MeshLambertMaterial({ color: COL_ROOF });
const TRUNK_MAT   = new THREE.MeshLambertMaterial({ color: '#5c3d1a' });
const TREE_MATS   = [
  new THREE.MeshLambertMaterial({ color: '#2d6a30' }),
  new THREE.MeshLambertMaterial({ color: '#3a7a35' }),
  new THREE.MeshLambertMaterial({ color: '#254f28' }),
];

// Shared geometries
const TRUNK_GEO      = new THREE.CylinderGeometry(0.22, 0.32, 2.4, 7);
const CONE_LG        = new THREE.ConeGeometry(2.2, 4.0, 9);
const CONE_SM        = new THREE.ConeGeometry(1.5, 2.6, 9);
const LAMP_POLE_GEO  = new THREE.CylinderGeometry(0.1, 0.13, 6, 6);
const LAMP_GLOBE_GEO = new THREE.SphereGeometry(0.32, 8, 8);
const DASH_GEO       = new THREE.PlaneGeometry(1, 1);

const LAMP_POLE_MAT  = new THREE.MeshLambertMaterial({ color: '#4a4a5a' });
const LAMP_GLOBE_MAT = new THREE.MeshBasicMaterial({ color: '#fffde0' });
const DASH_MAT       = new THREE.MeshBasicMaterial({ color: '#ffd166' });

/* ══════════════════════════════════════════════════════════
   WORLD ROOT
═══════════════════════════════════════════════════════════ */
export default function World() {
  return (
    <group>
      {/* Physics ground — explicit cuboid collider (plane = 0 thickness = falls through) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[150, 0.5, 150]} position={[0, -0.55, 0]} />
        <mesh receiveShadow rotation={ROT90}>
          <planeGeometry args={[400, 400]} />
          <meshLambertMaterial color={COL_GRASS} />
        </mesh>
      </RigidBody>

      {/* Campus ground zones (quads, paths) */}
      <CampusGround />

      {/* Road / path network */}
      <Roads />

      {/* Invisible walls */}
      <Borders />

      {/* Zone buildings */}
      <LowLibrary    position={ZONES[0].pos} />
      <ButlerLibrary position={ZONES[1].pos} />
      <PupinHall     position={ZONES[2].pos} />
      <DodgeCenter   position={ZONES[3].pos} />
      <LernerHall    position={ZONES[4].pos} />

      {/* Side campus buildings (filler, non-zone) */}
      <SideCampus />

      {/* Trees along walkways */}
      <CampusTrees />

      {/* Lampposts */}
      <Lampposts />

      {/* ── Columbia-appropriate lighting ─── */}
      {/* Strong warm midday sun from upper southwest */}
      <directionalLight
        position={[60, 110, 50]}
        intensity={2.6}
        color="#fff8e8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={280}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0003}
      />
      {/* Sky fill */}
      <hemisphereLight skyColor="#87ceeb" groundColor={COL_GRASS} intensity={1.1} />
      {/* Ambient so shadow sides aren't pitch black */}
      <ambientLight intensity={0.55} color="#fff5e0" />
    </group>
  );
}

/* ── Campus ground layers ──────────────────────────────────── */
function CampusGround() {
  return (
    <group>
      {/* Main campus platform (slightly raised above grass) */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.01, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshLambertMaterial color="#c2b49c" />
      </mesh>

      {/* South Field quad — the large grass rectangle */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.04, 20]}>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color={COL_QUAD} />
      </mesh>

      {/* North quad around Low Library */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.04, -22]}>
        <planeGeometry args={[50, 30]} />
        <meshLambertMaterial color={COL_QUAD} />
      </mesh>

      {/* College Walk stone surface */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.05, -4]}>
        <planeGeometry args={[130, 18]} />
        <meshLambertMaterial color="#d4c8b0" />
      </mesh>

      {/* Diagonal paths from Low steps to College Walk */}
      {[-14, 14].map((x, i) => (
        <mesh key={i} receiveShadow rotation={ROT90} position={[x * 0.5, 0.06, -10]}>
          <planeGeometry args={[5, 20]} />
          <meshLambertMaterial color="#c8bca8" />
        </mesh>
      ))}

      {/* Central N-S axis path */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.06, 20]}>
        <planeGeometry args={[8, 85]} />
        <meshLambertMaterial color="#c8bca8" />
      </mesh>
    </group>
  );
}

/* ── Roads (Amsterdam Ave, Broadway, 116th) ────────────────── */
function Roads() {
  return (
    <group>
      <mesh rotation={ROT90} position={[-68, 0.02, 0]}>
        <planeGeometry args={[12, 200]} /><primitive object={ROAD_MAT} attach="material" />
      </mesh>
      <mesh rotation={ROT90} position={[68, 0.02, 0]}>
        <planeGeometry args={[12, 200]} /><primitive object={ROAD_MAT} attach="material" />
      </mesh>
      <mesh rotation={ROT90} position={[0, 0.02, 72]}>
        <planeGeometry args={[200, 12]} /><primitive object={ROAD_MAT} attach="material" />
      </mesh>
      <mesh rotation={ROT90} position={[0, 0.02, -72]}>
        <planeGeometry args={[200, 12]} /><primitive object={ROAD_MAT} attach="material" />
      </mesh>
      {/* All 50 road dashes as a single InstancedMesh */}
      <IM mats={DASH_DATA} geo={DASH_GEO} mat={DASH_MAT} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   LOW LIBRARY — Home zone
   Iconic neoclassical dome building, wide steps, 8 columns
═════════════════════════════════════════════════════════════*/
function LowLibrary({ position }) {
  const glowRef = useRef();
  useFrame(({ clock }) => {
    if (glowRef.current)
      glowRef.current.intensity = 1.8 + Math.sin(clock.elapsedTime * 1.2) * 0.4;
  });

  return (
    <group position={position}>
      {/* Zone proximity ring */}
      <ZoneRing color="#f4a261" />

      {/* Wide stone base / podium */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[28, 1, 22]} />
        <meshLambertMaterial color={COL_STONE_DARK} />
      </mesh>

      {/* Step cascade (3 tiers) */}
      {[0, 1, 2].map(i => (
        <mesh key={i} castShadow receiveShadow
          position={[0, i * 0.4 + 0.2, 9 - i * 1.5]}>
          <boxGeometry args={[26 - i * 2, 0.4, 3.5]} />
          <meshLambertMaterial color={COL_STONE} />
        </mesh>
      ))}

      {/* Main building body */}
      <mesh castShadow receiveShadow position={[0, 5, -1]}>
        <boxGeometry args={[24, 10, 18]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* Columns across the front face (8 columns) */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} castShadow
          position={[-12 + i * 3.44, 5.5, 8.1]}>
          <cylinderGeometry args={[0.42, 0.5, 10, 10]} />
          <meshLambertMaterial color="#e0d4bc" />
        </mesh>
      ))}

      {/* Pediment / triangular gable */}
      <mesh castShadow position={[0, 11.5, 8]}>
        <boxGeometry args={[24, 0.5, 1.5]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>
      <mesh castShadow position={[0, 13.5, 8]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[12.5, 4, 4]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* Drum (cylinder below dome) */}
      <mesh castShadow position={[0, 14, -2]}>
        <cylinderGeometry args={[6, 6.5, 5, 16]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* THE DOME — iconic verdigris green */}
      <mesh castShadow position={[0, 18, -2]}>
        <sphereGeometry args={[6.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
        <meshLambertMaterial color={COL_DOME} />
      </mesh>

      {/* Lantern on dome */}
      <mesh castShadow position={[0, 23.5, -2]}>
        <cylinderGeometry args={[1.1, 1.3, 2.5, 12]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>
      <mesh castShadow position={[0, 25.5, -2]}>
        <sphereGeometry args={[1.1, 10, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshLambertMaterial color={COL_DOME} />
      </mesh>

      {/* Columbia "C" flag pole */}
      <mesh castShadow position={[11, 5, 8.5]}>
        <cylinderGeometry args={[0.1, 0.1, 8, 6]} />
        <meshLambertMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[12.4, 8, 8.5]}>
        <planeGeometry args={[2.6, 1.4]} />
        <meshBasicMaterial color="#003087" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[12.4, 8, 8.52]}>
        <planeGeometry args={[2.6, 0.22]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* Glow light under dome */}
      <pointLight ref={glowRef} position={[0, 20, -2]} color="#f4a261" intensity={2} distance={35} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   BUTLER LIBRARY — Projects zone
   Large neoclassical building, pillared facade, engraved names
═════════════════════════════════════════════════════════════*/
function ButlerLibrary({ position }) {
  return (
    <group position={position}>
      <ZoneRing color="#9b5de5" />

      {/* Stone steps (wider, shallower than Low) */}
      {[0, 1].map(i => (
        <mesh key={i} castShadow receiveShadow
          position={[0, i * 0.35 + 0.18, -12.5 + i * 1.4]}>
          <boxGeometry args={[44 - i * 2, 0.35, 4]} />
          <meshLambertMaterial color={COL_STONE} />
        </mesh>
      ))}

      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 7, 0]}>
        <boxGeometry args={[42, 14, 20]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* Darker base band */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[42.5, 2.4, 20.5]} />
        <meshLambertMaterial color={COL_STONE_DARK} />
      </mesh>

      {/* 12 columns across front facade */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} castShadow
          position={[-22 + i * 4, 7, -10.1]}>
          <cylinderGeometry args={[0.48, 0.56, 13.5, 10]} />
          <meshLambertMaterial color="#ddd0b8" />
        </mesh>
      ))}

      {/* Entablature (horizontal band above columns) */}
      <mesh castShadow position={[0, 14.8, -10]}>
        <boxGeometry args={[43, 1.2, 1.5]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* Parapet / flat roof top */}
      <mesh castShadow position={[0, 15.4, 0]}>
        <boxGeometry args={[43, 0.8, 21]} />
        <meshLambertMaterial color={COL_STONE_DARK} />
      </mesh>

      {/* "BUTLER LIBRARY" name band (bright panel) */}
      <mesh position={[0, 11.5, -10.2]}>
        <planeGeometry args={[36, 2.2]} />
        <meshBasicMaterial color="#e8dcc8" />
      </mesh>

      {/* Wing extensions */}
      {[-22, 22].map((x, i) => (
        <mesh key={i} castShadow receiveShadow position={[x, 5.5, 3]}>
          <boxGeometry args={[3, 11, 8]} />
          <meshLambertMaterial color={COL_STONE_DARK} />
        </mesh>
      ))}

      <pointLight position={[0, 14, 0]} color="#c77dff" intensity={2.5} distance={35} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   PUPIN HALL — Skills zone
   Tall brick tower (17 floors real life, scaled), physics dept
═════════════════════════════════════════════════════════════*/
function PupinHall({ position }) {
  return (
    <group position={position}>
      <ZoneRing color="#06d6a0" />

      {/* Wide base/podium */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[24, 2, 18]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* Main brick tower */}
      <mesh castShadow receiveShadow position={[0, 11, 0]}>
        <boxGeometry args={[20, 22, 16]} />
        <meshLambertMaterial color={COL_BRICK} />
      </mesh>

      {/* Stone window surrounds (horizontal bands every 3 floors) */}
      {[3, 7, 11, 15, 19].map((y, i) => (
        <mesh key={i} castShadow position={[0, y, -8.1]}>
          <boxGeometry args={[20, 0.5, 0.2]} />
          <meshLambertMaterial color={COL_STONE} />
        </mesh>
      ))}

      {/* Window columns (vertical stone pilasters) */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={i} castShadow position={[x, 11, -8.08]}>
          <boxGeometry args={[0.6, 22, 0.15]} />
          <meshLambertMaterial color={COL_STONE_DARK} />
        </mesh>
      ))}

      {/* Windows — glowing */}
      {[4, 7, 10, 13, 16, 19].map((y, row) =>
        [-6, -2, 2, 6].map((x, col) => (
          <mesh key={`${row}-${col}`} position={[x, y, -8.08]}>
            <boxGeometry args={[1.4, 1.8, 0.05]} />
            <meshBasicMaterial color={row % 2 === 0 ? '#d4e8ff' : '#c8d8f0'} />
          </mesh>
        ))
      )}

      {/* Tower top / cornice */}
      <mesh castShadow position={[0, 22.8, 0]}>
        <boxGeometry args={[21, 1.2, 17]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>
      {/* Setback upper section */}
      <mesh castShadow position={[0, 28, 0]}>
        <boxGeometry args={[14, 10, 12]} />
        <meshLambertMaterial color={COL_BRICK_DARK} />
      </mesh>
      <mesh castShadow position={[0, 33.5, 0]}>
        <boxGeometry args={[14.5, 0.8, 12.5]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* Antenna / flagpole */}
      <mesh castShadow position={[0, 37, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5, 6]} />
        <meshLambertMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0, 39.8, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color="#06d6a0" />
      </mesh>
      <pointLight position={[0, 38, 0]} color="#06d6a0" intensity={3} distance={20} />

      {/* Skill label signs on the side */}
      {['Python', 'Spark', 'ML', 'AWS', 'dbt'].map((label, i) => (
        <mesh key={i} position={[10.1, 4 + i * 3.8, 0]}>
          <boxGeometry args={[0.1, 2.2, 5]} />
          <meshBasicMaterial color={['#06d6a0','#48cae4','#0077b6','#90e0ef','#48cae4'][i]} />
        </mesh>
      ))}

      <pointLight position={[0, 16, 0]} color="#06d6a0" intensity={2.5} distance={32} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   DODGE CENTER — Sports zone
   Gym + basketball court + cultural corner (DR flag, sports)
═════════════════════════════════════════════════════════════*/
function DodgeCenter({ position }) {
  const rimGlowRef = useRef();
  useFrame(({ clock }) => {
    if (rimGlowRef.current)
      rimGlowRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 2) * 0.8;
  });

  return (
    <group position={position}>
      <ZoneRing color="#ef476f" />

      {/* Main Dodge building */}
      <mesh castShadow receiveShadow position={[0, 5, 0]}>
        <boxGeometry args={[28, 10, 20]} />
        <meshLambertMaterial color={COL_BRICK} />
      </mesh>
      {/* Stone base band */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[28.5, 2, 20.5]} />
        <meshLambertMaterial color={COL_STONE_DARK} />
      </mesh>
      {/* Entry arch */}
      <mesh castShadow position={[0, 5, -10.1]}>
        <boxGeometry args={[6, 8, 0.5]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>
      <mesh castShadow position={[0, 9.5, -10.1]}>
        <cylinderGeometry args={[3, 3, 0.5, 16, 1, false, 0, Math.PI]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>
      {/* Roof parapet */}
      <mesh castShadow position={[0, 10.8, 0]}>
        <boxGeometry args={[29, 1.2, 21]} />
        <meshLambertMaterial color={COL_STONE_DARK} />
      </mesh>

      {/* Outdoor basketball court on east side */}
      <group position={[22, 0, 0]}>
        {/* Court surface */}
        <mesh receiveShadow rotation={ROT90} position={[0, 0.04, 0]}>
          <planeGeometry args={[26, 18]} />
          <meshLambertMaterial color="#c8792a" />
        </mesh>
        {/* Court border */}
        <mesh receiveShadow rotation={ROT90} position={[0, 0.03, 0]}>
          <planeGeometry args={[28, 20]} />
          <meshLambertMaterial color="#8a5214" />
        </mesh>
        {/* Center circle */}
        <mesh rotation={ROT90} position={[0, 0.06, 0]}>
          <ringGeometry args={[3.4, 3.55, 28]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Half-court line */}
        <mesh rotation={ROT90} position={[0, 0.06, 0]}>
          <planeGeometry args={[0.14, 18]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Hoops */}
        {[-12, 12].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh castShadow position={[0, 3.5, 0]}>
              <cylinderGeometry args={[0.14, 0.16, 7, 8]} />
              <meshLambertMaterial color="#888888" />
            </mesh>
            <mesh castShadow position={[i === 0 ? 0.9 : -0.9, 6, 0]}>
              <boxGeometry args={[0.12, 2, 3]} />
              <meshLambertMaterial color="#d8e8ff" />
            </mesh>
            <mesh position={[i === 0 ? 1.6 : -1.6, 5, 0]}
              rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.46, 0.06, 8, 16]} />
              <meshBasicMaterial color="#ff6a00" />
            </mesh>
          </group>
        ))}
        {/* Stadium lights */}
        {[[-11,-8],[11,-8],[-11,8],[11,8]].map(([x,z],i)=>(
          <group key={i} position={[x,0,z]}>
            <mesh castShadow position={[0,6,0]}>
              <cylinderGeometry args={[0.15,0.2,12,6]} />
              <meshLambertMaterial color="#777777" />
            </mesh>
            <mesh position={[0,12.6,0]}>
              <boxGeometry args={[2,0.5,0.8]} />
              <meshBasicMaterial color="#fffde0" />
            </mesh>
            <pointLight position={[0,13,0]} color="#fffce0" intensity={3.5} distance={25} castShadow={false} />
          </group>
        ))}
      </group>

      {/* Dominican Republic flag pole + flag */}
      <group position={[-16, 0, -8]}>
        <mesh castShadow position={[0, 6, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 12, 6]} />
          <meshLambertMaterial color="#aaaaaa" />
        </mesh>
        {/* DR Flag */}
        <DominicanFlag y={10.5} />
      </group>

      {/* Baseball corner */}
      <group position={[-18, 0, 14]}>
        <mesh receiveShadow rotation={ROT90} position={[0, 0.04, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshLambertMaterial color="#c8a96e" />
        </mesh>
        {[[0,5],[5,0],[0,-5],[-5,0]].map(([bx,bz],i)=>(
          <mesh key={i} castShadow position={[bx,0.15,bz]}>
            <boxGeometry args={[0.7,0.2,0.7]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh castShadow position={[0,0.2,0]}>
          <cylinderGeometry args={[0.9,1.1,0.4,10]} />
          <meshLambertMaterial color="#b89060" />
        </mesh>
      </group>

      <pointLight ref={rimGlowRef} position={[22, 8, 0]} color="#ef476f" intensity={2} distance={30} />
      <pointLight position={[0, 8, 0]} color="#ef476f" intensity={2.5} distance={35} />
    </group>
  );
}

function DominicanFlag({ y = 0 }) {
  return (
    <group position={[0, y, 0]}>
      {/* Blue top-left */}
      <mesh position={[-0.55, 0.4, 0.06]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshBasicMaterial color="#002d62" side={THREE.DoubleSide} />
      </mesh>
      {/* Blue bottom-right */}
      <mesh position={[0.55, -0.4, 0.06]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshBasicMaterial color="#002d62" side={THREE.DoubleSide} />
      </mesh>
      {/* Red top-right */}
      <mesh position={[0.55, 0.4, 0.06]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshBasicMaterial color="#ce1126" side={THREE.DoubleSide} />
      </mesh>
      {/* Red bottom-left */}
      <mesh position={[-0.55, -0.4, 0.06]}>
        <planeGeometry args={[1.1, 0.8]} />
        <meshBasicMaterial color="#ce1126" side={THREE.DoubleSide} />
      </mesh>
      {/* White cross */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[0.22, 1.62]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[2.22, 0.22]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   LERNER HALL — Contact zone
   Modern glass & brick building (Columbia Student Center)
═════════════════════════════════════════════════════════════*/
function LernerHall({ position }) {
  const beamRef = useRef();
  useFrame(({ clock }) => {
    if (beamRef.current)
      beamRef.current.material.opacity = 0.06 + Math.abs(Math.sin(clock.elapsedTime * 0.6)) * 0.18;
  });

  return (
    <group position={position}>
      <ZoneRing color="#118ab2" />

      {/* Main brick body */}
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[22, 12, 16]} />
        <meshLambertMaterial color={COL_BRICK} />
      </mesh>
      {/* Stone base */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[22.5, 2, 16.5]} />
        <meshLambertMaterial color={COL_STONE_DARK} />
      </mesh>

      {/* Glass atrium facade — large window panels */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, 3 + i * 2.5, -8.05]}>
          <boxGeometry args={[18, 2, 0.18]} />
          <meshLambertMaterial color="#a8d8ea" transparent opacity={0.65} />
        </mesh>
      ))}
      {/* Vertical glass dividers */}
      {[-7,-3.5,0,3.5,7].map((x,i)=>(
        <mesh key={i} position={[x, 6, -8.04]}>
          <boxGeometry args={[0.3, 10, 0.1]} />
          <meshLambertMaterial color="#5ba4cf" />
        </mesh>
      ))}

      {/* Setback upper floor */}
      <mesh castShadow position={[0, 14, -2]}>
        <boxGeometry args={[16, 3, 12]} />
        <meshLambertMaterial color={COL_BRICK_DARK} />
      </mesh>
      <mesh castShadow position={[0, 13.2, -2]}>
        <boxGeometry args={[17, 0.8, 13]} />
        <meshLambertMaterial color={COL_STONE} />
      </mesh>

      {/* Comm dish on roof */}
      <mesh castShadow position={[4, 17, -1]}>
        <cylinderGeometry args={[0.2, 0.25, 4, 8]} />
        <meshLambertMaterial color="#888" />
      </mesh>
      <group position={[4, 20, -1]}>
        <mesh castShadow rotation={[Math.PI / 3.5, 0, 0]}>
          <sphereGeometry args={[2.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshLambertMaterial color="#1a5f8a" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshBasicMaterial color="#48cae4" />
        </mesh>
      </group>

      {/* Transmission beam */}
      <mesh ref={beamRef} position={[4, 38, -1]}>
        <cylinderGeometry args={[0.15, 0.9, 40, 8]} />
        <meshBasicMaterial color="#48cae4" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      <pointLight position={[0, 12, 0]} color="#48cae4" intensity={3} distance={32} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════
   SIDE CAMPUS BUILDINGS (Havemeyer, Hamilton, Fayerweather…)
══════════════════════════════════════════════════════════ */
function SideCampus() {
  const buildings = [
    // Hamilton Hall (east of Low)
    { pos: [32,  0, -28], w: 16, h: 10, d: 12, color: COL_STONE,   roof: COL_STONE_DARK  },
    // Avery Hall (architecture, east)
    { pos: [32,  0,  -6], w: 14, h:  9, d: 12, color: COL_STONE,   roof: COL_STONE_DARK  },
    // Philosophy Hall (west of Low)
    { pos: [-32, 0, -28], w: 16, h:  9, d: 12, color: COL_BRICK,   roof: COL_BRICK_DARK  },
    // Fayerweather (west)
    { pos: [-32, 0,  -6], w: 14, h:  8, d: 12, color: COL_BRICK,   roof: COL_BRICK_DARK  },
    // Hartley / Wallach dorms (south)
    { pos: [-22, 0,  46], w: 18, h: 11, d: 14, color: COL_BRICK,   roof: COL_BRICK_DARK  },
    { pos: [22,  0,  46], w: 18, h: 11, d: 14, color: COL_BRICK,   roof: COL_BRICK_DARK  },
    // Wien Hall (north)
    { pos: [-30, 0, -48], w: 20, h: 10, d: 14, color: COL_BRICK,   roof: COL_ROOF        },
    { pos: [30,  0, -48], w: 20, h: 10, d: 14, color: COL_BRICK,   roof: COL_ROOF        },
  ];

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh castShadow receiveShadow position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshLambertMaterial color={b.color} />
          </mesh>
          {/* Roof/parapet cap */}
          <mesh castShadow position={[0, b.h + 0.5, 0]}>
            <boxGeometry args={[b.w + 0.4, 0.8, b.d + 0.4]} />
            <meshLambertMaterial color={b.roof} />
          </mesh>
          {/* Stone base */}
          <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
            <boxGeometry args={[b.w + 0.4, 1.4, b.d + 0.4]} />
            <meshLambertMaterial color={COL_STONE_DARK} />
          </mesh>
          {/* Entry columns (2) */}
          {[-2, 2].map((x, j) => (
            <mesh key={j} castShadow position={[x, b.h * 0.4, -b.d / 2 - 0.1]}>
              <cylinderGeometry args={[0.3, 0.36, b.h * 0.8, 8]} />
              <meshLambertMaterial color={COL_STONE} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── Zone ring ─────────────────────────────────────────────── */
function ZoneRing({ color }) {
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.45 + Math.sin(clock.elapsedTime * 2.2) * 0.2;
  });
  return (
    <mesh rotation={ROT90} position={[0, 0.08, 0]}>
      <ringGeometry args={[18, 20, 40]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.5} />
    </mesh>
  );
}

/* ── Campus trees ──────────────────────────────────────────── */
// Positioned along College Walk, South Field border, and campus edges
const TREE_POSITIONS_PROTO = [
  // College Walk trees (flanking the path, z≈-4)
  ...Array.from({length:9},(_, i)=>[(-40 + i*10), 0, -10]),
  ...Array.from({length:9},(_, i)=>[(-40 + i*10), 0,  2]),
  // South Field perimeter
  ...[-28,-14,0,14,28].map(x=>[x, 0, -5]),
  ...[-28,-14,0,14,28].map(x=>[x, 0, 48]),
  ...Array.from({length:5},(_, i)=>[-30, 0, 5 + i*9]),
  ...Array.from({length:5},(_, i)=>[ 30, 0, 5 + i*9]),
  // Amsterdam Ave border (west)
  ...Array.from({length:14},(_, i)=>[-58, 0, -60 + i*10]),
  // Broadway border (east)
  ...Array.from({length:14},(_, i)=>[ 58, 0, -60 + i*10]),
  // Campus corners
  [-48,0,-55],[48,0,-55],[-48,0,55],[48,0,55],
  [-48,0,-38],[48,0,-38],[-48,0,38],[48,0,38],
];

/* ── Helpers for one-shot instanced static meshes ──────────── */
function IM({ mats, geo, mat, cast }) {
  const ref = useRef();
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    mats.forEach((mx, i) => m.setMatrixAt(i, mx));
    m.instanceMatrix.needsUpdate = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!mats.length) return null;
  return <instancedMesh ref={ref} args={[geo, mat, mats.length]} castShadow={!!cast} />;
}

function CampusTrees() {
  return (
    <group>
      <IM mats={TREE_DATA.trunks} geo={TRUNK_GEO} mat={TRUNK_MAT} cast />
      {TREE_MATS.map((m, mi) => (
        <group key={mi}>
          <IM mats={TREE_DATA.lg[mi]} geo={CONE_LG} mat={m} cast />
          <IM mats={TREE_DATA.sm[mi]} geo={CONE_SM} mat={m} cast />
        </group>
      ))}
    </group>
  );
}

/* ── Lampposts ──────────────────────────────────────────────── */
const LAMP_SPOTS_PROTO = [
  // College Walk
  ...[-30,-20,-10,0,10,20,30].flatMap(x=>[[x,-8],[x,2]]),
  // Central N-S axis
  ...[-40,-25,-10,10,25,40].flatMap(z=>[[-5,z],[5,z]]),
];

/* ── Pre-computed instanced transforms (runs once at module init) ── */
const _d = new THREE.Object3D();

const TREE_DATA = (() => {
  const trunks = [], lg = [[], [], []], sm = [[], [], []];
  TREE_POSITIONS_PROTO.forEach((pos, i) => {
    const h = 5 + (i % 4) * 1.2, mat = i % 3;
    _d.position.set(pos[0], h * 0.3,  pos[2]); _d.scale.setScalar(1); _d.updateMatrix(); trunks.push(_d.matrix.clone());
    _d.position.set(pos[0], h * 0.72, pos[2]); _d.updateMatrix(); lg[mat].push(_d.matrix.clone());
    _d.position.set(pos[0], h * 0.94, pos[2]); _d.updateMatrix(); sm[mat].push(_d.matrix.clone());
  });
  return { trunks, lg, sm };
})();

const LAMP_DATA = (() => {
  const poles = [], globes = [];
  LAMP_SPOTS_PROTO.forEach(([x, z]) => {
    _d.position.set(x, 3,   z); _d.scale.setScalar(1); _d.updateMatrix(); poles.push(_d.matrix.clone());
    _d.position.set(x, 6.3, z); _d.updateMatrix(); globes.push(_d.matrix.clone());
  });
  return { poles, globes };
})();

const DASH_DATA = (() => {
  const list = [];
  const push = (x, y, z, sx, sy) => {
    _d.position.set(x, y, z); _d.rotation.set(-Math.PI / 2, 0, 0); _d.scale.set(sx, sy, 1); _d.updateMatrix();
    list.push(_d.matrix.clone());
  };
  for (let j = 0; j < 18; j++) push(-82 + j * 10, 0.09, 72,            5,   0.3);
  for (let j = 0; j < 16; j++) push(-68,           0.09, -75 + j * 10, 0.3, 5);
  for (let j = 0; j < 16; j++) push( 68,           0.09, -75 + j * 10, 0.3, 5);
  return list;
})();

function Lampposts() {
  return (
    <group>
      <IM mats={LAMP_DATA.poles}  geo={LAMP_POLE_GEO}  mat={LAMP_POLE_MAT} />
      <IM mats={LAMP_DATA.globes} geo={LAMP_GLOBE_GEO} mat={LAMP_GLOBE_MAT} />
    </group>
  );
}

/* ── Invisible border walls ─────────────────────────────────── */
function Borders() {
  return (
    <>
      {[
        { pos: [0,  2,  100], args: [200, 4, 1] },
        { pos: [0,  2, -100], args: [200, 4, 1] },
        { pos: [ 100, 2,  0], args: [1, 4, 200] },
        { pos: [-100, 2,  0], args: [1, 4, 200] },
      ].map((w, i) => (
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
