import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { getRandomPointInSphere, getTreePoint, SCATTER_RADIUS } from '../constants';

interface OrnamentsProps {
  treeState: TreeState;
  count: number;
  type: 'sphere' | 'box';
  colors: string[]; // Array of colors to pick from randomly
  scaleRange: [number, number]; // [min, max] base scale
  rangeY?: [number, number]; // Normalized height range [0, 1]
  radiusScale?: number; // Outer boundary multiplier
  thickShell?: boolean; // If true, distributes items inside the volume defined by radiusScale
  randomDimensions?: boolean; // If true, scales x/y/z independently (for rectangular boxes)
  useSizeGradient?: boolean; // If true, scale decreases from bottom (scaleRange[1]) to top (scaleRange[0])
}

const Ornaments: React.FC<OrnamentsProps> = ({ 
  treeState, 
  count, 
  type, 
  colors, 
  scaleRange,
  rangeY = [0, 1],
  radiusScale = 1.0,
  thickShell = false,
  randomDimensions = false,
  useSizeGradient = false
}) => {
  const meshOpaqueRef = useRef<THREE.InstancedMesh>(null);
  const meshTransparentRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Data generation with explicit split for Transparency
  const { opaqueData, transparentData } = useMemo(() => {
    const allItems = new Array(count).fill(0).map((_, i) => {
      // Interpolate t based on range
      const tNorm = i / count; 
      const randomOffset = (Math.random() - 0.5) * 0.1;
      let t = rangeY[0] + tNorm * (rangeY[1] - rangeY[0]) + randomOffset;
      t = Math.max(0, Math.min(1, t));

      const treeP = getTreePoint(t, count);
      
      // Adjust radius/depth for volumetric look
      const depth = thickShell ? Math.sqrt(Math.random()) : 1.0; 
      const finalRadiusScale = radiusScale * (thickShell ? (0.2 + 0.8 * depth) : 1.0);
      
      treeP.x *= finalRadiusScale;
      treeP.z *= finalRadiusScale;
      
      const scatterP = getRandomPointInSphere(SCATTER_RADIUS);
      
      // --- SCALE LOGIC ---
      let baseScale = 1.0;

      if (useSizeGradient) {
        // Linear interpolation: Bottom (t=0) uses Max Scale, Top (t=1) uses Min Scale
        const sizeSpread = scaleRange[1] - scaleRange[0];
        const noise = (Math.random() - 0.5) * (sizeSpread * 0.3);
        baseScale = scaleRange[1] - (t * sizeSpread) + noise;
        baseScale = Math.max(scaleRange[0] * 0.5, baseScale);
      } else {
         baseScale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
      }
      
      // FORCE TOP TIP to be small regardless of strategy
      if (t > 0.92) {
        baseScale *= 0.4;
      }

      // Dimension multipliers for rectangular shapes
      let scaleX = 1, scaleY = 1, scaleZ = 1;
      if (randomDimensions && type === 'box') {
        scaleX = 0.5 + Math.random() * 1.0; 
        scaleY = 0.5 + Math.random() * 1.0;
        scaleZ = 0.5 + Math.random() * 1.0;
      }

      const colorIndex = Math.floor(Math.random() * colors.length);
      
      // Determine if this specific ornament is transparent accent (15% chance, never boxes)
      const isTransparent = type === 'sphere' && Math.random() < 0.15;

      return {
        treePos: treeP,
        scatterPos: scatterP,
        randomPhase: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2.0,
        baseScale: baseScale,
        scaleMultipliers: new THREE.Vector3(scaleX, scaleY, scaleZ),
        colorHex: colors[colorIndex],
        isTransparent
      };
    });

    return {
      opaqueData: allItems.filter(i => !i.isTransparent),
      transparentData: allItems.filter(i => i.isTransparent)
    };
  }, [count, rangeY, radiusScale, thickShell, colors, scaleRange, randomDimensions, type, useSizeGradient]);

  // Apply colors to instances
  useLayoutEffect(() => {
    const tempColor = new THREE.Color();

    if (meshOpaqueRef.current) {
      opaqueData.forEach((item, i) => {
        tempColor.set(item.colorHex);
        meshOpaqueRef.current!.setColorAt(i, tempColor);
      });
      meshOpaqueRef.current.instanceColor!.needsUpdate = true;
    }

    if (meshTransparentRef.current) {
      transparentData.forEach((item, i) => {
        tempColor.set(item.colorHex);
        meshTransparentRef.current!.setColorAt(i, tempColor);
      });
      meshTransparentRef.current.instanceColor!.needsUpdate = true;
    }
  }, [opaqueData, transparentData]);

  // Animation State
  const progress = useRef(0);

  useFrame((state, delta) => {
    // Update Progress
    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.2);
    const t = progress.current;
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const time = state.clock.getElapsedTime();

    // Helper function to animate a specific mesh and dataset
    const animateMesh = (mesh: THREE.InstancedMesh | null, dataset: typeof opaqueData) => {
      if (!mesh) return;
      dataset.forEach((item, i) => {
        // Position Interpolation
        const pos = new THREE.Vector3().lerpVectors(item.scatterPos, item.treePos, easeT);
        
        // Floating movement
        const floatAmp = THREE.MathUtils.lerp(4.0, 0.05, easeT); 
        pos.y += Math.sin(time + item.randomPhase) * floatAmp;
        pos.x += Math.cos(time * 0.5 + item.randomPhase) * floatAmp * 0.5;

        dummy.position.copy(pos);
        dummy.rotation.set(
          time * item.rotationSpeed + item.randomPhase,
          time * item.rotationSpeed + item.randomPhase,
          time * item.rotationSpeed
        );
        
        const pop = Math.sin(easeT * Math.PI) * 0.2; 
        const currentBaseScale = item.baseScale * (0.3 + 0.7 * easeT + pop);
        
        dummy.scale.set(
          currentBaseScale * item.scaleMultipliers.x,
          currentBaseScale * item.scaleMultipliers.y,
          currentBaseScale * item.scaleMultipliers.z
        );

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    animateMesh(meshOpaqueRef.current, opaqueData);
    animateMesh(meshTransparentRef.current, transparentData);
  });

  const Geometry = type === 'sphere' ? <sphereGeometry args={[1, 24, 24]} /> : <boxGeometry args={[1, 1, 1]} />;

  return (
    <group>
      {/* OPAQUE MESH (Majority) - Solid, Metallic, Clarity */}
      <instancedMesh ref={meshOpaqueRef} args={[undefined, undefined, opaqueData.length]} castShadow receiveShadow>
        {Geometry}
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.35} // Increased roughness to diffuse reflections, reducing white glare
          metalness={0.9}  
          emissive="#000000" // REMOVED WHITE VEIL (was #ffffff)
          emissiveIntensity={0}
          envMapIntensity={2.0} // Reduced from 3.0 to prevent washout
          transparent={false} 
          opacity={1.0}
        />
      </instancedMesh>

      {/* TRANSPARENT ACCENTS (Minority) - Heavy Solid Crystal */}
      {transparentData.length > 0 && (
        <instancedMesh ref={meshTransparentRef} args={[undefined, undefined, transparentData.length]}>
          {Geometry}
          <meshPhysicalMaterial 
            color="#ffffff"
            roughness={0.2}
            metalness={0.3}
            transmission={0.2} // Reduced transmission significantly -> Solid Crystal
            thickness={3.0} // Very thick
            ior={1.5}
            envMapIntensity={2.5}
            transparent={true}
            opacity={1.0} 
          />
        </instancedMesh>
      )}
    </group>
  );
};

export default Ornaments;