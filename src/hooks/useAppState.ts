import { useContext } from 'react';
import { AppContext, type AppContextType } from '../context/AppContext';

export function useAppState(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
