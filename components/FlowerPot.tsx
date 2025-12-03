
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout } from 'lucide-react';

interface FlowerPotProps {
  month: string;
  progress: number;
  isPachinkoMode: boolean;
  activeQuote: string | null;
}

const SEASONAL_FLOWERS = [
  { name: '水仙 (Narcissus)', color: '#FDFD96', center: '#FFA500' }, // 1月
  { name: '梅 (Plum)', color: '#FF69B4', center: '#FFFF00' },       // 2月
  { name: '桃 (Peach)', color: '#FFB7C5', center: '#FF1493' },      // 3月
  { name: '桜 (Cherry Blossom)', color: '#FFC0CB', center: '#FF69B4' }, // 4月
  { name: 'チューリップ', color: '#FF4D4D', center: '#000000' },     // 5月
  { name: '紫陽花 (Hydrangea)', color: '#87CEEB', center: '#E0FFFF' }, // 6月
  { name: '朝顔 (Morning Glory)', color: '#4169E1', center: '#FFFFFF' }, // 7月
  { name: '向日葵 (Sunflower)', color: '#FFD700', center: '#8B4513' },   // 8月
  { name: 'コスモス', color: '#FF69B4', center: '#FFFF00' },        // 9月
  { name: '金木犀', color: '#FFA500', center: '#FF8C00' },          // 10月
  { name: '菊 (Chrysanthemum)', color: '#FFFFE0', center: '#FFD700' }, // 11月
  { name: 'ポインセチア', color: '#DC143C', center: '#FFFF00' },    // 12月
];

const FlowerPot: React.FC<FlowerPotProps> = ({ month, progress, isPachinkoMode, activeQuote }) => {
  const monthIndex = Math.max(0, Math.min(11, (parseInt(month) || 1) - 1));
  const flowerData = SEASONAL_FLOWERS[monthIndex];
  
  // Growth Stages
  // 0-15: Seed/Dirt
  // 15-40: Sprout
  // 40-70: Growing
  // 70-95: Bud
  // 95-100: Bloom
  
  type Stage = 'seed' | 'sprout' | 'growing' | 'bud' | 'bloom';

  const getStage = (p: number): Stage => {
    if (p < 15) return 'seed';
    if (p < 40) return 'sprout';
    if (p < 70) return 'growing';
    if (p < 95) return 'bud';
    return 'bloom';
  };

  const stage = getStage(progress);

  return (
    <div className={`fixed bottom-4 left-4 z-40 flex flex-col items-center transition-all duration-700 ${isPachinkoMode ? 'scale-110' : 'scale-100'}`}>
      
      {/* Speech Bubble for Quotes */}
      <AnimatePresence>
        {activeQuote && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute left-20 bottom-24 bg-white border-4 border-black p-4 rounded-2xl shadow-xl z-50 w-64 md:w-80"
          >
             {/* Speech Bubble Arrow */}
             <div className="absolute -bottom-4 -left-2 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-black border-r-[0px] border-r-transparent"></div>
             <div className="absolute -bottom-1 left-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-white border-r-[0px] border-r-transparent"></div>

             <p className="font-bold text-gray-900 text-sm md:text-base leading-relaxed font-rounded text-center">
               {activeQuote}
             </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flower Name Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-2 px-3 py-1 rounded-full text-[10px] font-bold shadow-md whitespace-nowrap
          ${isPachinkoMode 
            ? 'bg-black border border-green-500 text-green-400 font-digital tracking-widest' 
            : 'bg-white/90 border border-gray-200 text-gray-600 font-rounded'
          }`}
      >
        {parseInt(month)}月の花: {flowerData.name} ({Math.round(progress)}%)
      </motion.div>

      {/* The Pot and Plant SVG */}
      <div className="relative w-24 h-32 flex items-end justify-center">
        
        {/* Sparkles Effect for Bloom */}
        {stage === 'bloom' && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 inset-x-0 h-24 w-full pointer-events-none"
          >
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`absolute w-1 h-1 rounded-full ${isPachinkoMode ? 'bg-yellow-400 shadow-[0_0_5px_gold]' : 'bg-yellow-300'}`}
                style={{ 
                  top: '20%', 
                  left: '50%', 
                  transform: `rotate(${i * 60}deg) translate(30px) scale(${Math.random()})` 
                }} 
              />
            ))}
          </motion.div>
        )}

        <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible drop-shadow-xl">
          <defs>
            <linearGradient id="potGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#A0522D" />
              <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
            <linearGradient id="potGradientNeon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="50%" stopColor="#333" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
          </defs>

          {/* PLANT GROUP */}
          <motion.g animate={stage} initial="seed">
            
            {/* Stem */}
            {(stage !== 'seed') && (
              <motion.path 
                d="M50 90 Q50 80 50 80"
                animate={{ 
                  d: stage === 'sprout' ? "M50 90 Q48 80 50 70" 
                     : stage === 'growing' ? "M50 90 Q45 70 50 50"
                     : "M50 90 Q45 70 50 35"
                }}
                stroke="#4CAF50" 
                strokeWidth={4} 
                strokeLinecap="round"
                fill="none"
                transition={{ duration: 1, type: "spring" }}
              />
            )}

            {/* Leaves */}
            {(stage === 'sprout' || stage === 'growing' || stage === 'bud' || stage === 'bloom') && (
              <>
                <motion.path 
                  d="M50 70 Q30 60 40 80" 
                  fill="#66BB6A"
                  animate={{ 
                    scale: stage === 'sprout' ? 0.5 : 1,
                    rotate: stage === 'sprout' ? -10 : -20
                  }}
                  transition={{ duration: 1 }}
                />
                <motion.path 
                  d="M50 70 Q70 60 60 80" 
                  fill="#66BB6A"
                  animate={{ 
                    scale: stage === 'sprout' ? 0.5 : 1,
                    rotate: stage === 'sprout' ? 10 : 20
                  }}
                  transition={{ duration: 1 }}
                />
              </>
            )}

            {/* Bud */}
            {stage === 'bud' && (
              <motion.circle 
                cx="50" cy="35" r="8" 
                fill={flowerData.color} 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              />
            )}

            {/* Bloom */}
            {stage === 'bloom' && (
              <motion.g 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1.2, opacity: 1, rotate: [0, 5, -5, 0] }} 
                transition={{ duration: 0.8, rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" } }}
                style={{ originX: "50px", originY: "35px" }}
              >
                {/* Petals */}
                <circle cx="50" cy="25" r="10" fill={flowerData.color} />
                <circle cx="60" cy="35" r="10" fill={flowerData.color} />
                <circle cx="50" cy="45" r="10" fill={flowerData.color} />
                <circle cx="40" cy="35" r="10" fill={flowerData.color} />
                <circle cx="57" cy="28" r="9" fill={flowerData.color} />
                <circle cx="57" cy="42" r="9" fill={flowerData.color} />
                <circle cx="43" cy="42" r="9" fill={flowerData.color} />
                <circle cx="43" cy="28" r="9" fill={flowerData.color} />
                
                {/* Center */}
                <circle cx="50" cy="35" r="6" fill={flowerData.center} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
              </motion.g>
            )}
          </motion.g>

          {/* POT */}
          <g transform="translate(0, 0)">
             {/* Rim */}
             <rect x="25" y="90" width="50" height="10" rx="2" fill={isPachinkoMode ? '#333' : '#8B4513'} stroke={isPachinkoMode ? '#0f0' : '#5D4037'} strokeWidth="2" />
             {/* Body */}
             <path d="M30 100 L35 120 H65 L70 100 Z" fill={isPachinkoMode ? "url(#potGradientNeon)" : "url(#potGradient)"} stroke={isPachinkoMode ? '#0f0' : '#5D4037'} strokeWidth="2" />
             {/* Pachinko Glow */}
             {isPachinkoMode && (
               <path d="M30 100 L35 120 H65 L70 100 Z" fill="none" stroke="#00FF00" strokeWidth="2" filter="url(#glow)" className="animate-pulse" />
             )}
          </g>

        </svg>
      </div>

      {stage === 'seed' && (
         <div className="absolute bottom-10 text-xs font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
            あと{Math.max(0, 15 - Math.round(progress))}%で発芽
         </div>
      )}
    </div>
  );
};

export default FlowerPot;
