export type TreeStatus = 'growing' | 'success' | 'withered';

export interface Tree {
  id: string;
  status: TreeStatus;
  timestamp: number;
  duration: number; // in minutes
  species: string; // e.g., 'oak', 'pine', 'sakura'
}

export interface ForestStats {
  grown: number;
  withered: number;
  totalFocusTime: number; // in minutes
  coins: number;
  unlockedTrees: string[];
}

export interface TreeSpecies {
  id: string;
  name: string;
  cost: number;
  color: string;
  icon: string;
}
