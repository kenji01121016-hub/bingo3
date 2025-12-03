import React, { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { BingoCellData } from '../types';

interface SettingsPageProps {
  currentGrid: BingoCellData[];
  onSave: (newGrid: BingoCellData[]) => void;
  onCancel: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentGrid, onSave, onCancel }) => {
  // Deep copy for local editing state
  const [editedGrid, setEditedGrid] = useState<BingoCellData[]>(JSON.parse(JSON.stringify(currentGrid)));

  const handleTextChange = (id: number, text: string) => {
    setEditedGrid(prev => prev.map(cell => 
      cell.id === id ? { ...cell, text } : cell
    ));
  };

  const handleTargetChange = (id: number, targetCount: string) => {
    const count = Math.max(1, parseInt(targetCount) || 1);
    setEditedGrid(prev => prev.map(cell => 
      cell.id === id ? { ...cell, targetCount: count } : cell
    ));
  };

  const handleSave = () => {
    onSave(editedGrid);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 font-sans flex flex-col items-center pb-20">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-700 pb-4">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">CANCEL</span>
          </button>
          
          <h1 className="text-xl font-bold tracking-wider text-gray-200">
            GRID SETTINGS
          </h1>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-2 mb-4 text-yellow-500 text-xs font-bold bg-yellow-900/20 p-2 rounded">
            <AlertCircle size={16} />
            <span>配置、テキスト、目標回数を編集できます</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {editedGrid.map((cell) => (
              <div key={cell.id} className="relative flex flex-col gap-2">
                {cell.isCenter ? (
                  <div className="h-28 w-full bg-yellow-900/30 border-2 border-yellow-700 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-yellow-500 font-bold text-sm">{cell.text}</span>
                    <div className="mt-2 text-xs text-yellow-600 bg-yellow-900/50 px-2 rounded">
                      Target: {cell.targetCount}
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={cell.text}
                      onChange={(e) => handleTextChange(cell.id, e.target.value)}
                      className="h-20 w-full bg-black border border-gray-600 rounded-lg p-2 text-center text-xs text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none leading-tight"
                      placeholder="テキスト"
                    />
                    <div className="flex items-center bg-gray-800 rounded border border-gray-700">
                      <span className="px-2 text-[10px] text-gray-500 border-r border-gray-700">目標</span>
                      <input 
                        type="number"
                        min="1"
                        value={cell.targetCount}
                        onChange={(e) => handleTargetChange(cell.id, e.target.value)}
                        className="w-full bg-transparent text-center text-sm font-bold text-green-400 py-1 focus:outline-none"
                      />
                    </div>
                  </>
                )}
                <div className="absolute -top-2 -left-1 bg-gray-800 px-1 rounded text-[9px] text-gray-500 font-mono border border-gray-700">
                  #{cell.id + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black text-lg shadow-lg shadow-green-900/50 active:translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          <span>変更を保存して戻る</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;