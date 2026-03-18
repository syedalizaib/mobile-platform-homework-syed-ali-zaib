import { create } from 'zustand';

export type FilterType = 'Category' | 'Sort';
export type SortType = 'A-Z' | 'Recent';

interface ExploreFilterState {
  filter: FilterType;
  sort: SortType;
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType) => void;
}

export const useExploreFilterStore = create<ExploreFilterState>((set) => ({
  filter: 'Category',
  sort: 'A-Z',
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
}));
