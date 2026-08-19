'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useTheme } from '@/providers/ThemeProvider';
import * as THREE from 'three';

// ─── Color Palette ──────────────────────────────────────────
const primaryWhite = '#f7f9fb';
const darkVisor = '#10151d';
const eyeGlow = '#38bdf8';
const accentBlue = '#123f78';
const metalGray = '#d5e1e4';
const darkMetal = '#234a73';

// ─── Material Configs ───────────────────────────────────────
const bodyMatProps = { color: primaryWhite, metalness: 0.12, roughness: 0.35 };
const eyeMatProps = { color: eyeGlow, emissive: eyeGlow, emissiveIntensity: 2.8, transparent: true, opacity: 0.95 };

// ═══════════════════════════════════════════════════════════
// ENHANCED ROBOT - PREMIUM DESIGN
// ═══════════════════════════════════════════════════════════
function EnhancedRobot({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftAntRef = useRef<THREE.Group>(null);
  const rightAntRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  // Physics refs
  const velocityRef = useRef({ x: 0, y: 0 });
  const rotationVelRef = useRef({ x: 0, y: 0 });
  const eyeLookRef = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    if (groupRef.current) {
      // Cursor coordinates are screen-oriented: normalizedY is positive downward.
      // Invert it for Three.js so the robot follows the cursor naturally.
      const targetPosX = mouseX * 2.0;
      const targetPosY = -mouseY * 1.2;
      const posSpring = 5.5;
      const posDamping = 0.75;

      const accX = (targetPosX - groupRef.current.position.x) * posSpring;
      const accY = (targetPosY - groupRef.current.position.y) * posSpring;

      velocityRef.current.x = (velocityRef.current.x + accX * dt) * posDamping;
      velocityRef.current.y = (velocityRef.current.y + accY * dt) * posDamping;

      groupRef.current.position.x += velocityRef.current.x * dt;
      groupRef.current.position.y += velocityRef.current.y * dt;

      // ── ENHANCED BODY ROTATION ──
      const targetRotX = mouseY * 0.45;
      const targetRotZ = mouseX * 0.35;
      const rotSpring = 4.5;
      const rotDamping = 0.78;

      const rotAccX = (targetRotX - groupRef.current.rotation.x) * rotSpring;
      const rotAccZ = (targetRotZ - groupRef.current.rotation.z) * rotSpring;

      rotationVelRef.current.x = (rotationVelRef.current.x + rotAccX * dt) * rotDamping;
      rotationVelRef.current.y = (rotationVelRef.current.y + rotAccZ * dt) * rotDamping;

      groupRef.current.rotation.x += rotationVelRef.current.x * dt;
      groupRef.current.rotation.z += rotationVelRef.current.y * dt;

      // ── BREATHING ANIMATION ──
      if (bodyRef.current) {
        bodyRef.current.scale.y = 1.0 + Math.sin(t * 1.3) * 0.04;
        bodyRef.current.position.y = Math.sin(t * 1.3) * 0.03;
      }
    }

    // ── HEAD TILT (responsive to vertical cursor) ──
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        mouseX * 0.2,
        0.12
      );
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        mouseY * 0.1,
        0.1
      );
    }

    // ── VISOR TILT (follows vertical cursor) ──
    if (visorRef.current) {
      visorRef.current.rotation.x = THREE.MathUtils.lerp(
        visorRef.current.rotation.x,
        -mouseY * 0.15,
        0.08
      );
    }

    // ── EYES PUPIL TRACKING ──
    const pupilOffsetX = 0.12;
    const pupilOffsetY = 0.1;
    eyeLookRef.current.x = THREE.MathUtils.lerp(eyeLookRef.current.x, mouseX * pupilOffsetX, 0.15);
    eyeLookRef.current.y = THREE.MathUtils.lerp(eyeLookRef.current.y, -mouseY * pupilOffsetY, 0.15);

    if (leftEyeRef.current && rightEyeRef.current) {
      const eyePulse = 2.3 + Math.sin(t * 2.2) * 1.0;
      (leftEyeRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = eyePulse;
      (rightEyeRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = eyePulse;
    }

    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = eyeLookRef.current.x * 0.35;
      leftPupilRef.current.position.y = eyeLookRef.current.y * 0.25;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = -eyeLookRef.current.x * 0.35;
      rightPupilRef.current.position.y = eyeLookRef.current.y * 0.25;
    }

    // ── ANTENNA DYNAMICS (enhanced tracking) ──
    if (leftAntRef.current) {
      const wobble = Math.sin(t * 2.2) * 0.12;
      const tilt = mouseY * 0.25;
      leftAntRef.current.rotation.z = 0.45 + Math.sin(t * 1.8 - mouseX) * 0.2 + tilt;
      leftAntRef.current.rotation.x = wobble + Math.sin(t * 2.8) * 0.08;
      leftAntRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
    if (rightAntRef.current) {
      const wobble = Math.sin(t * 2.2 + Math.PI) * 0.12;
      const tilt = mouseY * 0.25;
      rightAntRef.current.rotation.z = -0.45 + Math.sin(t * 1.8 + mouseX) * 0.2 + tilt;
      rightAntRef.current.rotation.x = wobble + Math.sin(t * 2.8 + Math.PI) * 0.08;
      rightAntRef.current.position.y = Math.sin(t * 1.5 + Math.PI) * 0.05;
    }

    // ── ARM ANIMATION (more expressive) ──
    if (leftArmRef.current) {
      const swing = Math.sin(t * 1.5) * 0.5;
      const mouseReact = -mouseX * 0.2;
      const upDown = -mouseY * 0.15;
      leftArmRef.current.rotation.z = -0.4 + swing + mouseReact;
      leftArmRef.current.rotation.x = upDown;
      leftArmRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    }
    if (rightArmRef.current) {
      const swing = Math.sin(t * 1.5 + Math.PI) * 0.5;
      const mouseReact = -mouseX * 0.2;
      const upDown = -mouseY * 0.15;
      rightArmRef.current.rotation.z = 0.4 + swing + mouseReact;
      rightArmRef.current.rotation.x = upDown;
      rightArmRef.current.position.y = Math.sin(t * 1.5 + Math.PI) * 0.08;
    }

    // ── LEG BOUNCE (responsive to movement) ──
    if (leftLegRef.current) {
      const bounce = Math.sin(t * 1.8) * 0.06;
      const shift = -mouseX * 0.08;
      leftLegRef.current.position.y = bounce + shift;
      leftLegRef.current.scale.y = 1.0 + Math.sin(t * 2.0) * 0.05;
    }
    if (rightLegRef.current) {
      const bounce = Math.sin(t * 1.8 + Math.PI) * 0.06;
      const shift = -mouseX * 0.08;
      rightLegRef.current.position.y = bounce - shift;
      rightLegRef.current.scale.y = 1.0 + Math.sin(t * 2.0 + Math.PI) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef} position={[0, 0, 0]}>
        {/* Rounded toy-like torso */}
        <mesh scale={[0.88, 1.12, 0.72]}>
          <sphereGeometry args={[1.1, 72, 72]} />
          <meshStandardMaterial {...bodyMatProps} />
        </mesh>

        {/* Soft ceramic highlight */}
        <mesh position={[-0.38, 0.42, 0.62]} scale={[0.28, 0.18, 0.05]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.16} transparent opacity={0.6} />
        </mesh>

        {/* Teal bib-like chest panel from the reference */}
        <RoundedBox args={[0.58, 0.72, 0.08]} radius={0.18} smoothness={6} position={[0, 0.38, 0.70]}>
          <meshStandardMaterial color={accentBlue} roughness={0.28} metalness={0.05} />
        </RoundedBox>
      </group>

      {/* ── LARGE ROUNDED HEAD SHELL ── */}
      <group ref={headRef} position={[0, 0.28, 0]}>
        <RoundedBox args={[1.92, 1.55, 1.12]} radius={0.48} smoothness={10} position={[0, 0.05, 0.08]}>
          <meshStandardMaterial color={primaryWhite} roughness={0.25} metalness={0.04} />
        </RoundedBox>

        {/* Light metallic bezel behind the display */}
        <RoundedBox args={[1.82, 0.98, 0.08]} radius={0.28} smoothness={8} position={[0, -0.03, 0.70]}>
          <meshStandardMaterial color="#edf3f4" metalness={0.18} roughness={0.22} />
        </RoundedBox>

        {/* Deep glossy black rounded visor */}
        <RoundedBox ref={visorRef} args={[1.66, 0.76, 0.10]} radius={0.20} smoothness={8} position={[0, 0, 0.80]}>
          <meshPhysicalMaterial
            color="#030611"
            metalness={0.5}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={1.6}
          />
        </RoundedBox>

        {/* Small diagonal visor reflection */}
        <mesh position={[-0.48, 0.24, 0.865]} rotation={[0, 0, -0.18]} scale={[0.28, 0.035, 0.01]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>

        {/* LEFT REFERENCE EYE: cyan rounded vertical pill with white inner glow */}
        <mesh ref={leftEyeRef} position={[-0.36, 0.08, 0.88]} scale={[0.78, 1.55, 0.20]}>
          <capsuleGeometry args={[0.105, 0.14, 16, 28]} />
          <meshStandardMaterial {...eyeMatProps} />
        </mesh>
        <mesh ref={leftPupilRef} position={[-0.36, 0.08, 0.935]} scale={[0.42, 0.78, 0.12]}>
          <capsuleGeometry args={[0.075, 0.10, 12, 24]} />
          <meshStandardMaterial color="#f4ffff" emissive="#dfffff" emissiveIntensity={3.2} />
        </mesh>

        {/* RIGHT REFERENCE EYE */}
        <mesh ref={rightEyeRef} position={[0.36, 0.08, 0.88]} scale={[0.78, 1.55, 0.20]}>
          <capsuleGeometry args={[0.105, 0.14, 16, 28]} />
          <meshStandardMaterial {...eyeMatProps} />
        </mesh>
        <mesh ref={rightPupilRef} position={[0.36, 0.08, 0.935]} scale={[0.42, 0.78, 0.12]}>
          <capsuleGeometry args={[0.075, 0.10, 12, 24]} />
          <meshStandardMaterial color="#f4ffff" emissive="#dfffff" emissiveIntensity={3.2} />
        </mesh>

        {/* Friendly smiling mouth */}
        <mesh position={[0, -0.20, 0.90]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.21, 0.028, 12, 36, Math.PI]} />
          <meshStandardMaterial color={eyeGlow} emissive={eyeGlow} emissiveIntensity={2.5} />
        </mesh>
        <mesh position={[0, -0.235, 0.90]} scale={[0.42, 0.10, 0.08]}>
          <sphereGeometry args={[0.12, 20, 12]} />
          <meshStandardMaterial color={eyeGlow} emissive={eyeGlow} emissiveIntensity={1.8} />
        </mesh>

        {/* Eye glow lights */}
        <pointLight position={[-0.36, 0.08, 1.0]} color={eyeGlow} intensity={0.45} distance={1.5} />
        <pointLight position={[0.36, 0.08, 1.0]} color={eyeGlow} intensity={0.45} distance={1.5} />
      </group>

      {/* ── LEFT REFERENCE ANTENNA ── */}
      <group ref={leftAntRef} position={[-0.5, 1.1, 0]}>
        {/* White ceramic mounting collar */}
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, -0.45]}>
          <cylinderGeometry args={[0.13, 0.16, 0.16, 24]} />
          <meshStandardMaterial color="#f7fafc" metalness={0.08} roughness={0.24} />
        </mesh>
        {/* Thick rounded electric-blue shaft */}
        <mesh position={[0, 0.39, 0]}>
          <capsuleGeometry args={[0.075, 0.55, 12, 24]} />
          <meshStandardMaterial color="#08b9f4" emissive="#008ed0" emissiveIntensity={0.35} metalness={0.2} roughness={0.22} />
        </mesh>
        {/* Bright shaft highlight */}
        <mesh position={[-0.025, 0.40, 0.07]} scale={[0.18, 0.78, 0.10]}>
          <capsuleGeometry args={[0.025, 0.25, 8, 16]} />
          <meshBasicMaterial color="#b8f7ff" transparent opacity={0.82} />
        </mesh>
        {/* Rounded glowing tip */}
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.095, 20, 20]} />
          <meshStandardMaterial color="#d7ecff" emissive={accentBlue} emissiveIntensity={1.8} />
        </mesh>
        <pointLight position={[0, 0.78, 0]} color={accentBlue} intensity={0.55} distance={1.2} />
      </group>

      {/* ── RIGHT REFERENCE ANTENNA ── */}
      <group ref={rightAntRef} position={[0.5, 1.1, 0]}>
        {/* White ceramic mounting collar */}
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0.45]}>
          <cylinderGeometry args={[0.13, 0.16, 0.16, 24]} />
          <meshStandardMaterial color="#f7fafc" metalness={0.08} roughness={0.24} />
        </mesh>
        {/* Thick rounded electric-blue shaft */}
        <mesh position={[0, 0.39, 0]}>
          <capsuleGeometry args={[0.075, 0.55, 12, 24]} />
          <meshStandardMaterial color="#08b9f4" emissive="#008ed0" emissiveIntensity={0.35} metalness={0.2} roughness={0.22} />
        </mesh>
        {/* Bright shaft highlight */}
        <mesh position={[0.025, 0.40, 0.07]} scale={[0.18, 0.78, 0.10]}>
          <capsuleGeometry args={[0.025, 0.25, 8, 16]} />
          <meshBasicMaterial color="#b8f7ff" transparent opacity={0.82} />
        </mesh>
        {/* Rounded glowing tip */}
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.095, 20, 20]} />
          <meshStandardMaterial color="#d7ecff" emissive={accentBlue} emissiveIntensity={1.8} />
        </mesh>
        <pointLight position={[0, 0.78, 0]} color={accentBlue} intensity={0.55} distance={1.2} />
      </group>

      {/* ── LEFT ARM: soft rounded actuator ── */}
      <group ref={leftArmRef} position={[-1.02, 0.28, 0]}>
        <mesh position={[0, 0, 0]} scale={[0.72, 1.35, 0.72]}>
          <capsuleGeometry args={[0.18, 0.30, 12, 24]} />
          <meshStandardMaterial color={primaryWhite} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.46, 0]} scale={[0.85, 1.1, 0.85]}>
          <capsuleGeometry args={[0.14, 0.22, 12, 24]} />
          <meshStandardMaterial color={accentBlue} roughness={0.3} />
        </mesh>
      </group>

      {/* ── RIGHT ARM: soft rounded actuator ── */}
      <group ref={rightArmRef} position={[1.02, 0.28, 0]}>
        <mesh position={[0, 0, 0]} scale={[0.72, 1.35, 0.72]}>
          <capsuleGeometry args={[0.18, 0.30, 12, 24]} />
          <meshStandardMaterial color={primaryWhite} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.46, 0]} scale={[0.85, 1.1, 0.85]}>
          <capsuleGeometry args={[0.14, 0.22, 12, 24]} />
          <meshStandardMaterial color={accentBlue} roughness={0.3} />
        </mesh>
      </group>

      {/* ── LEFT LEG ── */}
      <group ref={leftLegRef} position={[-0.4, -1.05, 0]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial color={metalGray} metalness={0.55} roughness={0.4} />
        </mesh>

        {/* Leg sole */}
        <mesh position={[0, -0.12, 0.08]}>
          <boxGeometry args={[0.35, 0.08, 0.28]} />
          <meshStandardMaterial color="#0f1419" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ── RIGHT LEG ── */}
      <group ref={rightLegRef} position={[0.4, -1.05, 0]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial color={metalGray} metalness={0.55} roughness={0.4} />
        </mesh>

        {/* Leg sole */}
        <mesh position={[0, -0.12, 0.08]}>
          <boxGeometry args={[0.35, 0.08, 0.28]} />
          <meshStandardMaterial color="#0f1419" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// FLOATING PARTICLES
// ═══════════════════════════════════════════════════════════
function FloatingParticles({ isDark }: { isDark: boolean }) {
  const count = 30;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const accentColor = isDark ? '#2aa198' : '#268bd2';

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      // Deterministic pseudo-random values keep render pure and stable.
      const value = (seed: number) => {
        const x = Math.sin(seed * 12.9898) * 43758.5453;
        return x - Math.floor(x);
      };
      const r = (offset: number) => value(index * 17 + offset);

      return {
        position: [
          (r(1) - 0.5) * 8,
          (r(2) - 0.5) * 6,
          (r(3) - 0.5) * 4,
        ] as [number, number, number],
        speed: 0.08 + r(4) * 0.25,
        offset: r(5) * Math.PI * 2,
        scale: 0.008 + r(6) * 0.014,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(t * p.speed * 0.6 + p.offset) * 0.4,
        p.position[2] + Math.sin(t * p.speed * 0.4 + p.offset * 2) * 0.3
      );
      const s = p.scale + Math.sin(t * 2.5 + p.offset) * 0.006;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={accentColor}
        emissive={accentColor}
        emissiveIntensity={2.2}
        transparent
        opacity={0.35}
      />
    </instancedMesh>
  );
}

// ═══════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════
function Scene({ mouseX, mouseY, isDark }: { mouseX: number; mouseY: number; isDark: boolean }) {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={1.4} />

      {/* Main key light - bright white from top-right */}
      <directionalLight position={[5, 6, 4]} intensity={4.0} color="#ffffff" />

      {/* Warm rim light from back-left */}
      <directionalLight position={[-4, 3, -2]} intensity={2.5} color="#ffb366" />

      {/* Cool cyan accent from right */}
      <directionalLight position={[4, 1, -3]} intensity={2.2} color="#00d9ff" />

      {/* Soft fill from below */}
      <directionalLight position={[0, -2, 4]} intensity={1.2} color="#f0f4f8" />

      <Float speed={0.7} rotationIntensity={0.04} floatIntensity={0.2}>
        <EnhancedRobot mouseX={mouseX} mouseY={mouseY} />
      </Float>

      <FloatingParticles isDark={isDark} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════
export default function RobotCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(containerRef);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '450px',
        cursor: 'grab',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.0], fov: 38 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene mouseX={mouse.normalizedX} mouseY={mouse.normalizedY} isDark={isDark} />
      </Canvas>
    </div>
  );
}
