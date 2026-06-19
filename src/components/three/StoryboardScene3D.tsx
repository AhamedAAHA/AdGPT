"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  Text,
  Environment,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import type { Beat } from "@/types";

interface StoryboardCardProps {
  beat: Beat;
  index: number;
  total: number;
  isActive: boolean;
  onClick: () => void;
}

function StoryboardCard3D({
  beat,
  index,
  total,
  isActive,
  onClick,
}: StoryboardCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const spread = 2.8;
  const x = (index - (total - 1) / 2) * spread;

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetY = isActive ? 0.3 : 0;
    const targetScale = isActive ? 1.15 : 1;
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.08
    );
    const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.08);
    meshRef.current.scale.set(s, s, s);
    meshRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={[x, 0, isActive ? 0.5 : 0]}>
        <RoundedBox
          ref={meshRef}
          args={[2, 2.8, 0.08]}
          radius={0.08}
          smoothness={4}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.2}
            chromaticAberration={0.04}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            iridescence={0.4}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color={isActive ? "#00f5ff" : "#a855f7"}
            opacity={0.6}
            transparent
          />
        </RoundedBox>
        <Text
          position={[0, 0.8, 0.06]}
          fontSize={0.12}
          color="#00f5ff"
          anchorX="center"
          maxWidth={1.6}
        >
          {beat.role.toUpperCase()}
        </Text>
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.1}
          color="#f0f0f5"
          anchorX="center"
          maxWidth={1.6}
        >
          {beat.headline}
        </Text>
        <Text
          position={[0, -0.8, 0.06]}
          fontSize={0.08}
          color="#6b6b80"
          anchorX="center"
        >
          {(beat.startMs / 1000).toFixed(1)}s – {(beat.endMs / 1000).toFixed(1)}s
        </Text>
      </group>
    </Float>
  );
}

function CameraController({ activeIndex }: { activeIndex: number }) {
  const { camera } = useThree();
  const targetPos = useMemo(
    () => new THREE.Vector3(activeIndex * 0.8, 1.5, 6),
    [activeIndex]
  );

  useFrame(() => {
    camera.position.lerp(targetPos, 0.03);
    camera.lookAt(activeIndex * 0.8, 0, 0);
  });

  return null;
}

function Scene({
  beats,
  activeIndex,
  onBeatSelect,
}: {
  beats: Beat[];
  activeIndex: number;
  onBeatSelect: (index: number) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00f5ff" />
      <pointLight position={[-10, -5, 5]} intensity={0.4} color="#a855f7" />
      <Environment preset="night" />
      <CameraController activeIndex={activeIndex} />
      {beats.map((beat, i) => (
        <StoryboardCard3D
          key={beat.id}
          beat={beat}
          index={i}
          total={beats.length}
          isActive={i === activeIndex}
          onClick={() => onBeatSelect(i)}
        />
      ))}
    </>
  );
}

interface StoryboardScene3DProps {
  beats: Beat[];
  activeIndex: number;
  onBeatSelect: (index: number) => void;
  className?: string;
}

export function StoryboardScene3D({
  beats,
  activeIndex,
  onBeatSelect,
  className,
}: StoryboardScene3DProps) {
  if (beats.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: "transparent" }}
      >
        <p className="text-muted text-sm">Upload an ad to generate storyboard</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene
            beats={beats}
            activeIndex={activeIndex}
            onBeatSelect={onBeatSelect}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
