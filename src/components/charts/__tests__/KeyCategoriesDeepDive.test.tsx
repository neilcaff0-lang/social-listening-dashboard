import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KeyCategoriesDeepDive from '../KeyCategoriesDeepDive';
import { mockEmptyFilterState, mockDataset, createMockRawData } from '@/test/mocks/data';

// Create mock function
const mockUseDataStore = vi.fn();

// Mock the store
vi.mock('@/store/useDataStore', () => ({
  useDataStore: (...args: unknown[]) => mockUseDataStore(...args),
}));

describe('KeyCategoriesDeepDive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when no data', () => {
    mockUseDataStore.mockReturnValue({
      rawData: [],
      filters: mockEmptyFilterState,
      categories: [],
    });

    const { container } = render(<KeyCategoriesDeepDive />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when only lifestyle data', () => {
    const lifestyleData = [
      createMockRawData({ CATEGORY: 'lifestyle', KEYWORDS: '生活', TTL_Buzz: 1000 }),
      createMockRawData({ CATEGORY: '生活方式', KEYWORDS: '方式', TTL_Buzz: 800 }),
    ];
    mockUseDataStore.mockReturnValue({
      rawData: lifestyleData,
      filters: mockEmptyFilterState,
      categories: [],
    });

    const { container } = render(<KeyCategoriesDeepDive />);
    expect(container.firstChild).toBeNull();
  });

  it('renders category cards for each key category', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    expect(screen.getByText('裤子')).toBeInTheDocument();
    expect(screen.getByText('包')).toBeInTheDocument();
    expect(screen.getByText('鞋')).toBeInTheDocument();
  });

  it('displays correct total buzz values', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    // 鞋的总声量最高: 5000 + 3000 = 8000
    expect(screen.getByText('8.0K')).toBeInTheDocument();
    // 包和裤子都是7.5K，使用getAllByText
    const sevenFiveK = screen.getAllByText('7.5K');
    expect(sevenFiveK.length).toBeGreaterThanOrEqual(2);
  });

  it('displays correct YOY percentages', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    // 检查有正增长的数据显示（可能是格式化的百分比）
    const positiveYoy = screen.getAllByText(/\+.*%/);
    expect(positiveYoy.length).toBeGreaterThan(0);
  });

  it('shows top keywords when category is selected', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    // 点击鞋品类卡片
    const shoeCard = screen.getByText('鞋').closest('button');
    fireEvent.click(shoeCard!);

    // 应该显示Top关键词
    expect(screen.getByText('跑步鞋')).toBeInTheDocument();
    expect(screen.getByText('休闲鞋')).toBeInTheDocument();
  });

  it('handles category deselection', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    // 先选中一个品类
    const shoeCard = screen.getByText('鞋').closest('button');
    fireEvent.click(shoeCard!);

    // 再次点击取消选中
    fireEvent.click(shoeCard!);

    // 应该回到初始状态，关键词不显示
    expect(screen.queryByText('热门关键词排行')).not.toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const largeDataset = mockDataset.map(row => ({
      ...row,
      TTL_Buzz: row.TTL_Buzz * 1000,
    }));

    mockUseDataStore.mockReturnValue({
      rawData: largeDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    // 应该显示为K格式
    expect(screen.getByText('8000.0K')).toBeInTheDocument();
  });

  it('handles negative YOY values correctly', () => {
    const negativeDataset = mockDataset.map(row => ({
      ...row,
      TTL_Buzz_YOY: -0.15,
    }));

    mockUseDataStore.mockReturnValue({
      rawData: negativeDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    // 应该显示负号 - 使用更灵活的匹配
    const negativeYoy = screen.getAllByText(/-\d+/);
    expect(negativeYoy.length).toBeGreaterThan(0);
  });

  it('handles single category available', () => {
    const singleCategoryData = mockDataset.filter(row => row.CATEGORY === '裤子');

    mockUseDataStore.mockReturnValue({
      rawData: singleCategoryData,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    expect(screen.getByText('裤子')).toBeInTheDocument();
    expect(screen.queryByText('包')).not.toBeInTheDocument();
    expect(screen.queryByText('鞋')).not.toBeInTheDocument();
  });

  it('handles error in data processing gracefully', () => {
    // 模拟错误情况 - 空数组应该正常处理
    mockUseDataStore.mockReturnValue({
      rawData: [],
      filters: mockEmptyFilterState,
      categories: [],
    });

    // 不应该抛出错误
    expect(() => render(<KeyCategoriesDeepDive />)).not.toThrow();
  });

  it('renders chart components', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
      categories: [],
    });

    render(<KeyCategoriesDeepDive />);

    // 应该有图表mock
    const charts = screen.getAllByTestId('echarts-mock');
    expect(charts.length).toBeGreaterThanOrEqual(2);
  });
});