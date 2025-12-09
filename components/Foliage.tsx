import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { COLORS, FOLIAGE_COUNT, getTreePoint, getRandomPointInSphere, SCATTER_RADIUS } from '../constants';
import { TreeState } from '../types';

// Custom Shader Material
const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(COLORS.GREEN_LIGHT), // Bright Lime
    uProgress: 0, 
    uPixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 2.0
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uProgress;
    uniform float uPixelRatio;
    
    attribute vec3 aTreePos;
    attribute vec3 aScatterPos;
    attribute float aRandom;
    
    varying float vAlpha;

    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = easeInOutCubic(uProgress);
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      float movementScale = mix(1.0, 0.1, t);
      pos.x += sin(uTime * 0.5 + aRandom * 10.0) * movementScale;
      pos.y += cos(uTime * 0.3 + aRandom * 5.0) * movementScale;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Make particles slightly smaller but sharper
      gl_PointSize = (2.0 * uPixelRatio + aRandom * 1.5) * (80.0 / -mvPosition.z);
      
      float twinkle = sin(uTime * 3.0 + aRandom * 20.0) * 0.5 + 0.5;
      // Ultra-low alpha to ensure no fog/veil
      vAlpha = (0.02 + 0.15 * twinkle);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      if(length(coord) > 0.5) discard;
      
      float strength = 1.0 - (length(coord) * 2.0);
      strength = pow(strength, 2.0);

      // Add a golden tint to the core
      vec3 finalColor = uColor + vec3(0.1, 0.1, 0.0);
      
      gl_FragColor = vec4(finalColor, vAlpha * strength);
    }
  `
);

extend({ FoliageMaterial });

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, treePositions, scatterPositions, randoms } = useMemo(() => {
    const treePositions = new Float32Array(FOLIAGE_COUNT * 3);
    const scatterPositions = new Float32Array(FOLIAGE_COUNT * 3);
    const randoms = new Float32Array(FOLIAGE_COUNT);
    
    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const treeP = getTreePoint(i / FOLIAGE_COUNT, FOLIAGE_COUNT);
      // Push particles INWARD (0.9) to avoid halo/veil
      treePositions[i * 3] = treeP.x * 0.9;
      treePositions[i * 3 + 1] = treeP.y;
      treePositions[i * 3 + 2] = treeP.z * 0.9;
      
      const scatterP = getRandomPointInSphere(SCATTER_RADIUS);
      scatterPositions[i * 3] = scatterP.x;
      scatterPositions[i * 3 + 1] = scatterP.y;
      scatterPositions[i * 3 + 2] = scatterP.z;
      
      randoms[i] = Math.random();
    }
    
    return { positions: scatterPositions, treePositions, scatterPositions, randoms };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
      const current = materialRef.current.uniforms.uProgress.value;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(current, target, delta * 1.5);
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTreePos" count={treePositions.length / 3} array={treePositions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatterPos" count={scatterPositions.length / 3} array={scatterPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={randoms.length} array={randoms} itemSize={1} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <foliageMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

export default Foliage;