import React, { useState } from 'react';
import { TreeState } from '../types';
import { generateLuxuryWish } from '../services/geminiService';

interface UIOverlayProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ treeState, setTreeState }) => {
  const [wish, setWish] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleState = () => {
    setTreeState(treeState === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED);
  };

  const handleGenerateWish = async () => {
    setLoading(true);
    setWish(null);
    const text = await generateLuxuryWish();
    setWish(text);
    setLoading(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center sm:items-start space-y-2 pointer-events-auto">
        <h1 className="text-3xl md:text-5xl font-serif text-yellow-100 tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          MERRY CHRISTMAS!
        </h1>
      </header>

      {/* Center Wish Display */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg text-center pointer-events-none px-4">
        {loading && (
           <div className="text-yellow-200/70 font-serif animate-pulse text-lg">
             Consulting the spirits of luxury...
           </div>
        )}
        {wish && !loading && (
          <div className="animate-[fadeIn_2s_ease-in-out]">
            <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed drop-shadow-lg italic">
              "{wish}"
            </p>
            <div className="mt-4 flex justify-center">
              <div className="h-[1px] w-12 bg-yellow-400"></div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <footer className="flex flex-col sm:flex-row justify-between items-center w-full space-y-4 sm:space-y-0 pointer-events-auto">
        
        {/* State Toggle */}
        <button
          onClick={toggleState}
          className={`
            relative px-8 py-3 overflow-hidden group bg-transparent border border-yellow-500/30 rounded-full
            transition-all duration-500 hover:border-yellow-400 hover:bg-yellow-900/20 backdrop-blur-md
          `}
        >
          <span className={`
            absolute inset-0 w-full h-full bg-yellow-400/10 
            transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500
          `}></span>
          <span className="font-serif text-yellow-100 tracking-widest uppercase text-sm relative z-10">
            {treeState === TreeState.SCATTERED ? 'Assemble Tree' : 'Scatter Magic'}
          </span>
        </button>

        {/* AI Wish Button */}
        <button
          onClick={handleGenerateWish}
          disabled={loading || treeState === TreeState.SCATTERED}
          className={`
            flex items-center space-x-2 text-yellow-200/80 hover:text-white transition-colors duration-300
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="font-serif tracking-widest text-xs uppercase">
            {treeState === TreeState.SCATTERED ? 'Form Tree to Wish' : 'Generate Wish (AI)'}
          </span>
        </button>

      </footer>
    </div>
  );
};

export default UIOverlay;