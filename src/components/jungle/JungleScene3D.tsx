import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Agent } from '../../server/storage';

interface JungleScene3DProps {
  agents: Agent[];
  selectedAgentId?: string;
  onAgentClick?: (agentId: string) => void;
}

export function JungleScene3D({ agents, selectedAgentId, onAgentClick }: JungleScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const agentsRef = useRef<Map<string, THREE.Group>>(new Map());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a3a1a); // Dark jungle green
    scene.fog = new THREE.Fog(0x1a3a1a, 100, 500);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Create terrain
    const terrainGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5016,
      roughness: 0.8,
      metalness: 0,
    });

    // Add height variation
    const positions = terrainGeometry.getAttribute('position');
    const posArray = positions.array as Float32Array;
    for (let i = 0; i < posArray.length; i += 3) {
      posArray[i + 2] = Math.sin(posArray[i] * 0.02) * Math.cos(posArray[i + 1] * 0.02) * 5;
    }
    positions.needsUpdate = true;
    terrainGeometry.computeVertexNormals();

    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.receiveShadow = true;
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Add some trees as background
    for (let i = 0; i < 20; i++) {
      const treeHeight = Math.random() * 30 + 20;
      const treeGeometry = new THREE.ConeGeometry(8, treeHeight, 8);
      const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a4d1a });
      const tree = new THREE.Mesh(treeGeometry, treeMaterial);
      tree.castShadow = true;
      tree.position.set(
        (Math.random() - 0.5) * 200,
        treeHeight / 2,
        (Math.random() - 0.5) * 200,
      );
      scene.add(tree);
    }

    // Create agent meshes
    const createAgentMesh = (agent: Agent): THREE.Group => {
      const group = new THREE.Group();

      // Agent body (cube-based stylized character)
      const bodyGeometry = new THREE.BoxGeometry(3, 5, 3);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: getAnimalColor(agent.animal),
        roughness: 0.6,
        metalness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      body.position.y = 2.5;
      group.add(body);

      // Head
      const headGeometry = new THREE.SphereGeometry(1.5, 8, 8);
      const head = new THREE.Mesh(headGeometry, bodyMaterial);
      head.castShadow = true;
      head.position.y = 6;
      group.add(head);

      // Eyes
      const eyeGeometry = new THREE.SphereGeometry(0.4, 4, 4);
      const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.7, 6.5, 1.4);
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.7, 6.5, 1.4);
      group.add(leftEye);
      group.add(rightEye);

      // Health bar background
      const barBgGeometry = new THREE.BoxGeometry(4, 0.5, 0.2);
      const barBgMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const barBg = new THREE.Mesh(barBgGeometry, barBgMaterial);
      barBg.position.y = 7.5;
      barBg.position.z = 2;
      group.add(barBg);

      // Health bar (will be updated)
      const barGeometry = new THREE.BoxGeometry(4, 0.5, 0.2);
      const barMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.y = 7.5;
      bar.position.z = 2.1;
      group.add(bar);
      (bar as any).userData.healthBar = true;

      // Random position
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60 + 20;
      group.position.x = Math.cos(angle) * distance;
      group.position.z = Math.sin(angle) * distance;

      group.userData.agent = agent;
      return group;
    };

    // Add agents to scene
    agents.forEach((agent) => {
      const mesh = createAgentMesh(agent);
      scene.add(mesh);
      agentsRef.current.set(agent.id, mesh);
    });

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Update agents
      agentsRef.current.forEach((group, agentId) => {
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) return;

        // Bob animation
        group.position.y = Math.sin(Date.now() * 0.002) * 0.5;

        // Update health bar
        const children = group.children as any[];
        children.forEach((child) => {
          if (child.userData.healthBar) {
            const scale = Math.max(0, agent.health / 100);
            child.scale.x = scale;
            child.material.color.setHSL(Math.max(0, agent.health / 300), 1, 0.5);
          }
        });

        // Rotation animation
        group.rotation.y += delta * 0.2;

        // Highlight selected
        if (agent.id === selectedAgentId) {
          group.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
        } else {
          group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Camera controls
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      camera.position.x = 50 + x * 20;
      camera.position.z = 50 + y * 20;
      camera.lookAt(0, 10, 0);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const speed = 2;
      const direction = e.deltaY > 0 ? 1 : -1;
      camera.position.multiplyScalar(1 + direction * 0.1 * speed);
    };

    // Click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(
        Array.from(agentsRef.current.values()),
        true,
      );
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        let agentGroup: any = obj;
        while (agentGroup && !agentGroup.userData.agent) {
          agentGroup = agentGroup.parent;
        }
        if (agentGroup?.userData.agent) {
          onAgentClick?.(agentGroup.userData.agent.id);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('click', handleClick);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [selectedAgentId, onAgentClick]);

  // Update agents when they change
  useEffect(() => {
    if (!sceneRef.current) return;

    agents.forEach((agent) => {
      let mesh = agentsRef.current.get(agent.id);
      if (!mesh) {
        // Create new agent mesh
        const bodyGeometry = new THREE.BoxGeometry(3, 5, 3);
        const bodyMaterial = new THREE.MeshStandardMaterial({
          color: getAnimalColor(agent.animal),
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;

        mesh = new THREE.Group();
        mesh.add(body);
        mesh.userData.agent = agent;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60 + 20;
        mesh.position.x = Math.cos(angle) * distance;
        mesh.position.z = Math.sin(angle) * distance;

        sceneRef.current.add(mesh);
        agentsRef.current.set(agent.id, mesh);
      }

      // Update agent data
      mesh.userData.agent = agent;
    });
  }, [agents]);

  return (
    <div ref={containerRef} className="w-full h-screen" />
  );
}

function getAnimalColor(animal: string): number {
  const colors: Record<string, number> = {
    LION: 0xffaa00,
    TIGER: 0xff6600,
    PANTHER: 0x2a2a2a,
    WOLF: 0x888888,
    BEAR: 0x663300,
    GORILLA: 0x332211,
    EAGLE: 0xaa8844,
    SNAKE: 0x00aa44,
    CROCODILE: 0x2a5533,
    JAGUAR: 0x442211,
    HYENA: 0xaa9944,
    BOAR: 0x663344,
  };
  return colors[animal] || 0x888888;
}
