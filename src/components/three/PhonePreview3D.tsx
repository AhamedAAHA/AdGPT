"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

function PhoneModel({ platform }: { platform: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.4;
  });

  const platformColors: Record<string, string> = {
    "instagram-reel": "#E1306C",
    tiktok: "#00f2ea",
    "youtube-shorts": "#FF0000",
  };

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1.4, 2.8, 0.12]} radius={0.12} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.2}
          clearcoat={1}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[1.2, 2.5]} />
        <meshBasicMaterial color="#0a0a0f" />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.1, 2.3]} />
        <meshBasicMaterial color={platformColors[platform] ?? "#00f5ff"} transparent opacity={0.15} />
      </mesh>
      <Text
        position={[0, 0, 0.09]}
        fontSize={0.08}
        color="#00f5ff"
        anchorX="center"
        maxWidth={1}
      >
        {platform.replace("-", " ").toUpperCase()}
      </Text>
      <mesh position={[0, 1.35, 0.07]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="#333" />
      </mesh>
    </group>
  );
}

interface PhonePreview3DProps {
  platform: string;
  className?: string;
}

export function PhonePreview3D({ platform, className }: PhonePreview3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 3]} intensity={0.8} color="#00f5ff" />
          <pointLight position={[-3, 1, 2]} intensity={0.4} color="#a855f7" />
          <Environment preset="night" />
          <PhoneModel platform={platform} />
        </Suspense>
      </Canvas>
    </div>
  );
}
