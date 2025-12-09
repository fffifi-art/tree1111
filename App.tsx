import React, { useState, Suspense } from 'react';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);

  return (
    <div className="relative w-full h-full bg-[#000502]">
      {/* UI Layer */}
      <UIOverlay treeState={treeState} setTreeState={setTreeState} />

      {/* Interaction Hint */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none opacity-60 text-yellow-100/50 text-[10px] uppercase tracking-widest font-serif animate-pulse">
        Drag to Rotate • Scroll to Zoom
      </div>

      {/* 3D Scene Layer */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-yellow-200 font-serif tracking-widest z-0">
          Loading Luxury...
        </div>
      }>
        <Experience treeState={treeState} />
      </Suspense>
    </div>
  );
};

export default App;