import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { hash } from "@/lib/jungle/protocol";
import { useTreasury } from "./useTreasury";

/**
 * THE TREASURY — a fortified supply bunker at the heart of the jungle.
 * Its size, light and crate activity scale with the live prize pool only.
 */
export function TreasuryVault({
  position = [0, 0, 34] as [number, number, number],
  onOpen,
}: {
  position?: [number, number, number];
  onOpen: () => void;
}) {
  const treasury = useTreasury();
  const pool = treasury.data?.pool ?? 0;
  const energy = Math.min(1, pool / 24);

  const glow = useRef<THREE.PointLight>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const crates = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: (hash(`cx:${i}`) - 0.5) * 16,
        z: 6 + hash(`cz:${i}`) * 8,
        s: 0.7 + hash(`cs:${i}`) * 0.7,
        rot: hash(`cr:${i}`) * Math.PI,
      })),
    [],
  );
  const visibleCrates = Math.max(2, Math.round(crates.length * energy));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (glow.current)
      glow.current.intensity = 8 + energy * 34 + Math.sin(t * 1.6) * (2 + energy * 6);
    if (beacon.current) {
      beacon.current.rotation.y = t * (0.4 + energy * 1.4);
      beacon.current.position.y = 11 + Math.sin(t * 1.2) * 0.3;
    }
  });

  const height = 6 + energy * 5;

  return (
    <group position={position} onClick={onOpen}>
      {/* platform */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.05} receiveShadow>
        <circleGeometry args={[18, 40]} />
        <meshStandardMaterial color="#2b2a22" roughness={1} />
      </mesh>

      {/* vault */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[13, height, 11]} />
        <meshStandardMaterial color="#2f3229" roughness={0.85} metalness={0.25} />
      </mesh>
      {/* vault door */}
      <mesh position={[0, height / 2 - 0.6, 5.6]}>
        <planeGeometry args={[5.4, height * 0.6]} />
        <meshStandardMaterial
          color="#8b6d2f"
          emissive="#d8b25f"
          emissiveIntensity={0.25 + energy * 0.9}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* fortification posts */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 16, 1.6, Math.sin(a) * 16]} castShadow>
            <cylinderGeometry args={[0.3, 0.42, 3.2, 5]} />
            <meshStandardMaterial color="#241d15" roughness={1} />
          </mesh>
        );
      })}

      {/* supply crates arriving as purchases land */}
      {crates.slice(0, visibleCrates).map((c, i) => (
        <mesh
          key={i}
          position={[c.x, c.s / 2, c.z]}
          rotation-y={c.rot}
          castShadow
        >
          <boxGeometry args={[c.s, c.s, c.s]} />
          <meshStandardMaterial color="#4a3a22" roughness={0.95} />
        </mesh>
      ))}

      {/* beacon + vault light */}
      <mesh ref={beacon} position={[0, 11, 0]}>
        <octahedronGeometry args={[0.9 + energy * 0.7, 0]} />
        <meshStandardMaterial
          color="#f4d894"
          emissive="#f0c766"
          emissiveIntensity={1 + energy * 2}
          flatShading
        />
      </mesh>
      <pointLight ref={glow} position={[0, 9, 0]} distance={60} color="#f2c86a" />
    </group>
  );
}
