
import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Plus, Siren, Coins, Shuffle, RefreshCcw, Wallet, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import BingoCell from './components/BingoCell';
import Stats from './components/Stats';
import BettingPage from './components/BettingPage';
import SettingsPage from './components/SettingsPage';
import FlowerPot from './components/FlowerPot';
import { generateBingoGrid, checkBingo } from './utils/bingoLogic';
import { BingoCellData } from './types';
import { MANGA_QUOTES } from './constants';

// SVG Component for Pachinko Style "7"
const SevenIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sevenGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff4d4d" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fbbf24" floodOpacity="0.8"/>
      </filter>
    </defs>
    
    <g filter="url(#gold-glow)">
      {/* Gold Border/Stroke Background - Thicker */}
      <path 
        d="M5 5 H95 L65 95 H25 L60 35 H5 V5 Z" 
        stroke="#f59e0b" 
        strokeWidth="8" 
        strokeLinejoin="round" 
        fill="none" 
      />
      
      {/* Main Red Body - Thicker coordinates */}
      <path 
        d="M5 5 H95 L65 95 H25 L60 35 H5 V5 Z" 
        fill="url(#sevenGrad)" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      
      {/* Shiny Highlight */}
      <path 
        d="M10 10 H85 L70 15 H15 V10 Z" 
        fill="white" 
        opacity="0.5" 
      />
      <path 
        d="M58 40 L50 60 L35 60 L45 40 Z" 
        fill="white" 
        opacity="0.3" 
      />
    </g>
  </svg>
);

// Helper component for smooth crossfade transition
const TransitionSection = ({ 
  children, 
  showSecond 
}: { 
  children?: React.ReactNode; 
  showSecond: boolean; 
}) => {
  const childrenArray = React.Children.toArray(children);
  return (
    <div className="relative grid grid-cols-1 grid-rows-1">
      <div className={`transition-opacity duration-700 ease-in-out col-start-1 row-start-1 w-full ${showSecond ? 'opacity-0 z-0 pointer-events-none' : 'opacity-100 z-10'}`}>
        {childrenArray[0]}
      </div>
      <div className={`transition-opacity duration-700 ease-in-out col-start-1 row-start-1 w-full ${showSecond ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        {childrenArray[1]}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'game' | 'betting' | 'settings'>('game');
  const [grid, setGrid] = useState<BingoCellData[]>([]);
  const [marked, setMarked] = useState<boolean[]>(new Array(9).fill(false));
  const [bingoCount, setBingoCount] = useState(0);
  const [previousBingoCount, setPreviousBingoCount] = useState(0);
  const [gameVersion, setGameVersion] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [hagioFunds, setHagioFunds] = useState(4900);
  
  // Quote State
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const quoteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // GOGO Lamp State (Lights up when CENTER cell is marked)
  // Mode Switch: If index 4 (center) is marked, switch to Pachinko Mode
  const isPachinkoMode = marked[4];

  // Goal Tracker State
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [targetCount, setTargetCount] = useState<number>(1000);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [dailyInput, setDailyInput] = useState<string>('');

  // Calculate Funds Logic
  const calculateFunds = useCallback(() => {
    const savedLedger = localStorage.getItem('bingo_ledger');
    let netBalance = 0;
    if (savedLedger) {
      try {
        const ledger = JSON.parse(savedLedger);
        if (Array.isArray(ledger)) {
          ledger.forEach((tx: any) => {
            netBalance += tx.amount || 0;
          });
        }
      } catch (e) {
        console.error("Failed to parse ledger", e);
      }
    }
    setHagioFunds(4900 + netBalance);
  }, []);

  // Recalculate funds whenever view changes (returning from betting page) or on mount
  useEffect(() => {
    calculateFunds();
  }, [currentView, calculateFunds]);

  // Load goal data
  useEffect(() => {
    const savedData = localStorage.getItem('bingo_goal_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setYear(parsed.year || String(new Date().getFullYear()));
        setMonth(parsed.month || String(new Date().getMonth() + 1));
        setTargetCount(parsed.targetCount || 1000);
        setCurrentCount(parsed.currentCount || 0);
      } catch (e) {
        console.error("Failed to parse saved goal data", e);
      }
    }
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Save goal data
  useEffect(() => {
    const dataToSave = {
      year,
      month,
      targetCount,
      currentCount
    };
    localStorage.setItem('bingo_goal_data', JSON.stringify(dataToSave));
  }, [year, month, targetCount, currentCount]);

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetGame = () => {
    setGrid(generateBingoGrid());
    setMarked(new Array(9).fill(false));
    setPreviousBingoCount(0);
    setBingoCount(0);
    setGameVersion(v => v + 1);
  };

  const resetMarksOnly = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const rect = document.getElementById('bingo-grid')?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      confetti({
        particleCount: 50,
        spread: 100,
        origin: {
          x: centerX / window.innerWidth,
          y: centerY / window.innerHeight
        },
        colors: ['#ffffff', '#a0a0a0'],
        gravity: 0.4,
        scalar: 0.8,
        drift: 0,
        ticks: 50
      });
    }

    // Reset counts in grid
    setGrid(prevGrid => prevGrid.map(cell => ({ ...cell, currentCount: 0 })));
    setMarked(new Array(9).fill(false));
    setPreviousBingoCount(0);
    setBingoCount(0);
  };

  const shuffleBoard = () => {
     setGrid(generateBingoGrid());
     setMarked(new Array(9).fill(false));
     setPreviousBingoCount(0);
     setBingoCount(0);
     setGameVersion(v => v + 1);
  }

  const handleUpdateGrid = (newGrid: BingoCellData[]) => {
    setGrid(newGrid);
    // When settings update, re-evaluate marked status (e.g. if target count was lowered)
    const newMarked = newGrid.map(cell => cell.currentCount >= cell.targetCount);
    setMarked(newMarked);
    setCurrentView('game');
  };

  const handleAddCalls = () => {
    const num = parseInt(dailyInput, 10);
    if (!isNaN(num) && num > 0) {
      const newTotal = currentCount + num;
      setCurrentCount(newTotal);
      setDailyInput('');
      triggerSmallConfetti(0.5, 0.3);

      // Trigger Quote
      const randomQuote = MANGA_QUOTES[Math.floor(Math.random() * MANGA_QUOTES.length)];
      setActiveQuote(randomQuote);
      
      // Clear previous timeout if exists
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current);
      }
      // Hide quote after 6 seconds
      quoteTimeoutRef.current = setTimeout(() => {
        setActiveQuote(null);
      }, 6000);
    }
  };

  const playCongratulatoryVoice = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("やったぁ！おめでとうっ！あなたの努力が報われたんだね！");
    utterance.lang = 'ja-JP';
    utterance.volume = 1;
    utterance.pitch = 1.5; 
    utterance.rate = 1.2;
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(
      (v) => v.lang === 'ja-JP' && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Kyoko'))
    );
    if (jpVoice) utterance.voice = jpVoice;
    window.speechSynthesis.speak(utterance);
  }, []);

  const playGakoSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const t = ctx.currentTime;

    // 1. The Heavy "Thud" (Square wave drop)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(150, t);
    osc1.frequency.exponentialRampToValueAtTime(0.01, t + 0.15); // Drop pitch fast
    gain1.gain.setValueAtTime(0.8, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // 2. The Metallic Click (High sawtooth)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(3000, t);
    osc2.frequency.exponentialRampToValueAtTime(100, t + 0.08); // Sharp drop
    gain2.gain.setValueAtTime(0.5, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.08);
  }, []);

  const triggerSmallConfetti = (x: number, y: number) => {
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { x, y },
      colors: isPachinkoMode ? ['#ff00ff', '#00ffff', '#ffff00'] : ['#f97316', '#eab308', '#ffffff'],
      disableForReducedMotion: true,
      scalar: 0.6
    });
  };

  const triggerBingoConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = isPachinkoMode ? ['#ff00ff', '#00ffff', '#ffff00'] : ['#f97316', '#ef4444', '#eab308'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleCellClick = useCallback((id: number) => {
    let newlyMarkedId = -1;

    setGrid(prevGrid => {
      // 1. Increment count
      const newGrid = prevGrid.map(cell => {
        if (cell.id === id) {
          return { ...cell, currentCount: cell.currentCount + 1 };
        }
        return cell;
      });

      // 2. Check if marking is needed
      const cell = newGrid.find(c => c.id === id);
      if (cell) {
        const isTargetReached = cell.currentCount >= cell.targetCount;
        
        setMarked(prevMarked => {
          if (isTargetReached && !prevMarked[id]) {
            // Became marked just now
            newlyMarkedId = id;
            const newMarked = [...prevMarked];
            newMarked[id] = true;
            return newMarked;
          }
          return prevMarked;
        });
      }

      return newGrid;
    });

    // Side effects logic needs to run after state update technically, but for confetti/sound it's ok here if we detect the change
    // Using setTimeout to break out of the state updater scope to ensure side effects run
    setTimeout(() => {
      if (newlyMarkedId !== -1) {
        triggerSmallConfetti(0.5, 0.5);
        if (newlyMarkedId === 4) playGakoSound();
      }
    }, 0);

  }, [playGakoSound]);

  useEffect(() => {
    const currentBingos = checkBingo(marked);
    
    if (currentBingos > previousBingoCount) {
      triggerBingoConfetti();
      playCongratulatoryVoice();
      setBingoCount(currentBingos);
      setPreviousBingoCount(currentBingos);
    } else if (currentBingos < previousBingoCount) {
        setBingoCount(currentBingos);
        setPreviousBingoCount(currentBingos);
    }
  }, [marked, previousBingoCount, playCongratulatoryVoice]);

  if (currentView === 'betting') {
    return <BettingPage onBack={() => setCurrentView('game')} />;
  }

  if (currentView === 'settings') {
    return (
      <SettingsPage 
        currentGrid={grid} 
        onSave={handleUpdateGrid} 
        onCancel={() => setCurrentView('game')} 
      />
    );
  }

  const markedCount = marked.filter(Boolean).length;
  const progressPercentage = Math.min(100, Math.max(0, (currentCount / targetCount) * 100));

  // --- COMPONENT FACTORIES FOR TRANSITIONS ---

  const SimpleHeader = (
    <header className="text-center mb-8 pt-4">
       <div className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-600 font-bold text-xs mb-2 tracking-wide">
         モチベーションUPビンゴ
       </div>
       <h1 className="text-2xl md:text-3xl font-rounded font-extrabold text-gray-800 leading-tight">
         萩尾瑠偉<br/>架電かけてモチベーションアップ
       </h1>
    </header>
  );

  const PachinkoHeader = (
    <header className="text-center mb-6 relative z-10 bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 rounded-t-3xl py-4 border-b-4 border-yellow-600 shadow-lg">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
      <div className="inline-flex items-center justify-center gap-2 mb-1 animate-pulse">
        <Coins className="text-yellow-400 drop-shadow-[0_0_10px_gold]" size={20} />
        <span className="text-yellow-400 font-bold tracking-widest text-xs">AMAZON OPERATION RUSH</span>
        <Coins className="text-yellow-400 drop-shadow-[0_0_10px_gold]" size={20} />
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-4 px-2">
        <SevenIcon className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
        <h1 className="text-2xl md:text-3xl font-black font-rounded tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-yellow-600 drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] z-10">
           萩尾瑠偉<br/><span className="text-3xl md:text-4xl text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">架電EX</span>
        </h1>
        <SevenIcon className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
      </div>
      <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500 animate-ping delay-75"></div>
    </header>
  );

  const SimpleGoalTracker = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-12 bg-gray-50 text-gray-700 text-center font-bold rounded focus:ring-2 focus:ring-orange-200 outline-none" />
          <span className="text-gray-400">/</span>
          <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} className="w-8 bg-gray-50 text-gray-700 text-center font-bold rounded focus:ring-2 focus:ring-orange-200 outline-none" />
          <span className="text-xs font-bold text-gray-500">目標</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
             <input type="number" value={currentCount} onChange={(e) => { const val = parseInt(e.target.value); setCurrentCount(isNaN(val) ? 0 : Math.max(0, val)); }} className="text-xl font-black text-orange-600 w-20 text-right focus:outline-none border-b border-dashed border-gray-300" />
             <span className="text-xs text-gray-400 mx-1">/</span>
             <input type="number" value={targetCount} onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 0))} className="text-sm font-bold text-gray-500 w-16 text-right focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4 inner-shadow">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-gradient-to-r from-orange-300 to-orange-500 rounded-full"></motion.div>
      </div>

      <div className="flex gap-2">
         <input 
            type="number" 
            placeholder="今日の架電数" 
            value={dailyInput} 
            onChange={(e) => setDailyInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleAddCalls()} 
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none transition-all placeholder-gray-400" 
         />
         <button 
            onClick={handleAddCalls} 
            disabled={!dailyInput} 
            className="bg-orange-500 hover:bg-orange-600 text-white w-12 rounded-xl shadow-lg shadow-orange-200 active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center disabled:bg-gray-300 disabled:shadow-none"
         >
            <Plus size={24} />
         </button>
      </div>
    </div>
  );

  const PachinkoGoalTracker = (
    <div className="bg-black rounded-lg border-2 border-gray-700 p-3 mb-6 relative shadow-[inset_0_0_20px_rgba(0,0,0,1)] transition-all duration-500">
       <div className="flex justify-between items-center mb-2 font-digital text-sm text-cyan-400">
         <div className="flex items-center gap-1">
           <span className="opacity-70">DATE:</span>
           <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-12 bg-transparent text-cyan-300 text-right focus:outline-none border-b border-cyan-900" />
           <span className="opacity-70">/</span>
           <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} className="w-8 bg-transparent text-cyan-300 text-right focus:outline-none border-b border-cyan-900" />
         </div>
         <span className="text-xs text-yellow-500 animate-pulse">CREDIT</span>
       </div>

       <div className="h-8 bg-gray-900 rounded border border-gray-600 relative overflow-hidden mb-3">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} className="h-full bg-gradient-to-r from-green-900 via-green-500 to-green-400 shadow-[0_0_15px_#22c55e]"></motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20 font-digital text-white font-bold tracking-widest drop-shadow-md mix-blend-difference">
             {Math.round(progressPercentage)}%
          </div>
       </div>

       <div className="flex justify-between items-end px-2 font-digital">
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-500 tracking-wider">CURRENT</span>
             <input type="number" value={currentCount} onChange={(e) => { const val = parseInt(e.target.value); setCurrentCount(isNaN(val) ? 0 : Math.max(0, val)); }} className="bg-transparent text-3xl text-green-400 font-black w-32 focus:outline-none drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-gray-500 tracking-wider">TARGET</span>
             <input type="number" value={targetCount} onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 0))} className="bg-transparent text-xl text-yellow-500 font-bold w-24 text-right focus:outline-none" />
          </div>
       </div>

       <div className="mt-3 bg-gray-900 p-2 rounded flex gap-2 border-t border-gray-800">
          <input type="number" placeholder="Count" value={dailyInput} onChange={(e) => setDailyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCalls()} className="flex-1 bg-black border border-gray-700 text-green-400 font-digital px-3 rounded focus:border-green-500 focus:outline-none focus:shadow-[0_0_10px_rgba(34,197,94,0.3)] placeholder-gray-700" />
          <button onClick={handleAddCalls} disabled={!dailyInput} className="bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-900 active:to-black text-white px-4 rounded border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all shadow-lg flex items-center justify-center">
             <Plus size={20} className={dailyInput ? "text-green-400 drop-shadow-[0_0_5px_green]" : "text-gray-500"} />
          </button>
       </div>
    </div>
  );

  const SimpleControls = (
    <div className="mt-8 flex gap-3 justify-center">
      <button onClick={resetMarksOnly} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all active:scale-95">
         <RefreshCcw size={18} />
         <span>リセット</span>
      </button>
      <button onClick={shuffleBoard} className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 active:shadow-none">
         <Shuffle size={18} />
         <span>シャッフル</span>
      </button>
    </div>
  );

  const PachinkoControls = (
    <div className="mt-10 flex gap-4 justify-end items-end">
      <button onClick={resetMarksOnly} className="group relative flex flex-col items-center justify-center w-20 h-20 rounded-full bg-red-700 border-4 border-red-900 shadow-[0_5px_0_#3f0f0f,0_10px_10px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 active:border-t-4 transition-all">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-red-400 opacity-30"></div>
        <RotateCcw size={24} className="text-white drop-shadow-md mb-1" />
        <span className="text-[9px] font-bold text-red-100">RESET</span>
      </button>
      <button onClick={shuffleBoard} className="group relative flex flex-col items-center justify-center w-24 h-24 rounded-full bg-yellow-600 border-4 border-yellow-800 shadow-[0_5px_0_#5a3a0a,0_10px_15px_rgba(0,0,0,0.6)] active:shadow-none active:translate-y-1 active:border-t-4 transition-all">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-yellow-300 opacity-40 animate-pulse"></div>
        <Siren size={32} className="text-white drop-shadow-md mb-1" />
        <span className="text-[10px] font-black text-yellow-100 tracking-wider">BET / SHUFFLE</span>
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen py-4 px-2 flex flex-col items-center overflow-x-hidden font-sans select-none transition-colors duration-700 ${isPachinkoMode ? 'bg-[#050505] text-gray-100' : 'bg-orange-50 text-gray-800'}`}>
      
      {/* Settings Button (Fixed Top Left) */}
      <motion.button
        whileHover={{ rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCurrentView('settings')}
        className={`fixed top-4 left-4 z-50 p-2 rounded-full transition-colors duration-500 shadow-lg ${isPachinkoMode ? 'bg-gray-800 text-gray-300 border border-gray-600 hover:text-white' : 'bg-white text-gray-500 border border-gray-200 hover:text-orange-500'}`}
      >
        <Settings size={24} />
      </motion.button>

      {/* Wallet Balance Display (Fixed Top Right) */}
      <div className={`fixed top-4 right-4 z-50 flex flex-col items-end transition-all duration-500 ${isPachinkoMode ? 'scale-100' : 'scale-90'}`}>
        <div className="bg-black/90 border-2 border-yellow-600 rounded-lg p-2 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center gap-3 backdrop-blur-md">
           <div className="bg-yellow-900/40 p-1.5 rounded-full border border-yellow-700">
             <Wallet size={16} className="text-yellow-400" />
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[9px] text-yellow-500 font-bold tracking-widest">萩尾 FUNDS</span>
             <div className="font-digital text-xl text-yellow-300 font-bold tracking-wider leading-none">
               ¥{hagioFunds.toLocaleString()}
             </div>
           </div>
        </div>
      </div>

      {/* Flower Pot Display (Fixed Bottom Left) */}
      <FlowerPot 
        month={month} 
        progress={progressPercentage} 
        isPachinkoMode={isPachinkoMode} 
        activeQuote={activeQuote}
      />

      {/* Wrapper to control width and centering */}
      <div className={`w-full max-w-xl transition-all duration-700 ${isPachinkoMode ? 'border-8 border-gray-800 rounded-[40px] p-2 bg-gradient-to-b from-gray-900 to-black shadow-[0_0_50px_rgba(0,0,0,1)]' : ''} relative pb-20`}>
        
        {/* Pachinko Decorative Layers */}
        <div className={`absolute inset-0 rounded-[32px] border-4 border-gray-600 pointer-events-none transition-opacity duration-700 ${isPachinkoMode ? 'opacity-50' : 'opacity-0'}`}></div>
        <div className={`absolute inset-2 rounded-[28px] border-2 border-yellow-900/30 pointer-events-none transition-opacity duration-700 ${isPachinkoMode ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* HEADER SECTION */}
        <TransitionSection showSecond={isPachinkoMode}>
          {SimpleHeader}
          {PachinkoHeader}
        </TransitionSection>

        {/* Main Interface Content */}
        <div className={`relative transition-all duration-500 ${isPachinkoMode ? 'bg-[#111] rounded-b-3xl p-4 border-t border-gray-800' : 'px-4'}`}>
          
          {/* GOAL TRACKER SECTION */}
          <TransitionSection showSecond={isPachinkoMode}>
            {SimpleGoalTracker}
            {PachinkoGoalTracker}
          </TransitionSection>

          {/* STATS SECTION */}
          <Stats bingoCount={bingoCount} markedCount={markedCount} isPachinkoMode={isPachinkoMode} />

          <div className="relative">
             {/* GOGO Lamp - Only in Pachinko Mode */}
             <div className={`absolute -bottom-4 -left-3 z-30 transition-all duration-700 ${isPachinkoMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
               <div className="bg-black rounded-lg p-2 border-2 border-gray-800 w-28 h-20 flex items-center justify-center relative shadow-[0_0_20px_black]">
                  <div className={`relative z-10 font-black italic tracking-tighter text-center leading-none gogo-glow`}>
                     <div className="text-3xl text-[#ff00de] scale-x-125 transform origin-bottom">GOGO!</div>
                     <div className="text-[10px] text-[#ff00de] tracking-[0.2em] mt-1">CHANCE</div>
                  </div>
                  <div className={`absolute inset-0 bg-[#ff00de] blur-xl rounded-full opacity-20 animate-pulse`}></div>
               </div>
             </div>

             {/* Bingo Grid Container */}
             <motion.div 
               id="bingo-grid"
               animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
               transition={{ duration: 0.2 }}
               className={`w-full transition-all duration-700 ${isPachinkoMode ? 'bg-gradient-to-b from-black to-gray-900 p-3 rounded-lg border-[6px] border-gray-600 shadow-[inset_0_0_30px_rgba(0,0,0,1)]' : ''} relative z-10`}
             >
               <div className="grid grid-cols-3 gap-2">
                 <AnimatePresence mode="wait">
                   <motion.div key={gameVersion} className="contents">
                     {grid.map((cell, index) => (
                       <BingoCell
                         key={cell.id}
                         data={cell}
                         index={index}
                         isMarked={marked[cell.id]}
                         onToggle={handleCellClick}
                         isPachinkoMode={isPachinkoMode}
                       />
                     ))}
                   </motion.div>
                 </AnimatePresence>
               </div>
             </motion.div>
          </div>

          {/* CONTROLS SECTION */}
          <TransitionSection showSecond={isPachinkoMode}>
            {SimpleControls}
            {PachinkoControls}
          </TransitionSection>

        </div>
      </div>
      
      <div className={`mt-4 text-gray-600 text-[10px] font-digital tracking-widest transition-opacity duration-700 ${isPachinkoMode ? 'opacity-100' : 'opacity-0'}`}>
         MACHINE ID: 777-AMZN-SALES
      </div>

      {/* Floating Bet Button (Bottom Right) */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCurrentView('betting')}
        className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-200 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center group"
      >
        <div className="absolute inset-0 rounded-full border border-yellow-700/50"></div>
        <Coins className="text-white drop-shadow-md" size={24} />
        <span className="text-[10px] font-black text-white drop-shadow-md leading-none mt-1">掛け金</span>
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
      </motion.button>

    </div>
  );
};

export default App;