export interface BingoCellData {
  id: number;
  text: string;
  isCenter: boolean;
  currentCount: number;
  targetCount: number;
}

export type GridState = boolean[];

export interface WinLine {
  indices: number[];
}