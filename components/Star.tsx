import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { COLORS, TREE_HEIGHT, SCATTER_RADIUS, getRandomPointInSphere } from '../constants';

interface StarProps {
  treeState: TreeState;
}

const Star: React.FC<StarProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    // Increased size by another 20% (0.88 -> 1.056, 0.33 -> 0.396)
    const outerRadius = 1.056;
    const innerRadius = 0.396;
    
    for(let i = 0; i < points * 2; i++){
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if(i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.1, // Keeps it thin
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);

  const { treePos, scatterPos } = useMemo(() => {
    return {
      // Position slightly above the tree height (Height/2)
      treePos: new THREE.Vector3(0, TREE_HEIGHT / 2 + 0.8, 0),
      scatterPos: getRandomPointInSphere(SCATTER_RADIUS)
    };
  }, []);

  const progress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.2);
    const t = progress.current;
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const currentPos = new THREE.Vector3().lerpVectors(scatterPos, treePos, easeT);
    meshRef.current.position.copy(currentPos);

    const time = state.clock.getElapsedTime();
    if (t < 0.5) {
        meshRef.current.rotation.x = time * 0.5;
        meshRef.current.rotation.y = time * 0.5;
    } else {
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 2);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 2);
        // Star rotates with the group, but we can add a little extra local spin if desired,
        // but user asked for "Entire tree rotates". If this star is inside the group, it rotates automatically.
        // We will just keep it upright.
        meshRef.current.rotation.y = 0; 
    }

    const scale = 1.0 + Math.sin(time * 3) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} geometry={starGeometry}>
      <meshStandardMaterial 
        color={COLORS.GOLD_LIGHT} // Rich, saturated golden yellow (#FFD700)
        emissive={COLORS.GOLD_LIGHT} // Slight golden glow
        emissiveIntensity={0.6}  // Luminous
        roughness={0.2}          // Medium-low for balanced shine
        metalness={1.0}          // High metallic reflection
        envMapIntensity={3.5}    // Enhanced specular highlights for sparkling effect
      />
      <pointLight distance={10} intensity={8} color={COLORS.GOLD_LIGHT} />
    </mesh>
  );
};

export default Star;