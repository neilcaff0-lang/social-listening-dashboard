import { vi } from 'vitest';
import { RawDataRow, FilterState } from '@/types/index';

interface DataStoreState {
  rawData: RawDataRow[];
  filters: FilterState;
}

const createMockStore = (state: Partial<DataStoreState> = {}) => ({
  rawData: state.rawData || [],
  filters: state.filters || {
    categories: [],
    timeFilter: { months: [] },
    quadrants: [],
    keyword: '',
  },
  setRawData: vi.fn(),
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
});

export const mockUseDataStore = vi.fn();

vi.mock('@/store/useDataStore', () => ({
  useDataStore: mockUseDataStore,
}));

export default createMockStore;
