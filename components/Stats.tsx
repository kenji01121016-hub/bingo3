import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';

interface StatsProps {
  bingoCount: number;
  markedCount: number;
  isPachinkoMode: boolean;
}

const Stats: React.FC<StatsProps> = ({ bingoCount, markedCount, isPachinkoMode }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto mb-6 grid grid-cols-1 grid-rows-1">
      
      {/* --- PACHINKO MODE STATS --- */}
      <div 
        className={`col-start-1 row-start-1 transition-opacity duration-700 ${isPachinkoMode ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'} 
        flex justify-center gap-2 sm:gap-4 w-full bg-gray-900 p-3 rounded-lg border-2 border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] relative overflow-hidden`}
      >
        {/* Glossy overlay */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-5 pointer-events-none"></div>

        {/* Bingo Counter (Big Bonus style) */}
        <div className="bg-black border border-red-900 flex-1 rounded p-2 flex flex-col items-center relative shadow-[inset_0_0_10px_rgba(255,0,0,0.3)]">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1 shadow-[0_0_5px_red]">Big Bonus</span>
          <div className="font-digital text-4xl text-red-600 font-black drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] tabular-nums tracking-widest">
            {bingoCount.toString().padStart(2, '0')}
          </div>
        </div>
        
        {/* Marked Counter (Reg Bonus style) */}
        <div className="bg-black border border-green-900 flex-1 rounded p-2 flex flex-col items-center relative shadow-[inset_0_0_10px_rgba(0,255,0,0.3)]">
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-1 shadow-[0_0_5px_green]">Regular</span>
          <div className="font-digital text-4xl text-green-500 font-black drop-shadow-[0_0_8px_rgba(0,255,0,0.8)] tabular-nums tracking-widest">
            {markedCount.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* --- SIMPLE MODE STATS --- */}
      <div 
         className={`col-start-1 row-start-1 transition-opacity duration-700 ${!isPachinkoMode ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
         flex justify-center gap-4 w-full max-w-sm mx-auto`}
      >
         <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-orange-500 font-bold text-xs uppercase tracking-wide mb-1">
               <Trophy size={14} />
               <span>BINGO</span>
            </div>
            <div className="text-3xl font-rounded font-extrabold text-gray-800">
               {bingoCount}
            </div>
         </div>

         <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-blue-500 font-bold text-xs uppercase tracking-wide mb-1">
               <CheckCircle2 size={14} />
               <span>MARKED</span>
            </div>
            <div className="text-3xl font-rounded font-extrabold text-gray-800">
               {markedCount}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Stats;