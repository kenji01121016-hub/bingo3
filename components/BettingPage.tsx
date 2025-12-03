import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, PlusCircle, MinusCircle, Trash2, Save, History, Users, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface BettingPageProps {
  onBack: () => void;
}

interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  lines?: number;
}

interface PlayerSettings {
  me: string;
  opponent1: string;
  opponent2: string;
}

const INITIAL_FUNDS = {
  me: 4900,
  opponent1: 4900,
  opponent2: 5000
};

const BettingPage: React.FC<BettingPageProps> = ({ onBack }) => {
  // --- LEDGER STATE ---
  const [ledger, setLedger] = useState<Transaction[]>([]);
  const [players, setPlayers] = useState<PlayerSettings>({ me: '萩尾', opponent1: '立石', opponent2: '下田' });
  const [inputMode, setInputMode] = useState<'bingo' | 'penalty'>('bingo');
  const [selectedLines, setSelectedLines] = useState<number>(1);
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Load Data
  useEffect(() => {
    // Load Ledger
    const savedLedger = localStorage.getItem('bingo_ledger');
    if (savedLedger) {
      try {
        setLedger(JSON.parse(savedLedger));
      } catch (e) { console.error(e); }
    }

    // Load Players
    const savedPlayers = localStorage.getItem('bingo_players_v2');
    if (savedPlayers) {
      try {
        setPlayers(JSON.parse(savedPlayers));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Save Players
  const handleSavePlayers = (key: keyof PlayerSettings, value: string) => {
    const newPlayers = { ...players, [key]: value };
    setPlayers(newPlayers);
    localStorage.setItem('bingo_players_v2', JSON.stringify(newPlayers));
  };

  // Add Transaction
  const handleAddTransaction = () => {
    const isPenalty = inputMode === 'penalty';
    const amount = isPenalty ? -400 : selectedLines * 100; // Penalty is fixed at 400 (200x2)
    
    const description = isPenalty
      ? `マス0個 / ペナルティ (${players.opponent1}, ${players.opponent2}へ)`
      : `BINGO達成 (${selectedLines}ライン)`;

    const newTx: Transaction = {
      id: Date.now(),
      date: inputDate,
      type: isPenalty ? 'expense' : 'income',
      amount: amount,
      description: description,
      lines: isPenalty ? undefined : selectedLines
    };

    const newLedger = [newTx, ...ledger];
    setLedger(newLedger);
    localStorage.setItem('bingo_ledger', JSON.stringify(newLedger));
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: number) => {
    const newLedger = ledger.filter(tx => tx.id !== id);
    setLedger(newLedger);
    localStorage.setItem('bingo_ledger', JSON.stringify(newLedger));
  };

  // Calculate Running Balance for Table
  const calculateBalance = (index: number) => {
    const chronological = [...ledger].sort((a, b) => a.id - b.id);
    const currentItem = ledger[index];
    if (!currentItem) return 0;
    
    let balance = 0;
    for (const tx of chronological) {
      balance += tx.amount;
      if (tx.id === currentItem.id) break;
    }
    return balance;
  };

  // Calculate Total Standings
  const standings = useMemo(() => {
    let meTotal = 0;
    let opp1Total = 0;
    let opp2Total = 0;

    ledger.forEach(tx => {
      // Me (User)
      meTotal += tx.amount;

      if (tx.type === 'income') {
        // Bingo Income: User gains (+). Opponents pay (-).
        // Split equally between the two opponents.
        const paymentPerOpponent = tx.amount / 2;
        opp1Total -= paymentPerOpponent;
        opp2Total -= paymentPerOpponent;
      } else if (tx.type === 'expense') {
        // Penalty Expense: User pays (-). Opponents gain (+).
        // tx.amount is negative (e.g. -400).
        // Split equally (absolute value).
        const gainPerOpponent = Math.abs(tx.amount) / 2;
        opp1Total += gainPerOpponent;
        opp2Total += gainPerOpponent;
      }
    });

    return { 
      meTotal, 
      opp1Total, 
      opp2Total,
      meFunds: INITIAL_FUNDS.me + meTotal,
      opp1Funds: INITIAL_FUNDS.opponent1 + opp1Total,
      opp2Funds: INITIAL_FUNDS.opponent2 + opp2Total
    };
  }, [ledger]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 font-sans flex flex-col items-center pb-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-yellow-700 pb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors group"
          >
            <div className="bg-yellow-900/30 p-2 rounded-full border border-yellow-700 group-hover:border-yellow-500">
              <ArrowLeft size={20} />
            </div>
            <span className="font-bold text-sm tracking-widest">RETURN</span>
          </button>
          
          <div className="text-right">
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
              MY WALLET
            </h1>
            <div className="text-[10px] text-yellow-600 tracking-[0.3em] font-bold">INCOME & EXPENDITURE</div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="mb-8">
           
           {/* Player Settings */}
           <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg">
              <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-xs tracking-wider border-b border-gray-700 pb-2">
                 <Users size={16} />
                 <span>PLAYER SETTINGS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div>
                    <label className="text-[10px] text-gray-500 block mb-1">PLAYER 1 (自分)</label>
                    <input 
                      type="text" 
                      value={players.me} 
                      onChange={(e) => handleSavePlayers('me', e.target.value)}
                      className="w-full bg-black border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none transition-colors text-sm"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-500 block mb-1">PAYEE 1 (支払先)</label>
                    <input 
                      type="text" 
                      value={players.opponent1} 
                      onChange={(e) => handleSavePlayers('opponent1', e.target.value)}
                      className="w-full bg-black border border-gray-600 rounded px-3 py-2 text-white focus:border-red-500 outline-none transition-colors text-sm"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-500 block mb-1">PAYEE 2 (支払先)</label>
                    <input 
                      type="text" 
                      value={players.opponent2} 
                      onChange={(e) => handleSavePlayers('opponent2', e.target.value)}
                      className="w-full bg-black border border-gray-600 rounded px-3 py-2 text-white focus:border-red-500 outline-none transition-colors text-sm"
                    />
                 </div>
              </div>
           </div>

           {/* Input Form */}
           <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-xl p-1 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] mb-6">
              {/* Tabs */}
              <div className="flex mb-4 bg-black rounded-lg p-1">
                 <button 
                   onClick={() => setInputMode('bingo')}
                   className={`flex-1 py-2 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${inputMode === 'bingo' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                    <PlusCircle size={16} />
                    <span>収入 (BINGO)</span>
                 </button>
                 <button 
                   onClick={() => setInputMode('penalty')}
                   className={`flex-1 py-2 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${inputMode === 'penalty' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                    <MinusCircle size={16} />
                    <span>支出 (マス0個)</span>
                 </button>
              </div>

              <div className="px-4 pb-4">
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-700">
                       <span className="text-xs text-gray-400 font-bold px-2">日付</span>
                       <input 
                         type="date" 
                         value={inputDate} 
                         onChange={(e) => setInputDate(e.target.value)} 
                         className="bg-transparent text-white font-mono outline-none text-right"
                       />
                    </div>

                    {inputMode === 'bingo' ? (
                       <div className="flex items-center justify-between bg-green-900/20 p-4 rounded border border-green-800">
                          <div>
                             <label className="block text-xs text-green-400 font-bold mb-1">ビンゴ達成ライン数</label>
                             <select 
                               value={selectedLines} 
                               onChange={(e) => setSelectedLines(Number(e.target.value))}
                               className="bg-black text-white border border-green-700 rounded px-3 py-1 outline-none text-lg font-bold w-24"
                             >
                                {[...Array(9)].map((_, i) => (
                                   <option key={i} value={i}>{i}</option>
                                ))}
                             </select>
                             <span className="ml-2 text-sm">Lines</span>
                          </div>
                          <div className="text-right">
                             <div className="text-xs text-gray-400">獲得金額</div>
                             <div className="text-2xl font-black text-green-400 font-digital">
                                +¥{(selectedLines * 100).toLocaleString()}
                             </div>
                             <div className="text-[10px] text-green-600 mt-1">
                               {players.opponent1}, {players.opponent2}が折半
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="bg-red-900/20 p-4 rounded border border-red-800">
                          <div className="flex justify-between items-center mb-2 pb-2 border-b border-red-900/50">
                             <div className="text-sm font-bold">{players.opponent1} さんへ</div>
                             <div className="font-mono text-red-400">¥200</div>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                             <div className="text-sm font-bold">{players.opponent2} さんへ</div>
                             <div className="font-mono text-red-400">¥200</div>
                          </div>
                          <div className="flex justify-between items-end border-t border-red-900/50 pt-2">
                             <div className="text-xs text-gray-400 font-bold">支払い合計</div>
                             <div className="text-3xl font-black text-red-500 font-digital leading-none">
                                -¥400
                             </div>
                          </div>
                       </div>
                    )}

                    <button 
                      onClick={handleAddTransaction}
                      className={`w-full py-4 rounded-lg font-black text-lg shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2 ${inputMode === 'bingo' ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-900/50' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/50'}`}
                    >
                       <Save size={20} />
                       <span>
                          {inputMode === 'bingo' ? '記録を保存' : 'マス0個 / 支払い確定'}
                       </span>
                    </button>
                 </div>
              </div>
           </div>

           {/* Table */}
           <div className="relative">
              <div className="flex items-center gap-2 mb-3 text-yellow-500 font-bold text-xs tracking-wider">
                 <History size={16} />
                 <span>TRANSACTION HISTORY</span>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl max-h-[300px] overflow-y-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-black z-10 shadow-sm">
                       <tr className="text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-700">
                          <th className="p-3 font-medium">日付</th>
                          <th className="p-3 font-medium">内容</th>
                          <th className="p-3 font-medium text-right">収支</th>
                          <th className="p-3 font-medium text-right">残高</th>
                          <th className="p-3 w-8"></th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {ledger.length === 0 ? (
                          <tr>
                             <td colSpan={5} className="p-8 text-center text-gray-600">記録がありません</td>
                          </tr>
                       ) : (
                          ledger.map((tx, index) => {
                             const balance = calculateBalance(index);
                             const isPlus = tx.type === 'income';
                             return (
                                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                   <td className="p-3 text-gray-300 font-mono text-xs">{tx.date.substring(5)}</td>
                                   <td className="p-3">
                                      <div className="font-bold text-gray-200 text-xs sm:text-sm">{tx.description}</div>
                                   </td>
                                   <td className={`p-3 text-right font-mono font-bold ${isPlus ? 'text-green-400' : 'text-red-500'}`}>
                                      {isPlus ? '+' : ''}¥{Math.abs(tx.amount)}
                                   </td>
                                   <td className={`p-3 text-right font-mono font-bold ${balance >= 0 ? 'text-blue-300' : 'text-red-400'}`}>
                                      ¥{balance.toLocaleString()}
                                   </td>
                                   <td className="p-3 text-right">
                                      <button 
                                        onClick={() => handleDeleteTransaction(tx.id)}
                                        className="text-gray-600 hover:text-red-500 transition-colors"
                                      >
                                         <Trash2 size={14} />
                                      </button>
                                   </td>
                                </tr>
                             );
                          })
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* --- TOTAL STANDING (NEW SECTION) --- */}
        <div className="bg-gradient-to-r from-gray-900 to-black border-t-2 border-yellow-600 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.8)] p-6">
           <div className="flex items-center justify-center gap-2 mb-6">
              <Wallet size={20} className="text-yellow-500" />
              <h2 className="text-lg font-black tracking-widest text-white">TOTAL STANDING</h2>
           </div>

           <div className="flex flex-col gap-4">
              {/* Me (Main) */}
              <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700 relative overflow-hidden shadow-lg">
                 <div className="flex justify-between items-center relative z-10 mb-2">
                    <div>
                       <div className="text-xs text-gray-400 font-bold mb-1">{players.me} (YOU)</div>
                       <div className="text-[10px] text-gray-500 uppercase tracking-wide">Net Balance</div>
                    </div>
                    <div className={`text-3xl font-black font-digital tracking-wider ${standings.meTotal >= 0 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.4)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}>
                       {standings.meTotal >= 0 ? '+' : ''}¥{standings.meTotal.toLocaleString()}
                    </div>
                 </div>
                 <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-[10px] text-yellow-500 font-bold tracking-widest">現在の所持金</span>
                    <span className="font-digital text-xl text-yellow-300 font-bold tracking-wider">¥{standings.meFunds.toLocaleString()}</span>
                 </div>
                 {standings.meTotal >= 0 ? (
                    <TrendingUp className="absolute right-2 bottom-[15px] text-green-900/20 w-24 h-24 pointer-events-none" />
                 ) : (
                    <TrendingDown className="absolute right-2 bottom-[15px] text-red-900/20 w-24 h-24 pointer-events-none" />
                 )}
              </div>

              {/* Opponents (Grid) */}
              <div className="grid grid-cols-2 gap-4">
                 {/* Opponent 1 */}
                 <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 flex flex-col shadow-md">
                    <div className="flex flex-col items-center mb-2">
                       <div className="text-xs text-gray-400 font-bold mb-1">{players.opponent1}</div>
                       <div className="text-[10px] text-gray-500 mb-1">Net Balance</div>
                       <div className={`text-xl font-bold font-digital ${standings.opp1Total > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {standings.opp1Total > 0 ? '+' : ''}¥{standings.opp1Total.toLocaleString()}
                       </div>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-auto flex flex-col items-center">
                       <span className="text-[9px] text-yellow-500 font-bold tracking-widest mb-1">所持金</span>
                       <span className="font-digital text-lg text-yellow-300 font-bold">¥{standings.opp1Funds.toLocaleString()}</span>
                    </div>
                 </div>
                 {/* Opponent 2 */}
                 <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 flex flex-col shadow-md">
                    <div className="flex flex-col items-center mb-2">
                       <div className="text-xs text-gray-400 font-bold mb-1">{players.opponent2}</div>
                       <div className="text-[10px] text-gray-500 mb-1">Net Balance</div>
                       <div className={`text-xl font-bold font-digital ${standings.opp2Total > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {standings.opp2Total > 0 ? '+' : ''}¥{standings.opp2Total.toLocaleString()}
                       </div>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-auto flex flex-col items-center">
                       <span className="text-[9px] text-yellow-500 font-bold tracking-widest mb-1">所持金</span>
                       <span className="font-digital text-lg text-yellow-300 font-bold">¥{standings.opp2Funds.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default BettingPage;