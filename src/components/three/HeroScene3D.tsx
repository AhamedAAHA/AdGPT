"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  RoundedBox,
  Text,
  Environment,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

const POSTER_URL =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80";

function FloatingCard({
  position,
  rotation,
  label,
  delay,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  label: string;
  delay: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y =
      rotation[1] + Math.sin(state.clock.elapsedTime * 0.25 + delay) * 0.06;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.4 + delay) * 0.1;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
      <group position={position}>
        <RoundedBox
          ref={ref}
          args={[1.4, 1.9, 0.05]}
          radius={0.05}
          rotation={rotation}
        >
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.1}
            roughness={0.15}
            metalness={0.7}
            clearcoat={1}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.04]}
          rotation={rotation}
          fontSize={0.09}
          color={color}
          anchorX="center"
          fillOpacity={0.7}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

function SidePoster({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture(POSTER_URL);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y =
      rotation[1] + Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
  });

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox ref={ref} args={[1.6, 2.2, 0.04]} radius={0.04}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[1.45, 2.05]} />
        <meshBasicMaterial map={texture} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function AmbientOrbs() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.02;
  });

  return (
    <group ref={ref}>
      {[
        [-4, 2, -4],
        [4, -2, -5],
        [0, 3, -6],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial
            color={i === 0 ? "#00f5ff" : i === 1 ? "#a855f7" : "#ec4899"}
            transparent
            opacity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function HeroScene() {
  const cards = [
    {
      pos: [-5.8, 1.2, -2.5] as [number, number, number],
      rot: [0, 0.35, 0.08] as [number, number, number],
      label: "HOOK",
      delay: 0,
      color: "#00f5ff",
    },
    {
      pos: [-5.2, -1.4, -2] as [number, number, number],
      rot: [0, 0.25, -0.05] as [number, number, number],
      label: "BENEFIT",
      delay: 1,
      color: "#a855f7",
    },
    {
      pos: [5.2, 1.0, -2.2] as [number, number, number],
      rot: [0, -0.3, 0.06] as [number, number, number],
      label: "PROOF",
      delay: 2,
      color: "#ec4899",
    },
    {
      pos: [5.8, -1.2, -2.8] as [number, number, number],
      rot: [0, -0.35, -0.08] as [number, number, number],
      label: "CTA",
      delay: 3,
      color: "#00f5ff",
    },
  ];

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[8, 6, 4]} intensity={0.6} color="#00f5ff" />
      <pointLight position={[-8, 4, 3]} intensity={0.4} color="#a855f7" />
      <Environment preset="night" />
      <AmbientOrbs />
      <SidePoster position={[-7, 0, -3.5]} rotation={[0, 0.4, 0.05]} />
      <SidePoster position={[7, 0, -3.5]} rotation={[0, -0.4, -0.05]} />
      {cards.map((card, i) => (
        <FloatingCard key={i} {...card} position={card.pos} rotation={card.rot} />
      ))}
    </>
  );
}

export function HeroScene3D() {
  return (
    <div className="hero-3d-wrap absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
      <div className="hero-vignette" aria-hidden="true" />
    </div>
  );
}
