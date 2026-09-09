import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { animalForFarmer } from "@/lib/jungle/animals";
import { hash } from "@/lib/jungle/protocol";
import { CATEGORY_THEME, type TerritoryPlacement } from "@/lib/jungle/world";
import { Crop } from "./Crop";
import { Predator } from "./Predator";

/** Organic territory outline built once per farmer id — never re-randomised. */
function outlineShape(seed: number, radius: number) {
  const shape = new THREE.Shape();
  const points: THREE.Vector2[] = [];
  const lobes = 11;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const r = radius * (0.78 + hash(`o:${seed}:${i}`) * 0.42);
    points.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  const curve = new THREE.SplineCurve(points);
  const pts = curve.getPoints(48);
  shape.moveTo(pts[0]!.x, pts[0]!.y);
  pts.slice(1).forEach((p) => shape.lineTo(p.x, p.y));
  shape.closePath();
  return shape;
}

export function Territory({
  placement,
  selected,
  crownRank,
  onSelect,
}: {
  placement: TerritoryPlacement;
  selected: boolean;
  crownRank: number | null;
  onSelect: (farmerId: number) => void;
}) {
  const { farmer, x, z, scale, seed } = placement;
  const animal = animalForFarmer(farmer.id);
  const theme = CATEGORY_THEME[farmer.targetCategory];
  const radius = 4.2 * scale;
  const ring = useRef<THREE.Mesh>(null);

  const shape = useMemo(() => outlineShape(farmer.id, radius), [farmer.id, radius]);
  const rot = farmer.status === "rot";

  // Detail density follows real activity (harvest count), so weak territories
  // stay sparse and dominant ones look developed.
  const detail = useMemo(() => {
    const count = 4 + Math.round((scale - 1) * 10);
    return Array.from({ length: count }, (_, i) => ({
      a: hash(`d:${farmer.id}:${i}`) * Math.PI * 2,
      r: radius * (0.5 + hash(`dr:${farmer.id}:${i}`) * 0.45),
      s: 0.5 + hash(`ds:${farmer.id}:${i}`) * 1.1,
      rock: hash(`dk:${farmer.id}:${i}`) > 0.68,
    }));
  }, [farmer.id, radius, scale]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (!ring.current) return;
    const mat = ring.current.material as THREE.MeshBasicMaterial;
    const target = selected ? 0.85 : farmer.status === "ripe" ? 0.45 : 0.16;
    mat.opacity = THREE.MathUtils.damp(mat.opacity, target, 5, delta);
    ring.current.rotation.z += delta * 0.05;
    if (farmer.status === "ripe")
      mat.opacity += Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
  });

  return (
    <group position={[x, 0, z]}>
      {/* land */}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.02}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(farmer.id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={rot ? "#2b2a22" : theme.ground}
          roughness={0.95}
        />
      </mesh>

      {/* boundary */}
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[radius * 0.98, radius * 1.04, 48]} />
        <meshBasicMaterial
          color={selected ? "#e8c574" : rot ? "#5c4a3a" : theme.foliage}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* vegetation + rocks */}
      {detail.map((d, i) => (
        <group
          key={i}
          position={[Math.cos(d.a) * d.r, 0, Math.sin(d.a) * d.r]}
          scale={d.s}
        >
          {d.rock ? (
            <mesh castShadow position-y={0.22} rotation={[0.4, d.a, 0.2]}>
              <dodecahedronGeometry args={[0.34, 0]} />
              <meshStandardMaterial color="#3a3b38" roughness={1} flatShading />
            </mesh>
          ) : (
            <>
              <mesh castShadow position-y={0.5}>
                <cylinderGeometry args={[0.07, 0.11, 1, 5]} />
                <meshStandardMaterial color="#33291f" roughness={1} />
              </mesh>
              <mesh castShadow position-y={1.25}>
                <icosahedronGeometry args={[0.62, 0]} />
                <meshStandardMaterial
                  color={rot ? "#3c3a2c" : theme.foliage}
                  roughness={0.9}
                  flatShading
                />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* trophy monuments for genuinely dominant territories */}
      {crownRank !== null && crownRank <= 3 && (
        <group position={[0, 0, -radius * 0.55]}>
          <mesh castShadow position-y={0.6}>
            <boxGeometry args={[1.1, 1.2, 1.1]} />
            <meshStandardMaterial color="#2f2c26" roughness={0.85} />
          </mesh>
          <mesh position-y={1.55}>
            <torusGeometry args={[0.42, 0.1, 6, 16]} />
            <meshStandardMaterial
              color="#e8c574"
              emissive="#e8c574"
              emissiveIntensity={crownRank === 1 ? 1.6 : 0.6}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          {crownRank === 1 && (
            <pointLight position={[0, 2.4, 0]} intensity={6} distance={16} color="#f0cf85" />
          )}
        </group>
      )}

      {/* the target */}
      <group position={[0, 0, radius * 0.32]}>
        <Crop stage={farmer.cropStage} color={theme.foliage} seed={seed} />
      </group>

      {/* the predator */}
      <Predator
        animal={animal}
        status={farmer.status}
        seed={seed}
        scale={0.9 + (scale - 1) * 0.5}
      />
    </group>
  );
}
