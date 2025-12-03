import { CENTER_PHRASE, OBJECTIONS, WINNING_LINES } from '../constants';
import { BingoCellData } from '../types';

export const generateBingoGrid = (): BingoCellData[] => {
  // Shuffle objections
  const shuffled = [...OBJECTIONS].sort(() => 0.5 - Math.random());
  
  // Take 8 items
  const selected = shuffled.slice(0, 8);
  
  // Construct grid with center fixed at index 4
  const grid: BingoCellData[] = [];
  let objectionIndex = 0;

  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      grid.push({ 
        id: i, 
        text: CENTER_PHRASE, 
        isCenter: true,
        currentCount: 0,
        targetCount: 1 
      });
    } else {
      grid.push({ 
        id: i, 
        text: selected[objectionIndex], 
        isCenter: false,
        currentCount: 0,
        targetCount: 1
      });
      objectionIndex++;
    }
  }
  
  return grid;
};

export const checkBingo = (marked: boolean[]): number => {
  let bingoCount = 0;
  for (const line of WINNING_LINES) {
    if (line.every(index => marked[index])) {
      bingoCount++;
    }
  }
  return bingoCount;
};