import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { Farmer, LeaderboardEntry } from "@/lib/jungle/protocol";
import { WORLD_RADIUS, territoryLayout } from "@/lib/jungle/world";
import { JungleEnvironment } from "./JungleEnvironment";
import { Territory } from "./Territory";

function CameraRig({
  focus,
  controls,
}: {
  focus: { x: number; z: number } | null;
  controls: React.RefObject<MapControlsImpl | null>;
}) {
  const camera = useThree((s) => s.camera);
  const desired = useRef<{ t: THREE.Vector3; d: number } | null>(null);
  const saved = useRef<{ t: THREE.Vector3; d: number } | null>(null);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (focus) {
      if (!saved.current) {
        saved.current = {
          t: c.target.clone(),
          d: camera.position.distanceTo(c.target),
        };
      }
      desired.current = { t: new THREE.Vector3(focus.x, 0, focus.z), d: 20 };
    } else if (saved.current) {
      desired.current = saved.current;
      saved.current = null;
    }
  }, [focus, camera, controls]);

  useFrame((_, rawDelta) => {
    const c = controls.current;
    if (!c) return;
    const goal = desired.current;
    if (goal) {
      const delta = Math.min(rawDelta, 0.05);
      const k = 1 - Math.exp(-3.5 * delta);
      const dir = camera.position.clone().sub(c.target).normalize();
      c.target.lerp(goal.t, k);
      const dist = THREE.MathUtils.lerp(
        camera.position.distanceTo(c.target),
        goal.d,
        k,
      );
      camera.position.copy(c.target).add(dir.multiplyScalar(dist));
      c.update();
      if (c.target.distanceTo(goal.t) < 0.25) desired.current = null;
      return;
    }
    // Keep the player inside the jungle: clamp the pan target to the world.
    const limit = WORLD_RADIUS * 1.05;
    const flat = new THREE.Vector2(c.target.x, c.target.z);
    if (flat.length() > limit) {
      flat.setLength(limit);
      const dx = flat.x - c.target.x;
      const dz = flat.y - c.target.z;
      c.target.x = flat.x;
      c.target.z = flat.y;
      camera.position.x += dx;
      camera.position.z += dz;
      c.update();
    }
  });


  return null;
}

export function JungleWorld({
  farmers,
  leaderboard,
  selectedId,
  onSelect,
  onOpenTreasury,
}: {
  farmers: Farmer[];
  leaderboard: LeaderboardEntry[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onOpenTreasury: () => void;
}) {
  const controls = useRef<MapControlsImpl | null>(null);
  const layout = useMemo(() => territoryLayout(farmers), [farmers]);
  const rankById = useMemo(() => {
    const m = new Map<number, number>();
    leaderboard.forEach((e) => m.set(e.farmerId, e.rank));
    return m;
  }, [leaderboard]);

  const focus = useMemo(() => {
    const p = layout.find((l) => l.farmer.id === selectedId);
    return p ? { x: p.x, z: p.z } : null;
  }, [layout, selectedId]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 78, 92], fov: 42, far: 600 }}
      onPointerMissed={() => onSelect(null)}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <JungleEnvironment onOpenTreasury={onOpenTreasury} />
        {layout.map((placement) => (
          <Territory
            key={placement.farmer.id}
            placement={placement}
            selected={placement.farmer.id === selectedId}
            crownRank={rankById.get(placement.farmer.id) ?? null}
            onSelect={onSelect}
          />
        ))}
      </Suspense>
      <MapControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        zoomSpeed={0.7}
        panSpeed={0.8}
        minDistance={12}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2.35}
        minPolarAngle={0.25}
        screenSpacePanning={false}
      />
      <CameraRig focus={focus} controls={controls} />
    </Canvas>
  );
}
