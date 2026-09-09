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
  const agentsRef = useRef<Map<string, any>>(new Map());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with better colors
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1f0a);
    scene.fog = new THREE.Fog(0x0a1f0a, 150, 400);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(60, 45, 60);
    camera.lookAt(0, 10, 0);

    // Renderer with better settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    containerRef.current.appendChild(renderer.domElement);

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0x8899bb, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffdd99, 1);
    directionalLight.position.set(80, 100, 60);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Add atmospheric light
    const skyLight = new THREE.HemisphereLight(0x88ccff, 0x225533, 0.4);
    scene.add(skyLight);

    // Create detailed terrain with height map
    const terrainGeometry = new THREE.PlaneGeometry(300, 300, 100, 100);
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4d1a,
      roughness: 0.9,
      metalness: 0,
      flatShading: false,
    });

    // Add Perlin-like height variation
    const positions = terrainGeometry.getAttribute('position');
    const posArray = positions.array as Float32Array;
    for (let i = 0; i < posArray.length; i += 3) {
      const x = posArray[i];
      const y = posArray[i + 1];
      const z = posArray[i + 2];

      // Multi-octave noise for natural terrain
      z = Math.sin(x * 0.015) * Math.cos(y * 0.015) * 8 +
          Math.sin(x * 0.05) * Math.cos(y * 0.05) * 4 +
          Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;

      posArray[i + 2] = z;
    }
    positions.needsUpdate = true;
    terrainGeometry.computeVertexNormals();

    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.receiveShadow = true;
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Add trees with better details
    for (let i = 0; i < 50; i++) {
      const treeHeight = Math.random() * 40 + 30;
      const trunkHeight = treeHeight * 0.3;

      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(3, 4, trunkHeight, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      trunk.position.y = trunkHeight / 2;

      // Foliage - multiple layers for depth
      const foliageGeometry = new THREE.ConeGeometry(treeHeight * 0.4, treeHeight * 0.7, 16);
      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a5e1a,
        roughness: 0.7,
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      foliage.position.y = treeHeight * 0.6;

      // Group tree
      const treeGroup = new THREE.Group();
      treeGroup.add(trunk);
      treeGroup.add(foliage);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 120 + 40;
      treeGroup.position.set(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance,
      );

      scene.add(treeGroup);
    }

    // Add campfires in different spots
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = Math.random() * 60 + 50;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      // Fire pit (rocks)
      for (let j = 0; j < 4; j++) {
        const rockGeometry = new THREE.BoxGeometry(2, 1, 2);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.castShadow = true;
        rock.position.set(
          x + Math.cos(j * Math.PI / 2) * 3,
          0.5,
          z + Math.sin(j * Math.PI / 2) * 3,
        );
        scene.add(rock);
      }

      // Fire flames (cone)
      const flameGeometry = new THREE.ConeGeometry(2, 4, 8);
      const flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: 0xff3300,
        emissiveIntensity: 1,
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(x, 2, z);
      flame.castShadow = true;
      (flame as any).userData.isFire = true;
      scene.add(flame);

      // Light from fire
      const fireLight = new THREE.PointLight(0xff6600, 1, 50);
      fireLight.position.set(x, 3, z);
      fireLight.castShadow = true;
      scene.add(fireLight);
    }

    // Add camp tents
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const distance = Math.random() * 50 + 60;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      // Tent pole
      const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(x, 1.5, z);
      pole.castShadow = true;
      scene.add(pole);

      // Tent canvas
      const tentGeometry = new THREE.ConeGeometry(4, 5, 16);
      const tentMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc6633,
        roughness: 0.8,
      });
      const tent = new THREE.Mesh(tentGeometry, tentMaterial);
      tent.position.set(x, 2.5, z);
      tent.castShadow = true;
      tent.receiveShadow = true;
      scene.add(tent);
    }

    // Add roaming wild animals
    const roamingAnimals: any[] = [];
    for (let i = 0; i < 5; i++) {
      const wildAnimal = createWildAnimal();
      wildAnimal.position.set(
        (Math.random() - 0.5) * 250,
        5,
        (Math.random() - 0.5) * 250,
      );
      wildAnimal.userData.targetX = (Math.random() - 0.5) * 250;
      wildAnimal.userData.targetZ = (Math.random() - 0.5) * 250;
      wildAnimal.userData.speed = Math.random() * 0.02 + 0.01;
      scene.add(wildAnimal);
      roamingAnimals.push(wildAnimal);
    }

    // Create particle system for atmosphere
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 400;
      particlePositions[i * 3 + 1] = Math.random() * 200;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      particleSizes[i] = Math.random() * 0.5 + 0.2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x88aa66,
      size: 0.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.3,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Create enhanced agent meshes
    const createAgentMesh = (agent: Agent) => {
      const group = new THREE.Group();

      // Body - more detailed
      const bodyGeometry = new THREE.CapsuleGeometry(1.5, 4, 4, 8);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: getAnimalColor(agent.animal),
        roughness: 0.5,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      body.receiveShadow = true;
      body.position.y = 2.5;
      group.add(body);

      // Head
      const headGeometry = new THREE.SphereGeometry(1.8, 16, 16);
      const head = new THREE.Mesh(headGeometry, bodyMaterial);
      head.castShadow = true;
      head.receiveShadow = true;
      head.position.y = 6.5;
      group.add(head);

      // Eyes - glowing
      const eyeGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8,
      });
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.8, 7, 1.6);
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.8, 7, 1.6);
      group.add(leftEye);
      group.add(rightEye);

      // Shadow under agent
      const shadowGeometry = new THREE.CircleGeometry(3, 32);
      const shadowMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3,
      });
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadow.position.y = 0.05;
      shadow.rotation.x = -Math.PI / 2;
      group.add(shadow);

      // Health bar background
      const barBgGeometry = new THREE.BoxGeometry(5, 0.6, 0.3);
      const barBgMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
      const barBg = new THREE.Mesh(barBgGeometry, barBgMaterial);
      barBg.position.y = 8;
      barBg.position.z = 2.5;
      group.add(barBg);

      // Health bar
      const barGeometry = new THREE.BoxGeometry(5, 0.6, 0.3);
      const barMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00aa00,
        emissiveIntensity: 0.5,
      });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.y = 8;
      bar.position.z = 2.6;
      group.add(bar);
      (bar as any).userData.healthBar = true;
      (bar as any).userData.maxScale = 5;

      // Position agents in circle
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 70 + 25;
      group.position.x = Math.cos(angle) * distance;
      group.position.z = Math.sin(angle) * distance;

      group.userData.agent = agent;
      group.userData.time = 0;
      group.userData.bobOffset = Math.random() * Math.PI * 2;
      group.userData.rotationOffset = Math.random() * Math.PI * 2;

      return group;
    };

    // Add agents
    agents.forEach((agent) => {
      const mesh = createAgentMesh(agent);
      scene.add(mesh);
      agentsRef.current.set(agent.id, mesh);
    });

    // Smooth camera controls
    let targetCameraX = camera.position.x;
    let targetCameraZ = camera.position.z;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      targetCameraX = 60 + x * 30;
      targetCameraZ = 60 + y * 30;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const speed = 0.1;
      const direction = e.deltaY > 0 ? 1 : -1;
      camera.position.multiplyScalar(1 + direction * speed);
    };

    // Click detection with raycaster
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
        let obj = intersects[0].object;
        while (obj && !obj.userData?.agent) {
          obj = obj.parent as THREE.Object3D;
        }
        if (obj?.userData?.agent) {
          onAgentClick?.(obj.userData.agent.id);
        }
      }
    };

    // Animation loop with smooth interpolation
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera easing
      camera.position.x += (targetCameraX - camera.position.x) * 0.08;
      camera.position.z += (targetCameraZ - camera.position.z) * 0.08;
      camera.lookAt(0, 15, 0);

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += delta * 0.03;
        const particlePositions = particlesRef.current.geometry.getAttribute('position')
          .array as Float32Array;
        for (let i = 0; i < particlePositions.length; i += 3) {
          particlePositions[i + 1] += delta * 3;
          if (particlePositions[i + 1] > 200) {
            particlePositions[i + 1] = 0;
          }
        }
        particlesRef.current.geometry.getAttribute('position').needsUpdate = true;
      }

      // Update agents with smooth animations
      agentsRef.current.forEach((group, agentId) => {
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) return;

        // Bob animation
        group.position.y = Math.sin(elapsed * 2 + group.userData.bobOffset) * 0.7;

        // Rotation animation
        group.rotation.y = elapsed * 0.5 + group.userData.rotationOffset;

        // Update health bar
        const children = group.children as any[];
        children.forEach((child) => {
          if (child.userData.healthBar) {
            const scale = Math.max(0.1, agent.health / 100);
            child.scale.x = scale;

            // Color gradient based on health
            if (agent.health > 60) {
              child.material.color.setHex(0x00ff00);
              child.material.emissive.setHex(0x00aa00);
            } else if (agent.health > 30) {
              child.material.color.setHex(0xffff00);
              child.material.emissive.setHex(0xffaa00);
            } else {
              child.material.color.setHex(0xff3333);
              child.material.emissive.setHex(0xff0000);
            }
          }
        });

        // Highlight selected agent
        if (agent.id === selectedAgentId) {
          group.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.12);
          group.position.y += Math.sin(elapsed * 3) * 0.2;
        } else {
          group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('click', handleClick);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [selectedAgentId, onAgentClick, agents]);

  return <div ref={containerRef} className="w-full h-screen" />;
}

function createWildAnimal(): THREE.Group {
  const group = new THREE.Group();
  const animals = ['LION', 'TIGER', 'PANTHER', 'EAGLE', 'BOAR', 'WOLF'];
  const animal = animals[Math.floor(Math.random() * animals.length)];

  const bodyGeometry = new THREE.BoxGeometry(2, 2, 4);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: getAnimalColor(animal),
    roughness: 0.6,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const headGeometry = new THREE.SphereGeometry(1.2, 12, 12);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.castShadow = true;
  head.position.z = 2.5;
  head.position.y = 0.5;
  group.add(head);

  group.userData.isWildAnimal = true;
  return group;
}

function getAnimalColor(animal: string): number {
  const colors: Record<string, number> = {
    LION: 0xffaa00,
    TIGER: 0xff8844,
    PANTHER: 0x1a1a2e,
    WOLF: 0x8899aa,
    BEAR: 0x664422,
    GORILLA: 0x332211,
    EAGLE: 0xcc9944,
    SNAKE: 0x22aa44,
    CROCODILE: 0x2d5016,
    JAGUAR: 0x663333,
    HYENA: 0xcc9944,
    BOAR: 0x552244,
  };
  return colors[animal] || 0x999999;
}
