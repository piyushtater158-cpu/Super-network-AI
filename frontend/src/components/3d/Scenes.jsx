import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

// Constellation Network - Interactive particles that connect
function ConstellationParticles({ count = 500 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

// Floating orbs
function FloatingOrbs() {
  return (
    <>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-2, 1, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
        <mesh position={[2.5, -0.5, 1]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh position={[1, 2, -1]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial
            color="#eab308"
            emissive="#eab308"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
    </>
  );
}

// Dancing particles background
function DancingParticles({ count = 200 }) {
  const ref = useRef();
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vel];
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3] + Math.sin(state.clock.elapsedTime + i) * 0.001;
        positions[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(state.clock.elapsedTime + i) * 0.001;
        positions[i * 3 + 2] += velocities[i * 3 + 2];
        
        // Wrap around
        if (Math.abs(positions[i * 3]) > 5) velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 5) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 5) velocities[i * 3 + 2] *= -1;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

// Main Constellation Scene for Hero
export const ConstellationScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={0.3} />
      
      <ConstellationParticles count={400} />
      <DancingParticles count={150} />
      <FloatingOrbs />
    </Canvas>
  );
};

// Ikigai Crystal - 4-sided structure that grows
function IkigaiCrystal({ progress = 0, activeSection = 0 }) {
  const groupRef = useRef();
  const crystalRef = useRef();

  const colors = ["#ec4899", "#8b5cf6", "#06b6d4", "#22c55e"];
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (crystalRef.current) {
      crystalRef.current.scale.setScalar(0.5 + progress * 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central crystal */}
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.2 + progress * 0.3}
          transparent
          opacity={0.6 + progress * 0.3}
          roughness={0.1}
          metalness={0.8}
          transmission={0.3}
        />
      </mesh>

      {/* Orbiting nodes for each Ikigai section */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 1.8;
        const isActive = i === activeSection;
        const isComplete = i < activeSection || (i === activeSection && progress > 0);
        
        return (
          <Float key={i} speed={2 + i * 0.5} floatIntensity={0.5}>
            <mesh
              position={[
                Math.cos(angle) * radius,
                Math.sin(i * 0.5) * 0.3,
                Math.sin(angle) * radius,
              ]}
            >
              <sphereGeometry args={[isActive ? 0.25 : 0.15, 32, 32]} />
              <meshStandardMaterial
                color={colors[i]}
                emissive={colors[i]}
                emissiveIntensity={isComplete ? 0.8 : 0.2}
                transparent
                opacity={isComplete ? 1 : 0.4}
              />
            </mesh>
          </Float>
        );
      })}

      {/* Connection lines */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const nextAngle = ((i + 1) / 4) * Math.PI * 2;
        const radius = 1.8;
        
        const points = [
          new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
          new THREE.Vector3(0, 0, 0),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={`line-${i}`} geometry={lineGeometry}>
            <lineBasicMaterial color={colors[i]} transparent opacity={0.3} />
          </line>
        );
      })}
    </group>
  );
}

// Ikigai Scene for Onboarding
export const IkigaiScene = ({ progress = 0, activeSection = 0 }) => {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-5, -5, 5]} color="#8b5cf6" intensity={0.4} />
      <pointLight position={[0, 0, 5]} color="#06b6d4" intensity={0.3} />
      
      <IkigaiCrystal progress={progress} activeSection={activeSection} />
      <DancingParticles count={100} />
    </Canvas>
  );
};

// Simple Stars Background
export const StarsBackground = () => {
  const ref = useRef();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%",
        pointerEvents: "none",
        zIndex: -1
      }}
      dpr={[1, 1.5]}
    >
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </Canvas>
  );
};

export default ConstellationScene;
