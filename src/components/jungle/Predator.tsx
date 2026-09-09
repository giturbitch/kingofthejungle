import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Animal } from "@/lib/jungle/animals";
import type { FarmerStatus } from "@/lib/jungle/protocol";

/**
 * Stylised low-poly predator silhouette. Proportions and palette come from the
 * deterministic animal identity; motion comes from the real farmer status.
 */
export function Predator({
  animal,
  status,
  seed,
  scale = 1,
}: {
  animal: Animal;
  status: FarmerStatus;
  seed: number;
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(animal.body),
        roughness: 0.75,
        metalness: 0.05,
      }),
    [animal.body],
  );
  const darkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(animal.dark),
        roughness: 0.85,
      }),
    [animal.dark],
  );

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime + seed * 40;

    if (status === "cooldown" || status === "rot") {
      // resting / withdrawn
      g.position.y = THREE.MathUtils.damp(
        g.position.y,
        status === "rot" ? -0.15 : -0.12,
        4,
        delta,
      );
      g.rotation.y += delta * 0.05;
      if (head.current)
        head.current.rotation.x = THREE.MathUtils.damp(
          head.current.rotation.x,
          0.5,
          3,
          delta,
        );
      if (tail.current) tail.current.rotation.y = Math.sin(t * 0.4) * 0.08;
      return;
    }

    if (status === "ripe" || status === "harvesting") {
      // stands beside the harvestable target, alert
      g.position.y = Math.abs(Math.sin(t * 2.2)) * 0.06;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, Math.PI * 0.25, 3, delta);
      if (head.current) head.current.rotation.x = Math.sin(t * 3) * 0.05 - 0.1;
      if (tail.current) tail.current.rotation.y = Math.sin(t * 5) * 0.35;
      return;
    }

    if (status === "growing") {
      // watching the prey: slow circling, head fixed inward
      const r = 1.5;
      const a = t * 0.22;
      g.position.x = Math.cos(a) * r;
      g.position.z = Math.sin(a) * r;
      g.rotation.y = -a + Math.PI;
      if (head.current) head.current.rotation.x = Math.sin(t * 1.2) * 0.05;
      if (tail.current) tail.current.rotation.y = Math.sin(t * 2) * 0.18;
      return;
    }

    // idle: casual wander within the territory
    const a = t * 0.12;
    g.position.x = Math.cos(a) * 2.2;
    g.position.z = Math.sin(a * 1.3) * 2.2;
    g.rotation.y = -a * 1.1;
    g.position.y = Math.sin(t * 1.6) * 0.03;
    if (tail.current) tail.current.rotation.y = Math.sin(t * 2.4) * 0.22;
  });

  const h = animal.height;
  const len = animal.length;
  const bulk = animal.bulk;

  return (
    <group ref={group} scale={scale}>
      <group position-y={0.55 * h}>
        {/* body */}
        <mesh castShadow material={bodyMat} rotation-z={Math.PI / 2}>
          <capsuleGeometry args={[0.3 * bulk, 0.85 * len, 4, 8]} />
        </mesh>
        {/* head */}
        <group ref={head} position={[0.62 * len + 0.1, 0.16 * h, 0]}>
          <mesh castShadow material={bodyMat}>
            <sphereGeometry args={[0.24 * bulk, 10, 8]} />
          </mesh>
          <mesh position={[0.2 * bulk, -0.05, 0]} material={darkMat}>
            <boxGeometry args={[0.18, 0.12, 0.16]} />
          </mesh>
          {animal.ears !== "none" && (
            <>
              <mesh position={[-0.02, 0.2, 0.13]} material={darkMat}>
                {animal.ears === "point" ? (
                  <coneGeometry args={[0.07, 0.18, 5]} />
                ) : (
                  <sphereGeometry args={[0.08, 8, 6]} />
                )}
              </mesh>
              <mesh position={[-0.02, 0.2, -0.13]} material={darkMat}>
                {animal.ears === "point" ? (
                  <coneGeometry args={[0.07, 0.18, 5]} />
                ) : (
                  <sphereGeometry args={[0.08, 8, 6]} />
                )}
              </mesh>
            </>
          )}
          {/* eyes catch the light */}
          <mesh position={[0.22, 0.06, 0.09]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial
              color="#ffe9a8"
              emissive="#ffcf5a"
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0.22, 0.06, -0.09]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial
              color="#ffe9a8"
              emissive="#ffcf5a"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
        {/* mane / hump for dominant species */}
        {(animal.id === "LION" || animal.id === "GORILLA" || animal.id === "BEAR") && (
          <mesh position={[0.42 * len, 0.08, 0]} material={darkMat} castShadow>
            <sphereGeometry args={[0.34 * bulk, 10, 8]} />
          </mesh>
        )}
        {/* tail */}
        {animal.tail !== "none" && (
          <group ref={tail} position={[-0.6 * len, 0.05, 0]}>
            <mesh
              rotation-z={animal.tail === "long" ? -0.5 : -1}
              position={[-0.18, 0.06, 0]}
              material={bodyMat}
            >
              <capsuleGeometry
                args={[0.055, animal.tail === "long" ? 0.6 : 0.24, 3, 5]}
              />
            </mesh>
          </group>
        )}
        {/* legs */}
        {h > 0.5 &&
          [
            [0.42 * len, 0.17],
            [0.42 * len, -0.17],
            [-0.42 * len, 0.17],
            [-0.42 * len, -0.17],
          ].map(([lx, lz], i) => (
            <mesh
              key={i}
              position={[lx as number, -0.3 * h, lz as number]}
              material={darkMat}
              castShadow
            >
              <capsuleGeometry args={[0.075 * bulk, 0.34 * h, 3, 5]} />
            </mesh>
          ))}
      </group>
    </group>
  );
}
