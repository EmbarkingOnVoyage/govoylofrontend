import { useState, useCallback } from 'react';

// Strict data sharing schema
export interface ISearchQuery {
  destinationId: string;
  checkInDate: string;
  guestsCount: number;
}

// Simple atomic shared state container
export function useSearchStore() {
  const [searchState, setSearchState] = useState<ISearchQuery>({
    destinationId: '',
    checkInDate: '',
    guestsCount: 1,
  });

  const updateSearchQuery = useCallback((updates: Partial<ISearchQuery>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  }, []);

  return { searchState, updateSearchQuery };
}
