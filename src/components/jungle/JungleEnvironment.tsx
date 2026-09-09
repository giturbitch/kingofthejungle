import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { hash } from "@/lib/jungle/protocol";
import { REGIONS, WORLD_RADIUS, scatterTrees } from "@/lib/jungle/world";
import { TreasuryVault } from "./TreasuryVault";

const dummy = new THREE.Object3D();

/** Instanced background flora — two draw calls for the whole jungle. */
function Flora({ count = 420 }: { count?: number }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const canopy = useRef<THREE.InstancedMesh>(null);
  const trees = useMemo(() => scatterTrees(count), [count]);

  useLayoutEffect(() => {
    const canopyColor = new THREE.Color();
    trees.forEach((t, i) => {
      dummy.position.set(t.x, t.s * 1.1, t.z);
      dummy.scale.setScalar(t.s);
      dummy.rotation.set(0, t.tint * 6, 0);
      dummy.updateMatrix();
      trunks.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, t.s * 2.6, t.z);
      dummy.scale.setScalar(t.s * 1.35);
      dummy.updateMatrix();
      canopy.current?.setMatrixAt(i, dummy.matrix);
      canopyColor.setHSL(0.28 - t.tint * 0.06, 0.35, 0.12 + t.tint * 0.1);
      canopy.current?.setColorAt(i, canopyColor);
    });
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (canopy.current) {
      canopy.current.instanceMatrix.needsUpdate = true;
      if (canopy.current.instanceColor)
        canopy.current.instanceColor.needsUpdate = true;
    }
  }, [trees]);

  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]}>
        <cylinderGeometry args={[0.16, 0.28, 2.2, 5]} />
        <meshStandardMaterial color="#241d15" roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={canopy}
        args={[undefined, undefined, trees.length]}
        castShadow
      >
        <icosahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial roughness={0.95} flatShading />
      </instancedMesh>
    </>
  );
}

function River() {
  const water = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-96, 0, -30),
      new THREE.Vector3(-40, 0, -8),
      new THREE.Vector3(4, 0, 14),
      new THREE.Vector3(48, 0, 6),
      new THREE.Vector3(96, 0, 40),
    ]);
    const pts = curve.getPoints(80);
    const positions: number[] = [];
    const indices: number[] = [];
    pts.forEach((p, i) => {
      const next = pts[Math.min(i + 1, pts.length - 1)]!;
      const dir = new THREE.Vector3().subVectors(next, p).normalize();
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(
        5 + Math.sin(i * 0.4) * 1.6,
      );
      positions.push(p.x + side.x, 0, p.z + side.z);
      positions.push(p.x - side.x, 0, p.z - side.z);
      if (i < pts.length - 1) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((state) => {
    const mat = water.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mat) mat.emissiveIntensity = 0.16 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
  });

  return (
    <mesh ref={water} geometry={geometry} position-y={0.04}>
      <meshStandardMaterial
        color="#12252c"
        emissive="#2e6a74"
        emissiveIntensity={0.18}
        roughness={0.18}
        metalness={0.6}
      />
    </mesh>
  );
}

function Mountains() {
  const peaks = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r = WORLD_RADIUS + 40 + hash(`mr:${i}`) * 24;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          h: 26 + hash(`mh:${i}`) * 30,
          w: 20 + hash(`mw:${i}`) * 18,
        };
      }),
    [],
  );
  return (
    <>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2 - 2, p.z]}>
          <coneGeometry args={[p.w, p.h, 5, 1]} />
          <meshStandardMaterial color="#1b1f22" roughness={1} flatShading />
        </mesh>
      ))}
    </>
  );
}

function Ruins() {
  const blocks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: -44 + (hash(`rx:${i}`) - 0.5) * 34,
        z: 42 + (hash(`rz:${i}`) - 0.5) * 30,
        h: 1.5 + hash(`rh:${i}`) * 5,
        w: 1.4 + hash(`rw:${i}`) * 2.2,
        rot: hash(`rr:${i}`) * Math.PI,
      })),
    [],
  );
  return (
    <>
      {blocks.map((b, i) => (
        <mesh
          key={i}
          position={[b.x, b.h / 2, b.z]}
          rotation-y={b.rot}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial color="#35342c" roughness={1} />
        </mesh>
      ))}
    </>
  );
}

function Waterfall() {
  const fall = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const mat = fall.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mat) mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.12;
  });
  return (
    <group position={[-72, 0, -58]}>
      <mesh position={[0, 11, 0]}>
        <boxGeometry args={[26, 22, 16]} />
        <meshStandardMaterial color="#20242a" roughness={1} flatShading />
      </mesh>
      <mesh ref={fall} position={[0, 11, 8.2]}>
        <planeGeometry args={[7, 21]} />
        <meshStandardMaterial
          color="#a8ccd4"
          emissive="#6fb0bd"
          emissiveIntensity={0.55}
          transparent
          opacity={0.75}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.06, 13]}>
        <circleGeometry args={[9, 24]} />
        <meshStandardMaterial color="#13272e" metalness={0.6} roughness={0.2} />
      </mesh>
      <pointLight position={[0, 6, 12]} intensity={12} distance={40} color="#7fc6d4" />
    </group>
  );
}

function Fireflies({ count = 90 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = hash(`fa:${i}`) * Math.PI * 2;
      const r = hash(`fr:${i}`) * WORLD_RADIUS;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = 1 + hash(`fy:${i}`) * 8;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;
    const attr = points.current.geometry.attributes["position"] as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      attr.setY(i, positions[i * 3 + 1]! + Math.sin(t * 0.6 + i) * 0.6);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f4d894"
        size={0.32}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function JungleEnvironment({
  onOpenTreasury,
}: {
  onOpenTreasury: () => void;
}) {
  return (
    <>
      <fogExp2 attach="fog" args={["#0d1a17", 0.004]} />
      <color attach="background" args={["#080d0c"]} />

      <hemisphereLight args={["#4a6d84", "#20301c", 1.0]} />
      <ambientLight intensity={0.6} color="#3b5c4c" />
      <directionalLight
        position={[-40, 60, 30]}
        intensity={1.9}
        color="#f0dfb4"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-camera-far={220}
      />

      {/* cool moon fill from the opposite side */}
      <directionalLight position={[50, 40, -40]} intensity={0.5} color="#7fa6c4" />

      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[WORLD_RADIUS + 70, 64]} />
        <meshStandardMaterial color="#1e2a1c" roughness={1} />
      </mesh>

      {/* regions */}
      {REGIONS.map((r) => (
        <mesh key={r.name} rotation-x={-Math.PI / 2} position={[r.x, 0.01, r.z]}>
          <circleGeometry args={[r.r, 40]} />
          <meshStandardMaterial color={r.color} roughness={1} transparent opacity={0.95} />
        </mesh>
      ))}

      <River />
      <Mountains />
      <Ruins />
      <Waterfall />
      <Flora />
      <Fireflies />
      <TreasuryVault onOpen={onOpenTreasury} />
    </>
  );
}
