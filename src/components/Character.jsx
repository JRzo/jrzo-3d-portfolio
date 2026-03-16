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
        linearDamping={0.7}
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
          <meshLambertMaterial color="#c9845c" />
        </mesh>
        {/* Hair cap */}
        <mesh castShadow position={[0, 0.19, -0.02]}>
          <boxGeometry args={[0.36, 0.12, 0.32]} />
          <meshLambertMaterial color="#0d0604" />
        </mesh>
        {/* Hair front fade */}
        <mesh position={[0, 0.18, 0.14]}>
          <boxGeometry args={[0.26, 0.08, 0.1]} />
          <meshLambertMaterial color="#180d0a" />
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
      </group>

      {/* ── NECK ─────────────────────────────────────── */}
      <mesh position={[0, 1.39, 0]} castShadow>
        <cylinderGeometry args={[0.088, 0.1, 0.13, 7]} />
        <meshLambertMaterial color="#c9845c" />
      </mesh>

      {/* ── TORSO ────────────────────────────────────── */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <boxGeometry args={[0.48, 0.65, 0.27]} />
        <meshLambertMaterial color="#1a1a2e" />
      </mesh>
      {/* Cyan jacket zip line */}
      <mesh position={[0, 1.0, 0.138]}>
        <boxGeometry args={[0.055, 0.52, 0.01]} />
        <meshBasicMaterial color="#00f5ff" />
      </mesh>
      {/* Left shoulder trim */}
      <mesh position={[0.248, 1.27, 0]}>
        <boxGeometry args={[0.01, 0.046, 0.28]} />
        <meshBasicMaterial color="#bf5fff" />
      </mesh>
      {/* Right shoulder trim */}
      <mesh position={[-0.248, 1.27, 0]}>
        <boxGeometry args={[0.01, 0.046, 0.28]} />
        <meshBasicMaterial color="#bf5fff" />
      </mesh>

      {/* ── LEFT ARM ─────────────────────────────────── */}
      <group ref={leftArmRef} position={[0.315, 1.26, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0.07, -0.18, 0]}>
          <boxGeometry args={[0.145, 0.37, 0.165]} />
          <meshLambertMaterial color="#111122" />
        </mesh>
        {/* Forearm */}
        <mesh castShadow position={[0.06, -0.48, 0]}>
          <boxGeometry args={[0.118, 0.27, 0.135]} />
          <meshLambertMaterial color="#1a1a2e" />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0.05, -0.65, 0]}>
          <boxGeometry args={[0.115, 0.12, 0.115]} />
          <meshLambertMaterial color="#c9845c" />
        </mesh>
      </group>

      {/* ── RIGHT ARM ────────────────────────────────── */}
      <group ref={rightArmRef} position={[-0.315, 1.26, 0]}>
        <mesh castShadow position={[-0.07, -0.18, 0]}>
          <boxGeometry args={[0.145, 0.37, 0.165]} />
          <meshLambertMaterial color="#111122" />
        </mesh>
        <mesh castShadow position={[-0.06, -0.48, 0]}>
          <boxGeometry args={[0.118, 0.27, 0.135]} />
          <meshLambertMaterial color="#1a1a2e" />
        </mesh>
        <mesh castShadow position={[-0.05, -0.65, 0]}>
          <boxGeometry args={[0.115, 0.12, 0.115]} />
          <meshLambertMaterial color="#c9845c" />
        </mesh>
      </group>

      {/* ── HIPS ─────────────────────────────────────── */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.44, 0.2, 0.26]} />
        <meshLambertMaterial color="#0a0a1a" />
      </mesh>

      {/* ── LEFT LEG ─────────────────────────────────── */}
      <group ref={leftLegRef} position={[0.135, 0.54, 0]}>
        {/* Thigh */}
        <mesh castShadow position={[0, -0.19, 0]}>
          <boxGeometry args={[0.185, 0.39, 0.2]} />
          <meshLambertMaterial color="#1a1a2e" />
        </mesh>
        {/* Shin */}
        <mesh castShadow position={[0, -0.5, 0.01]}>
          <boxGeometry args={[0.155, 0.28, 0.175]} />
          <meshLambertMaterial color="#13132a" />
        </mesh>
        {/* Shoe */}
        <mesh castShadow position={[0.01, -0.7, 0.05]}>
          <boxGeometry args={[0.165, 0.115, 0.27]} />
          <meshLambertMaterial color="#111" />
        </mesh>
        {/* Sole */}
        <mesh position={[0.01, -0.762, 0.05]}>
          <boxGeometry args={[0.17, 0.035, 0.275]} />
          <meshBasicMaterial color="#1e1e1e" />
        </mesh>
      </group>

      {/* ── RIGHT LEG ────────────────────────────────── */}
      <group ref={rightLegRef} position={[-0.135, 0.54, 0]}>
        <mesh castShadow position={[0, -0.19, 0]}>
          <boxGeometry args={[0.185, 0.39, 0.2]} />
          <meshLambertMaterial color="#1a1a2e" />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0.01]}>
          <boxGeometry args={[0.155, 0.28, 0.175]} />
          <meshLambertMaterial color="#13132a" />
        </mesh>
        <mesh castShadow position={[-0.01, -0.7, 0.05]}>
          <boxGeometry args={[0.165, 0.115, 0.27]} />
          <meshLambertMaterial color="#111" />
        </mesh>
        <mesh position={[-0.01, -0.762, 0.05]}>
          <boxGeometry args={[0.17, 0.035, 0.275]} />
          <meshBasicMaterial color="#1e1e1e" />
        </mesh>
      </group>

    </group>
  );
}
