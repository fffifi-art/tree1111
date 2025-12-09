import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getRandomPointInSphere, getTreePoint, SCATTER_RADIUS } from '../constants';

interface FairyLightsProps {
  treeState: TreeState;
  count: number;
  color: string;
}

const FairyLights: React.FC<FairyLightsProps> = ({ treeState, count, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const t = Math.random(); // Random distribution for lights
      const treeP = getTreePoint(t, count);
      
      // Push lights slightly out
      treeP.x *= 1.25;
      treeP.z *= 1.25;
      
      const scatterP = getRandomPointInSphere(SCATTER_RADIUS);
      
      return {
        treePos: treeP,
        scatterPos: scatterP,
        blinkSpeed: 2.0 + Math.random() * 3.0,
        blinkOffset: Math.random() * Math.PI * 2
      };
    });
  }, [count]);

  const progress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.5);
    const t = progress.current;
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const time = state.clock.getElapsedTime();

    data.forEach((item, i) => {
      const pos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, easeT);
      
      dummy.position.copy(pos);
      dummy.rotation.set(0, 0, 0);
      
      // Blinking Effect
      // Only blink when in tree shape, otherwise just glow steadily or dimmer
      let scale = 0.15;
      if (t > 0.8) {
        const blink = Math.sin(time * item.blinkSpeed + item.blinkOffset);
        // Map -1..1 to 0.5..1.5 scale
        scale *= (1.0 + blink * 0.5); 
      }
      
      // Fade out when scattered to avoid clutter
      scale *= (0.2 + 0.8 * easeT);

      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={2.0}
        toneMapped={false} 
      />
    </instancedMesh>
  );
};

export default FairyLights;