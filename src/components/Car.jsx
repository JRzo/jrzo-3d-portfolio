import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

/* ── Tuning constants ──────────────────────────────────────── */
const ACCEL     = 18;
const BRAKE     = 28;
const MAX_SPEED = 22;
const STEER     = 2.2;
const FRICTION  = 0.88;

const CAM_HEIGHT   = 5.5;
const CAM_DISTANCE = 11;
const CAM_LERP     = 0.07;
const CAM_LOOK_Y   = 1.2;

const WHEEL_OFFSETS = [
  [  0.72, -0.22,  1.18 ],
  [ -0.72, -0.22,  1.18 ],
  [  0.72, -0.22, -1.18 ],
  [ -0.72, -0.22, -1.18 ],
];

/* ── Pre-allocated scratch objects — never recreated per frame ── */
// These live at module scope so they're shared across all Car instances
// (there is only one car, so this is safe).
const _quat       = new THREE.Quaternion();
const _euler      = new THREE.Euler();
const _idealCam   = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export default function Car({ keys, onDrive, onSpeedDemon, onPositionUpdate }) {
  const rbRef   = useRef();
  const meshRef = useRef();
  const { camera } = useThree();

  // Car state — stored as refs so useFrame reads them without re-renders
  const yaw             = useRef(Math.PI);
  const speed           = useRef(0);
  const isDriving       = useRef(false);       // tracks whether we're actively pressing drive keys
  const speedDemonFired = useRef(false);
  const camPos          = useRef(new THREE.Vector3(0, CAM_HEIGHT, CAM_DISTANCE));

  useFrame((_, delta) => {
    if (!rbRef.current) return;

    const dt   = Math.min(delta, 0.05);
    const held = keys.current;
    const fwd  = held.has('KeyW') || held.has('ArrowUp');
    const back = held.has('KeyS') || held.has('ArrowDown');
    const left = held.has('KeyA') || held.has('ArrowLeft');
    const right = held.has('KeyD') || held.has('ArrowRight');
    const moving = fwd || back;

    // Fire onDrive only on the leading edge (key just pressed, not every frame)
    if (moving && !isDriving.current) {
      isDriving.current = true;
      onDrive?.();
    } else if (!moving) {
      isDriving.current = false;
    }

    // Steering — only when moving so reversing steers intuitively
    if (moving) {
      const dir = fwd ? 1 : -1;
      if (left)  yaw.current += STEER * dt * dir;
      if (right) yaw.current -= STEER * dt * dir;
    }

    // Acceleration / braking / friction
    if (fwd)  speed.current = Math.min(speed.current + ACCEL * dt, MAX_SPEED);
    if (back) speed.current = Math.max(speed.current - BRAKE * dt, -MAX_SPEED * 0.5);
    if (!moving) speed.current *= Math.pow(FRICTION, dt * 60);

    // Speed-demon achievement — only fires once
    if (!speedDemonFired.current && Math.abs(speed.current) > MAX_SPEED * 0.95) {
      speedDemonFired.current = true;
      onSpeedDemon?.();
    }

    // Apply velocity to rigid body — reuse scratch Euler/Quaternion
    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);
    const curVel = rbRef.current.linvel();
    rbRef.current.setLinvel({ x: sinY * speed.current, y: curVel.y, z: cosY * speed.current }, true);

    // Rotation — reuse pre-allocated objects (no GC)
    _euler.set(0, yaw.current, 0);
    _quat.setFromEuler(_euler);
    rbRef.current.setRotation(_quat, true);

    // Sync visual mesh to physics position
    const pos = rbRef.current.translation();
    if (meshRef.current) {
      meshRef.current.position.set(pos.x, pos.y, pos.z);
      meshRef.current.rotation.y = yaw.current;
    }

    // Report position for zone detection + minimap
    onPositionUpdate?.({ x: pos.x, z: pos.z });

    // Chase camera — reuse scratch Vector3 (no GC)
    _idealCam.set(
      pos.x - sinY * CAM_DISTANCE,
      pos.y + CAM_HEIGHT,
      pos.z - cosY * CAM_DISTANCE,
    );
    camPos.current.lerp(_idealCam, CAM_LERP);
    _lookTarget.set(pos.x, pos.y + CAM_LOOK_Y, pos.z);
    camera.position.copy(camPos.current);
    camera.lookAt(_lookTarget);
  });

  return (
    <>
      {/* Physics rigid body — invisible, drives physics world */}
      <RigidBody
        ref={rbRef}
        colliders="cuboid"
        mass={1}
        linearDamping={0.5}
        angularDamping={100}
        lockRotations
        position={[0, 1, 0]}
        gravityScale={1}
      >
        <mesh visible={false}>
          <boxGeometry args={[1.44, 0.6, 2.36]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>

      {/* Visual mesh — manually synced to physics in useFrame */}
      <group ref={meshRef} position={[0, 1, 0]}>
        <CarBody />
      </group>
    </>
  );
}

/* ── Car visual components — defined outside to prevent recreation ── */
function CarBody() {
  return (
    <group>
      {/* Body */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.4, 0.45, 2.3]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cabin */}
      <mesh castShadow position={[0, 0.72, -0.1]}>
        <boxGeometry args={[1.1, 0.38, 1.3]} />
        <meshStandardMaterial color="#0f0f1a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.72, 0.56]}>
        <boxGeometry args={[1.0, 0.34, 0.05]} />
        <meshStandardMaterial color="#00f5ff" transparent opacity={0.35} metalness={1} roughness={0} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.72, -0.76]}>
        <boxGeometry args={[1.0, 0.30, 0.05]} />
        <meshStandardMaterial color="#00f5ff" transparent opacity={0.25} metalness={1} roughness={0} />
      </mesh>

      {/* Headlights */}
      {[0.45, -0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.32, 1.16]}>
          <boxGeometry args={[0.22, 0.1, 0.04]} />
          <meshStandardMaterial color="#ffffff" emissive="#00f5ff" emissiveIntensity={3} />
        </mesh>
      ))}
      <pointLight position={[0, 0.32, 1.3]} color="#00f5ff" intensity={5} distance={10} />

      {/* Tail lights */}
      {[0.45, -0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.32, -1.16]}>
          <boxGeometry args={[0.22, 0.1, 0.04]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
        </mesh>
      ))}

      {/* Underglow */}
      <pointLight position={[0, -0.1, 0]} color="#bf5fff" intensity={3} distance={3} />

      {/* Wheels */}
      {WHEEL_OFFSETS.map((w, i) => (
        <Wheel key={i} position={w} />
      ))}
    </group>
  );
}

function Wheel({ position }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 12]} />
        <meshStandardMaterial color="#111" metalness={0.3} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}
