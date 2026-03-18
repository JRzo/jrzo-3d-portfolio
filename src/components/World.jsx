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
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { createDominicanFlagTexture } from '../utils/createPosterTexture';

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
const PATH_MAT    = new THREE.MeshStandardMaterial({ color: COL_PATH, roughness: 0.8, metalness: 0.05 });
const ROAD_MAT    = new THREE.MeshStandardMaterial({ color: COL_ROAD, roughness: 0.85, metalness: 0.06 });
const GRASS_MAT   = new THREE.MeshStandardMaterial({ color: COL_GRASS, roughness: 0.9, metalness: 0.0 });
const QUAD_MAT    = new THREE.MeshStandardMaterial({ color: COL_QUAD, roughness: 0.9, metalness: 0.0 });
const TRUNK_MAT   = new THREE.MeshStandardMaterial({ color: '#5c3d1a', roughness: 0.85, metalness: 0.0 });
const TREE_MATS   = [
  new THREE.MeshStandardMaterial({ color: '#2d6a30', roughness: 0.9, metalness: 0.0 }),
  new THREE.MeshStandardMaterial({ color: '#3a7a35', roughness: 0.9, metalness: 0.0 }),
  new THREE.MeshStandardMaterial({ color: '#254f28', roughness: 0.9, metalness: 0.0 }),
];

// Shared geometries
const TRUNK_GEO      = new THREE.CylinderGeometry(0.22, 0.32, 2.4, 7);
const CONE_LG        = new THREE.ConeGeometry(2.2, 4.0, 9);
const CONE_SM        = new THREE.ConeGeometry(1.5, 2.6, 9);
const LAMP_POLE_GEO  = new THREE.CylinderGeometry(0.1, 0.13, 6, 6);
const LAMP_GLOBE_GEO = new THREE.SphereGeometry(0.32, 8, 8);
const DASH_GEO       = new THREE.PlaneGeometry(1, 1);

const LAMP_POLE_MAT  = new THREE.MeshStandardMaterial({ color: '#4a4a5a', roughness: 0.5, metalness: 0.6 });
const LAMP_GLOBE_MAT = new THREE.MeshStandardMaterial({ color: '#fffde0', emissive: '#fff6cc', emissiveIntensity: 1.5, roughness: 0.25, metalness: 0.0 });
const WINDOW_MAT     = new THREE.MeshStandardMaterial({
  color: '#9fbad0',
  emissive: '#1a2e3f',
  emissiveIntensity: 0.35,
  roughness: 0.2,
  metalness: 0.05,
  transparent: true,
  opacity: 0.75,
});
const DASH_MAT       = new THREE.MeshBasicMaterial({ color: '#ffd166' });

function WindowGrid({ position, rotation = [0, 0, 0], rows, cols, w, h, gapX, gapY }) {
  const list = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * gapX;
      const y = (r - (rows - 1) / 2) * gapY;
      list.push([x, y, 0]);
    }
  }
  return (
    <group position={position} rotation={rotation}>
      {list.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[w, h, 0.04]} />
          <primitive object={WINDOW_MAT} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════
   WORLD ROOT
═══════════════════════════════════════════════════════════ */
export default function World({ enablePhysics = true }) {
  return (
    <group>
      {/* Physics ground — explicit cuboid collider (plane = 0 thickness = falls through) */}
      {enablePhysics ? (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[150, 0.5, 150]} position={[0, -0.55, 0]} />
          <mesh receiveShadow rotation={ROT90}>
            <planeGeometry args={[400, 400]} />
            <meshStandardMaterial color={COL_GRASS} roughness={0.9} metalness={0.0} />
          </mesh>
        </RigidBody>
      ) : (
        <mesh receiveShadow rotation={ROT90}>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color={COL_GRASS} roughness={0.9} metalness={0.0} />
        </mesh>
      )}

      {/* Campus ground zones (quads, paths) */}
      <CampusGround />

      {/* Road / path network */}
      <Roads />

      {/* Invisible walls */}
      {enablePhysics && <Borders />}

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
        <meshStandardMaterial color="#c2b49c" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* South Field quad — the large grass rectangle */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.04, 20]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={COL_QUAD} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* North quad around Low Library */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.04, -22]}>
        <planeGeometry args={[50, 30]} />
        <meshStandardMaterial color={COL_QUAD} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* College Walk stone surface */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.05, -4]}>
        <planeGeometry args={[130, 18]} />
        <meshStandardMaterial color="#d4c8b0" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Diagonal paths from Low steps to College Walk */}
      {[-14, 14].map((x, i) => (
        <mesh key={i} receiveShadow rotation={ROT90} position={[x * 0.5, 0.06, -10]}>
          <planeGeometry args={[5, 20]} />
          <meshStandardMaterial color="#c8bca8" roughness={0.75} metalness={0.05} />
        </mesh>
      ))}

      {/* Central N-S axis path */}
      <mesh receiveShadow rotation={ROT90} position={[0, 0.06, 20]}>
        <planeGeometry args={[8, 85]} />
        <meshStandardMaterial color="#c8bca8" roughness={0.75} metalness={0.05} />
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
        <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Step cascade (3 tiers) */}
      {[0, 1, 2].map(i => (
        <mesh key={i} castShadow receiveShadow
          position={[0, i * 0.4 + 0.2, 9 - i * 1.5]}>
          <boxGeometry args={[26 - i * 2, 0.4, 3.5]} />
          <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}

      {/* Main building body */}
      <mesh castShadow receiveShadow position={[0, 5, -1]}>
        <boxGeometry args={[24, 10, 18]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Window grid */}
      <WindowGrid
        position={[0, 5.3, 8.6]}
        rows={3}
        cols={6}
        w={1.4}
        h={1.1}
        gapX={3.2}
        gapY={2.4}
      />

      {/* Columns across the front face (8 columns) */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} castShadow
          position={[-12 + i * 3.44, 5.5, 8.1]}>
          <cylinderGeometry args={[0.42, 0.5, 10, 10]} />
          <meshStandardMaterial color="#e0d4bc" roughness={0.6} metalness={0.05} />
        </mesh>
      ))}

      {/* Pediment / triangular gable */}
      <mesh castShadow position={[0, 11.5, 8]}>
        <boxGeometry args={[24, 0.5, 1.5]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 13.5, 8]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[12.5, 4, 4]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Roof ledge */}
      <mesh castShadow position={[0, 10.7, -1]}>
        <boxGeometry args={[24.8, 0.6, 18.8]} />
        <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Drum (cylinder below dome) */}
      <mesh castShadow position={[0, 14, -2]}>
        <cylinderGeometry args={[6, 6.5, 5, 16]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* THE DOME — iconic verdigris green */}
      <mesh castShadow position={[0, 18, -2]}>
        <sphereGeometry args={[6.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
        <meshStandardMaterial color={COL_DOME} roughness={0.35} metalness={0.2} />
      </mesh>

      {/* Lantern on dome */}
      <mesh castShadow position={[0, 23.5, -2]}>
        <cylinderGeometry args={[1.1, 1.3, 2.5, 12]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 25.5, -2]}>
        <sphereGeometry args={[1.1, 10, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color={COL_DOME} roughness={0.35} metalness={0.2} />
      </mesh>

      {/* Columbia "C" flag pole */}
      <mesh castShadow position={[11, 5, 8.5]}>
        <cylinderGeometry args={[0.1, 0.1, 8, 6]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.7} />
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
          <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}

      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 7, 0]}>
        <boxGeometry args={[42, 14, 20]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Window grid (front facade) */}
      <WindowGrid
        position={[0, 7.4, -9.6]}
        rows={3}
        cols={10}
        w={1.2}
        h={1.0}
        gapX={3.6}
        gapY={2.6}
      />

      {/* Darker base band */}
      <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[42.5, 2.4, 20.5]} />
        <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* 12 columns across front facade */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} castShadow
          position={[-22 + i * 4, 7, -10.1]}>
          <cylinderGeometry args={[0.48, 0.56, 13.5, 10]} />
          <meshStandardMaterial color="#ddd0b8" roughness={0.6} metalness={0.05} />
        </mesh>
      ))}

      {/* Entablature (horizontal band above columns) */}
      <mesh castShadow position={[0, 14.8, -10]}>
        <boxGeometry args={[43, 1.2, 1.5]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Parapet / flat roof top */}
      <mesh castShadow position={[0, 15.4, 0]}>
        <boxGeometry args={[43, 0.8, 21]} />
        <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Upper cornice band */}
      <mesh castShadow position={[0, 13.8, 0]}>
        <boxGeometry args={[43.6, 0.5, 21.6]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
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
          <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
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
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Main brick tower */}
      <mesh castShadow receiveShadow position={[0, 11, 0]}>
        <boxGeometry args={[20, 22, 16]} />
        <meshStandardMaterial color={COL_BRICK} roughness={0.82} metalness={0.03} />
      </mesh>
      {/* Tall window bands */}
      <WindowGrid
        position={[0, 11.5, 8.2]}
        rows={5}
        cols={4}
        w={1.1}
        h={1.4}
        gapX={3.6}
        gapY={3.2}
      />

      {/* Stone window surrounds (horizontal bands every 3 floors) */}
      {[3, 7, 11, 15, 19].map((y, i) => (
        <mesh key={i} castShadow position={[0, y, -8.1]}>
          <boxGeometry args={[20, 0.5, 0.2]} />
          <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
        </mesh>
      ))}
      {/* Roof cap */}
      <mesh castShadow position={[0, 22.2, 0]}>
        <boxGeometry args={[20.8, 0.6, 16.6]} />
        <meshStandardMaterial color={COL_BRICK_DARK} roughness={0.86} metalness={0.03} />
      </mesh>

      {/* Window columns (vertical stone pilasters) */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={i} castShadow position={[x, 11, -8.08]}>
          <boxGeometry args={[0.6, 22, 0.15]} />
          <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
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
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Setback upper section */}
      <mesh castShadow position={[0, 28, 0]}>
        <boxGeometry args={[14, 10, 12]} />
        <meshStandardMaterial color={COL_BRICK_DARK} roughness={0.86} metalness={0.03} />
      </mesh>
      <mesh castShadow position={[0, 33.5, 0]}>
        <boxGeometry args={[14.5, 0.8, 12.5]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Antenna / flagpole */}
      <mesh castShadow position={[0, 37, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 5, 6]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.7} />
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
        <meshStandardMaterial color={COL_BRICK} roughness={0.82} metalness={0.03} />
      </mesh>
      {/* Stone base band */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[28.5, 2, 20.5]} />
        <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Entry arch */}
      <mesh castShadow position={[0, 5, -10.1]}>
        <boxGeometry args={[6, 8, 0.5]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 9.5, -10.1]}>
        <cylinderGeometry args={[3, 3, 0.5, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Roof parapet */}
      <mesh castShadow position={[0, 10.8, 0]}>
        <boxGeometry args={[29, 1.2, 21]} />
        <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Outdoor basketball court on east side */}
      <group position={[22, 0, 0]}>
        {/* Court surface */}
        <mesh receiveShadow rotation={ROT90} position={[0, 0.04, 0]}>
          <planeGeometry args={[26, 18]} />
          <meshStandardMaterial color="#c8792a" roughness={0.55} metalness={0.02} />
        </mesh>
        {/* Court border */}
        <mesh receiveShadow rotation={ROT90} position={[0, 0.03, 0]}>
          <planeGeometry args={[28, 20]} />
          <meshStandardMaterial color="#8a5214" roughness={0.6} metalness={0.02} />
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
              <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.6} />
            </mesh>
            <mesh castShadow position={[i === 0 ? 0.9 : -0.9, 6, 0]}>
              <boxGeometry args={[0.12, 2, 3]} />
              <meshStandardMaterial color="#d8e8ff" roughness={0.3} metalness={0.05} />
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
              <meshStandardMaterial color="#777777" roughness={0.35} metalness={0.6} />
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
          <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* DR Flag */}
        <WavingFlag y={10.5} />
      </group>

      {/* Baseball corner */}
      <group position={[-18, 0, 14]}>
        <mesh receiveShadow rotation={ROT90} position={[0, 0.04, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#c8a96e" roughness={0.6} metalness={0.02} />
        </mesh>
        {[[0,5],[5,0],[0,-5],[-5,0]].map(([bx,bz],i)=>(
          <mesh key={i} castShadow position={[bx,0.15,bz]}>
            <boxGeometry args={[0.7,0.2,0.7]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.0} />
          </mesh>
        ))}
        <mesh castShadow position={[0,0.2,0]}>
          <cylinderGeometry args={[0.9,1.1,0.4,10]} />
          <meshStandardMaterial color="#b89060" roughness={0.7} metalness={0.02} />
        </mesh>
      </group>

      <pointLight ref={rimGlowRef} position={[22, 8, 0]} color="#ef476f" intensity={2} distance={30} />
      <pointLight position={[0, 8, 0]} color="#ef476f" intensity={2.5} distance={35} />
    </group>
  );
}

function WavingFlag({ y = 0 }) {
  const meshRef = useRef();
  const baseRef = useRef();
  const texture = useMemo(() => createDominicanFlagTexture(), []);
  const FLAG_W = 2.4;
  const FLAG_H = 1.6;

  useEffect(() => {
    const geo = meshRef.current?.geometry;
    if (!geo) return;
    baseRef.current = geo.attributes.position.array.slice();
  }, []);

  useFrame(({ clock }) => {
    const geo = meshRef.current?.geometry;
    const base = baseRef.current;
    if (!geo || !base) return;
    const pos = geo.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const idx = i * 3;
      const x = base[idx];
      const yv = base[idx + 1];
      const k = (x + FLAG_W / 2) / FLAG_W; // 0 at pole edge, 1 at free edge
      const wave = Math.sin(t * 2 + x * 2.2 + yv * 1.3) * 0.06 * (0.2 + 0.8 * k);
      pos.array[idx + 2] = base[idx + 2] + wave;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={meshRef} position={[FLAG_W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[FLAG_W, FLAG_H, 20, 10]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.02}
        />
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
        <meshStandardMaterial color={COL_BRICK} roughness={0.82} metalness={0.03} />
      </mesh>
      {/* Side windows */}
      <WindowGrid
        position={[11.2, 6.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        rows={3}
        cols={3}
        w={1.1}
        h={1.1}
        gapX={3.0}
        gapY={2.4}
      />
      {/* Stone base */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[22.5, 2, 16.5]} />
        <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Glass atrium facade — large window panels */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, 3 + i * 2.5, -8.05]}>
          <boxGeometry args={[18, 2, 0.18]} />
          <meshStandardMaterial color="#a8d8ea" transparent opacity={0.65} roughness={0.15} metalness={0.05} />
        </mesh>
      ))}
      {/* Vertical glass dividers */}
      {[-7,-3.5,0,3.5,7].map((x,i)=>(
        <mesh key={i} position={[x, 6, -8.04]}>
          <boxGeometry args={[0.3, 10, 0.1]} />
          <meshStandardMaterial color="#5ba4cf" roughness={0.5} metalness={0.1} />
        </mesh>
      ))}

      {/* Setback upper floor */}
      <mesh castShadow position={[0, 14, -2]}>
        <boxGeometry args={[16, 3, 12]} />
        <meshStandardMaterial color={COL_BRICK_DARK} roughness={0.86} metalness={0.03} />
      </mesh>
      <mesh castShadow position={[0, 13.2, -2]}>
        <boxGeometry args={[17, 0.8, 13]} />
        <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Comm dish on roof */}
      <mesh castShadow position={[4, 17, -1]}>
        <cylinderGeometry args={[0.2, 0.25, 4, 8]} />
        <meshStandardMaterial color="#888" roughness={0.35} metalness={0.6} />
      </mesh>
      <group position={[4, 20, -1]}>
        <mesh castShadow rotation={[Math.PI / 3.5, 0, 0]}>
          <sphereGeometry args={[2.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color="#1a5f8a" side={THREE.DoubleSide} roughness={0.35} metalness={0.2} />
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
            <meshStandardMaterial color={b.color} roughness={0.8} metalness={0.03} />
          </mesh>
          {/* Roof/parapet cap */}
          <mesh castShadow position={[0, b.h + 0.5, 0]}>
            <boxGeometry args={[b.w + 0.4, 0.8, b.d + 0.4]} />
            <meshStandardMaterial color={b.roof} roughness={0.7} metalness={0.08} />
          </mesh>
          {/* Stone base */}
          <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
            <boxGeometry args={[b.w + 0.4, 1.4, b.d + 0.4]} />
            <meshStandardMaterial color={COL_STONE_DARK} roughness={0.75} metalness={0.05} />
          </mesh>
          {/* Entry columns (2) */}
          {[-2, 2].map((x, j) => (
            <mesh key={j} castShadow position={[x, b.h * 0.4, -b.d / 2 - 0.1]}>
              <cylinderGeometry args={[0.3, 0.36, b.h * 0.8, 8]} />
              <meshStandardMaterial color={COL_STONE} roughness={0.7} metalness={0.05} />
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
