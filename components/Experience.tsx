import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, OrbitControls, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Star from './Star';
import FairyLights from './FairyLights';
import { TreeState } from '../types';
import { COLORS } from '../constants';

interface ExperienceProps {
  treeState: TreeState;
}

const RotatingTree = ({ treeState }: { treeState: TreeState }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && treeState === TreeState.TREE_SHAPE) {
      // Smooth constant rotation around Y axis
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- TREE COMPOSITION --- */}

      {/* 1. Structural Core: Green Spheres with Size Gradient */}
      <Ornaments 
        treeState={treeState} 
        count={560} 
        type="sphere" 
        colors={COLORS.PALETTE_GREEN} 
        scaleRange={[0.4, 1.3]} // Scale from Small(top) to Large(bottom)
        thickShell={true} 
        radiusScale={1.0}
        useSizeGradient={true}
      />
      <Ornaments 
        treeState={treeState} 
        count={280} 
        type="sphere" 
        colors={COLORS.PALETTE_GREEN} 
        scaleRange={[0.3, 1.0]} 
        thickShell={true}
        radiusScale={0.9} 
        useSizeGradient={true}
      />

      {/* 2. Tiny Sparkling Particles (Multi-colored) - No Gradient, constant random size */}
      <Ornaments 
        treeState={treeState} 
        count={700}
        type="sphere" 
        colors={COLORS.PALETTE_SPARKLE} 
        scaleRange={[0.08, 0.18]} 
        thickShell={true}
        radiusScale={1.05} 
        useSizeGradient={false}
      />

      {/* 3. Gift Boxes: Gold, Yellow - No Gradient, random rectangular sizes */}
      <Ornaments 
        treeState={treeState} 
        count={450} 
        type="box" 
        colors={COLORS.PALETTE_DECOR_BOXES} 
        scaleRange={[0.4, 0.9]} 
        thickShell={true}
        radiusScale={1.1} 
        randomDimensions={true} 
        useSizeGradient={false}
      />

      {/* 4. Ornament Balls: Red, White, Yellow - With Size Gradient */}
      <Ornaments 
        treeState={treeState} 
        count={350} 
        type="sphere" 
        colors={COLORS.PALETTE_DECOR_SPHERES} 
        scaleRange={[0.3, 0.9]} 
        thickShell={true}
        radiusScale={1.12} 
        useSizeGradient={true}
      />
      
      {/* 5. Fairy Lights */}
      <FairyLights treeState={treeState} count={250} color={COLORS.LIGHT_WARM} />

      {/* 6. Particle Aura */}
      <Foliage treeState={treeState} />

      {/* 7. The Star */}
      <Star treeState={treeState} />
    </group>
  );
};

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas 
      shadows
      dpr={[1, 2]}
      gl={{ 
        antialias: false, // Disabled for EffectComposer
        stencil: false,
        depth: true,
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 1.0 // Reduced exposure slightly to prevent washout
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 4, 45]} fov={35} />
      
      {/* FULLY INTERACTIVE ORBIT CONTROLS */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={20} 
        maxDistance={70}
      />
      
      <color attach="background" args={['#000201']} />

      {/* BACKGROUND SPARKLES (Luxurious Atmosphere) */}
      <Sparkles 
        count={1500} 
        scale={120} 
        size={3} 
        speed={0.2} 
        opacity={0.3} 
        color={COLORS.GOLD_LIGHT} 
      />
      
      {/* Lighting Setup: Golden Splendor */}
      {/* Reduced Ambient Light for Deeper Blacks/Contrast */}
      <ambientLight intensity={0.2} color={COLORS.GOLD_DEEP} />
      
      {/* Main Key Light - Warm Gold */}
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={3.5} 
        color={COLORS.GOLD_LIGHT} 
        castShadow 
      />
      {/* Fill Light - Cool for Contrast */}
      <directionalLight 
        position={[-15, 10, 5]} 
        intensity={2.0} 
        color={COLORS.WHITE_PURE} 
      />
      {/* Rim Lights for Opulence */}
      <pointLight position={[0, -15, 10]} intensity={2.0} color={COLORS.GREEN_LIGHT} distance={50} />
      <pointLight position={[0, 15, -10]} intensity={4.0} color={COLORS.GOLD_MEDIUM} distance={50} />

      <Environment preset="city" blur={0.8} background={false} />

      <RotatingTree treeState={treeState} />

      {/* CINEMATIC POST PROCESSING */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={1.5} // Raised threshold: Only very bright reflections glow
          mipmapBlur 
          intensity={0.6} // Reduced intensity: Soft Halo, no heavy fog
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

    </Canvas>
  );
};

export default Experience;