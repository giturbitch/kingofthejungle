import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { CropStage } from "@/lib/jungle/protocol";

/** The target/prey resource. Visual stage is driven only by protocol state. */
export function Crop({
  stage,
  color,
  seed,
}: {
  stage: CropStage;
  color: string;
  seed: number;
}) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime + seed * 20;
    if (group.current) {
      group.current.rotation.y += delta * (stage === "ripe" ? 0.5 : 0.12);
      const target = stage === "rot" ? 0.6 : 1;
      group.current.scale.setScalar(
        THREE.MathUtils.damp(group.current.scale.x, target, 3, delta),
      );
    }
    if (glow.current) {
      const pulse = stage === "ripe" ? 1.1 + Math.sin(t * 3) * 0.18 : 1;
      glow.current.scale.setScalar(pulse);
    }
  });

  if (stage === "rot") {
    return (
      <group ref={group} position-y={0.1}>
        <mesh castShadow rotation-z={0.7}>
          <capsuleGeometry args={[0.07, 0.5, 3, 5]} />
          <meshStandardMaterial color="#3a3226" roughness={1} />
        </mesh>
        <mesh position={[0.18, 0.05, 0.1]}>
          <sphereGeometry args={[0.16, 8, 6]} />
          <meshStandardMaterial color="#241f16" roughness={1} />
        </mesh>
      </group>
    );
  }

  if (stage === "seed") {
    return (
      <group ref={group} position-y={0.14}>
        <mesh ref={glow}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.4}
          />
        </mesh>
      </group>
    );
  }

  const ripe = stage === "ripe";
  const height = ripe ? 1.5 : 0.85;

  return (
    <group ref={group} position-y={0}>
      <mesh castShadow position-y={height / 2}>
        <cylinderGeometry args={[0.05, 0.09, height, 6]} />
        <meshStandardMaterial color="#3f5a2c" roughness={0.9} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 0.26,
            height * 0.55,
            Math.sin((i / 4) * Math.PI * 2) * 0.26,
          ]}
          rotation={[0.5, (i / 4) * Math.PI * 2, 0.4]}
          castShadow
        >
          <sphereGeometry args={[0.24, 8, 5]} />
          <meshStandardMaterial color="#4d7a30" roughness={0.85} flatShading />
        </mesh>
      ))}
      <mesh ref={glow} position-y={height + 0.16}>
        <icosahedronGeometry args={[ripe ? 0.32 : 0.15, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ripe ? 2.4 : 0.8}
          roughness={0.35}
        />
      </mesh>
      {ripe && <pointLight position={[0, height + 0.3, 0]} intensity={3} distance={7} color={color} />}
    </group>
  );
}
