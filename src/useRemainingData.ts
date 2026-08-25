import { createContext, createElement, ReactNode, useContext, useEffect, useState } from 'react';
import { AppData } from './types';
import { clearData, initialData, loadData, saveData } from './storage';

type RemainingDataContextValue = {
  data: AppData | null;
  update: (next: AppData) => void;
  reset: () => Promise<void>;
};

const RemainingDataContext = createContext<RemainingDataContextValue | null>(null);

export function RemainingDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  useEffect(() => { loadData().then(setData); }, []);
  const update = (next: AppData) => { setData(next); void saveData(next); };
  const reset = async () => { await clearData(); setData(initialData); };
  return createElement(RemainingDataContext.Provider, { value: { data, update, reset } }, children);
}

export function useRemainingData() {
  const context = useContext(RemainingDataContext);
  if (!context) throw new Error('useRemainingData must be used within RemainingDataProvider');
  return context;
}
