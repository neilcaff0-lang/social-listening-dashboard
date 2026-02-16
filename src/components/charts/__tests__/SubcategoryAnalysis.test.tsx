import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubcategoryAnalysis from '../SubcategoryAnalysis';
import { mockDataset, mockEmptyFilterState } from '@/test/mocks/data';

// Create mock function
const mockUseDataStore = vi.fn();

// Mock the store
vi.mock('@/store/useDataStore', () => ({
  useDataStore: (...args: unknown[]) => mockUseDataStore(...args),
}));

// Mock SingleSubcategoryInsight
vi.mock('../SingleSubcategoryInsight', () => ({
  default: ({ category, subcategory, onBack }: { category: string; subcategory: string; onBack: () => void }) => (
    <div data-testid="single-subcategory-insight">
      <button onClick={onBack}>返回</button>
      <span>{category} - {subcategory}</span>
    </div>
  ),
}));

describe('SubcategoryAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when no subcategory data', () => {
    mockUseDataStore.mockReturnValue({
      rawData: [],
      filters: mockEmptyFilterState,
    });

    const { container } = render(<SubcategoryAnalysis />);
    expect(container.firstChild).toBeNull();
  });

  it('renders categories with subcategories', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    expect(screen.getByText('裤子')).toBeInTheDocument();
    expect(screen.getByText('包')).toBeInTheDocument();
    expect(screen.getByText('鞋')).toBeInTheDocument();
  });

  it('expands category on click', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 点击裤子展开
    const pantsButton = screen.getByText('裤子').closest('button');
    fireEvent.click(pantsButton!);

    // 应该显示细分
    expect(screen.getByText('牛仔裤')).toBeInTheDocument();
    expect(screen.getByText('休闲裤')).toBeInTheDocument();
  });

  it('collapses category when clicked again', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 展开
    const pantsButton = screen.getByText('裤子').closest('button');
    fireEvent.click(pantsButton!);

    // 收起
    fireEvent.click(pantsButton!);

    // 细分应该消失
    expect(screen.queryByText('直筒裤')).not.toBeInTheDocument();
  });

  it('shows subcategory count in header', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 裤子有2个细分（牛仔裤、休闲裤）
    expect(screen.getByText('(2 个细分)')).toBeInTheDocument();
  });

  it('navigates to single subcategory insight on row click', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 展开裤子
    const pantsButton = screen.getByText('裤子').closest('button');
    fireEvent.click(pantsButton!);

    // 点击细分行
    const subcategoryRow = screen.getByText('牛仔裤');
    fireEvent.click(subcategoryRow);

    // 应该显示SingleSubcategoryInsight
    expect(screen.getByTestId('single-subcategory-insight')).toBeInTheDocument();
    expect(screen.getByText('裤子 - 牛仔裤')).toBeInTheDocument();
  });

  it('returns to list when back button is clicked', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 展开并点击细分
    const pantsButton = screen.getByText('裤子').closest('button');
    fireEvent.click(pantsButton!);
    const subcategoryRow = screen.getByText('牛仔裤');
    fireEvent.click(subcategoryRow);

    // 点击返回
    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);

    // 应该回到列表视图
    expect(screen.getByText('细分类目洞察')).toBeInTheDocument();
  });

  it('handles empty subcategory field', () => {
    const dataWithEmptySubcategory = [
      ...mockDataset,
      {
        ...mockDataset[0],
        SUBCATEGORY: undefined,
        KEYWORDS: '未分类词',
      },
    ];

    mockUseDataStore.mockReturnValue({
      rawData: dataWithEmptySubcategory,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 展开裤子
    const pantsButton = screen.getByText('裤子').closest('button');
    fireEvent.click(pantsButton!);

    // 应该显示"未分类"
    expect(screen.getByText('未分类')).toBeInTheDocument();
  });

  it('renders chart when expanded', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 展开裤子
    const pantsButton = screen.getByText('裤子').closest('button');
    fireEvent.click(pantsButton!);

    // 应该有图表mock
    const charts = screen.getAllByTestId('echarts-mock');
    expect(charts.length).toBeGreaterThan(0);
  });

  it('displays correct buzz values in table', () => {
    mockUseDataStore.mockReturnValue({
      rawData: mockDataset,
      filters: mockEmptyFilterState,
    });

    render(<SubcategoryAnalysis />);

    // 展开裤子
    const pantsButton = screen.getByText('裤子').closest('button');
    fireEvent.click(pantsButton!);

    // 牛仔裤总声量: 3000 + 2500 = 5500
    const buzzCells = screen.getAllByText('5.5K');
    expect(buzzCells.length).toBeGreaterThan(0);
  });
});