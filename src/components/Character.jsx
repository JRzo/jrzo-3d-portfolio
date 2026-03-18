import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

/* ── Tuning ─────────────────────────────────────────────── */
const WALK_SPEED  = 6.5;
const RUN_SPEED   = 13;
const TURN_SPEED  = 2.6;   // rad/s
const ACCEL       = 18;
const DECEL       = 22;
const JUMP_VEL    = 11;

const CAM_DIST    = 9;
const CAM_HEIGHT  = 5.2;
const CAM_LERP    = 0.075;
const CAM_LOOK_Y  = 1.5;

const WALK_FREQ   = 9;
const SWING_MAX   = 0.62;
const BOB_AMP     = 0.042;

/* ── Pre-allocated scratch objects ──────────────────────── */
const _idealCam   = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _euler      = new THREE.Euler();
const _quat       = new THREE.Quaternion();

const MAT_SKIN    = new THREE.MeshStandardMaterial({ color: '#c6865a', roughness: 0.45, metalness: 0.0 });
const MAT_HAIR    = new THREE.MeshStandardMaterial({ color: '#100707', roughness: 0.7, metalness: 0.05 });
const MAT_HOODIE  = new THREE.MeshStandardMaterial({ color: '#1a2238', roughness: 0.8, metalness: 0.05 });
const MAT_TRIM    = new THREE.MeshStandardMaterial({ color: '#00f5ff', emissive: '#00f5ff', emissiveIntensity: 0.6, roughness: 0.4, metalness: 0.1 });
const MAT_PANTS   = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85, metalness: 0.05 });
const MAT_SHOES   = new THREE.MeshStandardMaterial({ color: '#121214', roughness: 0.6, metalness: 0.1 });
const MAT_SOLE    = new THREE.MeshStandardMaterial({ color: '#e5e7eb', roughness: 0.4, metalness: 0.0 });
const MAT_GLASS   = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.2, metalness: 0.3 });
const MAT_METAL   = new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 0.3, metalness: 0.8 });

export default function Character({ keys, onWalk, onSprintUnlock, onPositionUpdate }) {
  const rbRef      = useRef();
  const groupRef   = useRef();
  const { camera } = useThree();

  const yaw        = useRef(Math.PI);
  const speed      = useRef(0);
  const walkTime   = useRef(0);
  const isWalking  = useRef(false);
  const sprintFired = useRef(false);
  const canJump    = useRef(true);
  const camPos     = useRef(new THREE.Vector3(0, CAM_HEIGHT, CAM_DIST));

  useFrame((_, delta) => {
    if (!rbRef.current) return;
    const dt = Math.min(delta, 0.05);
    const held = keys.current;

    const fwd   = held.has('KeyW') || held.has('ArrowUp');
    const back  = held.has('KeyS') || held.has('ArrowDown');
    const left  = held.has('KeyA') || held.has('ArrowLeft');
    const right = held.has('KeyD') || held.has('ArrowRight');
    const run   = held.has('ShiftLeft') || held.has('ShiftRight');
    const jump  = held.has('Space');

    const moving = fwd || back;

    /* Turn */
    if (left)  yaw.current += TURN_SPEED * dt;
    if (right) yaw.current -= TURN_SPEED * dt;

    /* Acceleration / deceleration */
    const maxSpd = run ? RUN_SPEED : WALK_SPEED;
    if (fwd)  speed.current = Math.min(speed.current + ACCEL * dt,  maxSpd);
    if (back) speed.current = Math.max(speed.current - ACCEL * dt, -maxSpd * 0.55);
    if (!moving) {
      const sign = speed.current >= 0 ? 1 : -1;
      speed.current = sign * Math.max(Math.abs(speed.current) - DECEL * dt, 0);
    }

    /* Walk leading-edge event */
    if (moving && !isWalking.current) { isWalking.current = true; onWalk?.(); }
    else if (!moving) isWalking.current = false;

    /* Sprint achievement */
    if (!sprintFired.current && Math.abs(speed.current) > RUN_SPEED * 0.9) {
      sprintFired.current = true;
      onSprintUnlock?.();
    }

    /* Jump (cooldown-based ground check) */
    const curVel = rbRef.current.linvel();
    if (jump && canJump.current) {
      canJump.current = false;
      rbRef.current.setLinvel({ x: curVel.x, y: JUMP_VEL, z: curVel.z }, true);
      setTimeout(() => { canJump.current = true; }, 700);
    }

    /* Apply XZ velocity */
    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);
    rbRef.current.setLinvel(
      { x: sinY * speed.current, y: rbRef.current.linvel().y, z: cosY * speed.current },
      true
    );

    /* Lock rotation (no tumbling) */
    _euler.set(0, yaw.current, 0);
    _quat.setFromEuler(_euler);
    rbRef.current.setRotation(_quat, true);

    /* Sync visual mesh to physics */
    const pos = rbRef.current.translation();
    if (groupRef.current) {
      groupRef.current.position.set(pos.x, pos.y - 0.61, pos.z);
      groupRef.current.rotation.y = yaw.current;
    }

    /* Advance walk-animation clock */
    if (Math.abs(speed.current) > 0.08) {
      walkTime.current += dt * Math.abs(speed.current) / WALK_SPEED;
    }

    /* Zone + minimap position */
    onPositionUpdate?.({ x: pos.x, z: pos.z });

    /* Chase camera */
    _idealCam.set(
      pos.x - sinY * CAM_DIST,
      pos.y + CAM_HEIGHT,
      pos.z - cosY * CAM_DIST,
    );
    camPos.current.lerp(_idealCam, CAM_LERP);
    _lookTarget.set(pos.x, pos.y + CAM_LOOK_Y, pos.z);
    camera.position.copy(camPos.current);
    camera.lookAt(_lookTarget);
  });

  return (
    <>
      <RigidBody
        ref={rbRef}
        colliders={false}
        mass={1}
        linearDamping={0}
        angularDamping={100}
        lockRotations
        position={[0, 2, 0]}
        gravityScale={2.5}
      >
        <CapsuleCollider args={[0.45, 0.38]} />
      </RigidBody>

      <group ref={groupRef}>
        <CharacterMesh walkTime={walkTime} speed={speed} />
      </group>
    </>
  );
}

export function StaticCharacter() {
  const walkTime = useRef(0);
  const speed = useRef(0.2);
  const rootRef = useRef();
  const { camera } = useThree();

  useFrame((_, delta) => {
    walkTime.current += delta * 0.5;
    if (rootRef.current) rootRef.current.position.y = Math.sin(walkTime.current) * 0.02;
    camera.position.set(0, 8, 16);
    camera.lookAt(0, 1.5, 0);
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      <CharacterMesh walkTime={walkTime} speed={speed} />
    </group>
  );
}

/* ── Animated character mesh ─────────────────────────────── */
function CharacterMesh({ walkTime, speed }) {
  const rootRef     = useRef();
  const headRef     = useRef();
  const leftArmRef  = useRef();
  const rightArmRef = useRef();
  const leftLegRef  = useRef();
  const rightLegRef = useRef();

  useFrame(() => {
    const t     = walkTime.current;
    const spd   = Math.abs(speed.current);
    const blend = Math.min(spd / WALK_SPEED, 1.4);
    const swing = Math.sin(t * WALK_FREQ) * SWING_MAX * Math.min(blend, 1);

    /* Vertical body bob (two steps per walk cycle) */
    if (rootRef.current)
      rootRef.current.position.y = Math.abs(Math.sin(t * WALK_FREQ)) * BOB_AMP * blend;

    /* Subtle head sway */
    if (headRef.current)
      headRef.current.rotation.z = Math.sin(t * WALK_FREQ * 0.5) * 0.025 * blend;

    /* Arms swing opposite phase to legs */
    if (leftArmRef.current)  leftArmRef.current.rotation.x  =  swing * 0.72;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing * 0.72;

    /* Leg swing */
    if (leftLegRef.current)  leftLegRef.current.rotation.x  = -swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x  =  swing;
  });

  return (
    <group ref={rootRef}>

      {/* ── HEAD ───────────────────────────────────────── */}
      <group ref={headRef} position={[0, 1.62, 0]}>
        {/* Face */}
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.36, 0.35]} />
          <primitive object={MAT_SKIN} attach="material" />
        </mesh>
        {/* Hair cap */}
        <mesh castShadow position={[0, 0.19, -0.02]}>
          <boxGeometry args={[0.36, 0.12, 0.32]} />
          <primitive object={MAT_HAIR} attach="material" />
        </mesh>
        {/* Hair front fade */}
        <mesh position={[0, 0.18, 0.14]}>
          <boxGeometry args={[0.26, 0.08, 0.1]} />
          <primitive object={MAT_HAIR} attach="material" />
        </mesh>
        {/* Short beard */}
        <mesh position={[0, -0.05, 0.16]}>
          <boxGeometry args={[0.22, 0.12, 0.05]} />
          <primitive object={MAT_HAIR} attach="material" />
        </mesh>
        {/* Glasses */}
        <mesh position={[0, 0.03, 0.19]}>
          <boxGeometry args={[0.26, 0.06, 0.02]} />
          <primitive object={MAT_GLASS} attach="material" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.088, 0.04, 0.178]}>
          <boxGeometry args={[0.065, 0.06, 0.01]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[0.088, 0.04, 0.178]}>
          <boxGeometry args={[0.065, 0.06, 0.01]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.076, 0.058, 0.179]}>
          <boxGeometry args={[0.018, 0.018, 0.01]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        <mesh position={[0.1, 0.058, 0.179]}>
          <boxGeometry args={[0.018, 0.018, 0.01]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        {/* Headphones */}
        <mesh position={[0.2, 0.03, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 10]} />
          <primitive object={MAT_METAL} attach="material" />
        </mesh>
        <mesh position={[-0.2, 0.03, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 10]} />
          <primitive object={MAT_METAL} attach="material" />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.2, 0.02, 8, 18, Math.PI]} />
          <primitive object={MAT_METAL} attach="material" />
        </mesh>
      </group>

      {/* ── NECK ─────────────────────────────────────── */}
      <mesh position={[0, 1.39, 0]} castShadow>
        <cylinderGeometry args={[0.088, 0.1, 0.13, 7]} />
        <primitive object={MAT_SKIN} attach="material" />
      </mesh>

      {/* ── TORSO ────────────────────────────────────── */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <boxGeometry args={[0.48, 0.65, 0.27]} />
        <primitive object={MAT_HOODIE} attach="material" />
      </mesh>
      {/* Cyan jacket zip line */}
      <mesh position={[0, 1.0, 0.138]}>
        <boxGeometry args={[0.055, 0.52, 0.01]} />
        <primitive object={MAT_TRIM} attach="material" />
      </mesh>
      {/* Left shoulder trim */}
      <mesh position={[0.248, 1.27, 0]}>
        <boxGeometry args={[0.01, 0.046, 0.28]} />
        <primitive object={MAT_TRIM} attach="material" />
      </mesh>
      {/* Right shoulder trim */}
      <mesh position={[-0.248, 1.27, 0]}>
        <boxGeometry args={[0.01, 0.046, 0.28]} />
        <primitive object={MAT_TRIM} attach="material" />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.22, -0.12]}>
        <sphereGeometry args={[0.26, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <primitive object={MAT_HOODIE} attach="material" />
      </mesh>
      {/* Backpack */}
      <mesh position={[0, 0.98, -0.18]} castShadow>
        <boxGeometry args={[0.34, 0.46, 0.18]} />
        <primitive object={MAT_PANTS} attach="material" />
      </mesh>

      {/* ── LEFT ARM ─────────────────────────────────── */}
      <group ref={leftArmRef} position={[0.315, 1.26, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0.07, -0.18, 0]}>
          <boxGeometry args={[0.145, 0.37, 0.165]} />
          <primitive object={MAT_HOODIE} attach="material" />
        </mesh>
        {/* Forearm */}
        <mesh castShadow position={[0.06, -0.48, 0]}>
          <boxGeometry args={[0.118, 0.27, 0.135]} />
          <primitive object={MAT_HOODIE} attach="material" />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0.05, -0.65, 0]}>
          <boxGeometry args={[0.115, 0.12, 0.115]} />
          <primitive object={MAT_SKIN} attach="material" />
        </mesh>
      </group>

      {/* ── RIGHT ARM ────────────────────────────────── */}
      <group ref={rightArmRef} position={[-0.315, 1.26, 0]}>
        <mesh castShadow position={[-0.07, -0.18, 0]}>
          <boxGeometry args={[0.145, 0.37, 0.165]} />
          <primitive object={MAT_HOODIE} attach="material" />
        </mesh>
        <mesh castShadow position={[-0.06, -0.48, 0]}>
          <boxGeometry args={[0.118, 0.27, 0.135]} />
          <primitive object={MAT_HOODIE} attach="material" />
        </mesh>
        <mesh castShadow position={[-0.05, -0.65, 0]}>
          <boxGeometry args={[0.115, 0.12, 0.115]} />
          <primitive object={MAT_SKIN} attach="material" />
        </mesh>
      </group>

      {/* ── HIPS ─────────────────────────────────────── */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.44, 0.2, 0.26]} />
        <primitive object={MAT_PANTS} attach="material" />
      </mesh>

      {/* ── LEFT LEG ─────────────────────────────────── */}
      <group ref={leftLegRef} position={[0.135, 0.54, 0]}>
        {/* Thigh */}
        <mesh castShadow position={[0, -0.19, 0]}>
          <boxGeometry args={[0.185, 0.39, 0.2]} />
          <primitive object={MAT_HOODIE} attach="material" />
        </mesh>
        {/* Shin */}
        <mesh castShadow position={[0, -0.5, 0.01]}>
          <boxGeometry args={[0.155, 0.28, 0.175]} />
          <primitive object={MAT_PANTS} attach="material" />
        </mesh>
        {/* Shoe */}
        <mesh castShadow position={[0.01, -0.7, 0.05]}>
          <boxGeometry args={[0.165, 0.115, 0.27]} />
          <primitive object={MAT_SHOES} attach="material" />
        </mesh>
        {/* Sole */}
        <mesh position={[0.01, -0.762, 0.05]}>
          <boxGeometry args={[0.17, 0.035, 0.275]} />
          <primitive object={MAT_SOLE} attach="material" />
        </mesh>
      </group>

      {/* ── RIGHT LEG ────────────────────────────────── */}
      <group ref={rightLegRef} position={[-0.135, 0.54, 0]}>
        <mesh castShadow position={[0, -0.19, 0]}>
          <boxGeometry args={[0.185, 0.39, 0.2]} />
          <primitive object={MAT_HOODIE} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0.01]}>
          <boxGeometry args={[0.155, 0.28, 0.175]} />
          <primitive object={MAT_PANTS} attach="material" />
        </mesh>
        <mesh castShadow position={[-0.01, -0.7, 0.05]}>
          <boxGeometry args={[0.165, 0.115, 0.27]} />
          <primitive object={MAT_SHOES} attach="material" />
        </mesh>
        <mesh position={[-0.01, -0.762, 0.05]}>
          <boxGeometry args={[0.17, 0.035, 0.275]} />
          <primitive object={MAT_SOLE} attach="material" />
        </mesh>
      </group>

    </group>
  );
}
