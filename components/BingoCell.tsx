import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BingoCellData } from '../types';
import { Sparkles, Zap, Check, Star } from 'lucide-react';

interface BingoCellProps {
  data: BingoCellData;
  isMarked: boolean;
  onToggle: (id: number) => void;
  disabled?: boolean;
  index: number;
  isPachinkoMode: boolean;
}

const BingoCell: React.FC<BingoCellProps> = ({ data, isMarked, onToggle, disabled, index, isPachinkoMode }) => {
  const exitValues = useMemo(() => ({
    y: 100 + Math.random() * 100,
    x: (Math.random() - 0.5) * 80,
    rotate: (Math.random() - 0.5) * 90
  }), []);

  const isCenter = data.isCenter;

  // Common container animation variants
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1, scale: 1, y: 0, rotate: 0, x: 0,
      transition: { delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }
    }),
    exit: (i: number) => ({
      opacity: 0, ...exitValues,
      transition: { duration: 0.4, ease: "easeIn", delay: i * 0.02 }
    })
  };

  // Determine container classes based on mode
  const getContainerClasses = () => {
    const base = "relative flex flex-col items-center justify-center p-2 transition-all duration-700 h-24 sm:h-28 w-full overflow-hidden cursor-pointer active:scale-95";
    
    if (isPachinkoMode) {
      // Pachinko Styles
      const pachinkoBase = "rounded-lg border-b-4 active:border-b-0 active:translate-y-1";
      if (isMarked) {
        return `${base} ${pachinkoBase} ${isCenter ? 'bg-yellow-900 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.6)]' : 'bg-purple-900 border-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.6)]'}`;
      }
      return `${base} ${pachinkoBase} bg-gray-800 border-gray-950 shadow-inner`;
    } else {
      // Simple Styles
      const simpleBase = "rounded-xl shadow-sm hover:shadow-md border-2";
      if (isMarked) {
        return `${base} ${simpleBase} ${isCenter ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-orange-100 border-orange-300 text-orange-900'}`;
      }
      return `${base} ${simpleBase} bg-white border-gray-100 text-gray-600 hover:border-orange-200`;
    }
  };

  return (
    <motion.div
      layout
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onToggle(data.id)}
      className={getContainerClasses()}
    >
      {/* --- PACHINKO MODE CONTENT LAYER --- */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ${isPachinkoMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute inset-0 transition-opacity duration-300 ${isMarked ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`absolute inset-0 ${isCenter ? 'bg-gradient-to-t from-yellow-500/50 to-transparent' : 'bg-gradient-to-t from-purple-500/50 to-transparent'}`}></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50 blur-[2px]"></div>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

        <div className={`z-10 mb-1 transition-all duration-300 ${isMarked ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'opacity-40 grayscale'}`}>
          {isCenter ? (
             <Zap size={32} className={isMarked ? "text-yellow-300 fill-yellow-300" : "text-gray-500"} />
          ) : (
             <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${isMarked ? 'border-pink-500 bg-pink-900' : 'border-gray-600 bg-gray-700'}`}>
                <div className={`w-2 h-2 rounded-full ${isMarked ? 'bg-white shadow-[0_0_5px_white]' : 'bg-gray-500'}`}></div>
             </div>
          )}
        </div>

        <span className={`z-10 text-center leading-tight px-1 select-none font-bold ${isCenter ? 'text-lg text-yellow-100' : 'text-xs sm:text-sm text-white'} ${isMarked ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-gray-400'}`}>
          {data.text}
        </span>
        
        {/* Counter Display (Pachinko) */}
        <div className={`z-10 mt-1 text-[10px] font-digital tracking-wider ${isMarked ? 'text-green-400 drop-shadow-[0_0_3px_rgba(74,222,128,0.8)]' : 'text-gray-500'}`}>
          ({data.currentCount}/{data.targetCount})
        </div>

        {isMarked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay"
          />
        )}
      </div>

      {/* --- SIMPLE MODE CONTENT LAYER --- */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 transition-opacity duration-700 ${!isPachinkoMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="z-10 mb-1">
          {isCenter ? (
            <Star size={28} className={isMarked ? "text-yellow-500 fill-yellow-500" : "text-yellow-400"} />
          ) : (
            isMarked ? (
              <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white">
                <Check size={16} strokeWidth={4} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
            )
          )}
        </div>

        <span className={`text-center leading-tight px-1 select-none font-bold text-xs sm:text-sm`}>
          {data.text}
        </span>

        {/* Counter Display (Simple) */}
        <div className="mt-1 text-[10px] font-bold text-gray-400">
          ({data.currentCount}/{data.targetCount})
        </div>

        {isMarked && !isPachinkoMode && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-xl bg-orange-400 opacity-20 pointer-events-none"
          />
        )}
      </div>
    </motion.div>
  );
};

export default BingoCell;