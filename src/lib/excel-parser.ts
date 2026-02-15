import * as XLSX from 'xlsx';
import { RawDataRow, SheetInfo } from '@/types';

// 中文列名到英文的映射
const COLUMN_NAME_MAPPING: Record<string, string> = {
  '年份': 'YEAR',
  '月份': 'MONTH',
  '品类': 'CATEGORY',
  '关键词': 'KEYWORDS',
  '小红书_声量': '小红书_Buzz',
  '抖音_声量': '抖音_Buzz',
  '总声量': 'TTL_Buzz',
  '总声量_同比': 'TTL_Buzz_YOY',
  '总声量_环比': 'TTL_Buzz_MOM',
  '小红书_搜索量': '小红书_SEARCH',
  '小红书_搜索量_环比': '小红书_SEARCH_vs_Dec',
  '抖音_搜索量': '抖音_SEARCH',
  '抖音_搜索量_环比': '抖音_SEARCH_vs_Dec',
  '象限图': '象限图',
};

/**
 * 解析 Excel 文件
 * @param file - File 对象
 * @returns Promise<XLSX.WorkBook> - 解析后的工作簿
 */
export async function parseExcelFile(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('无法读取文件数据'));
          return;
        }

        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          cellNF: true,
        });

        resolve(workbook);
      } catch (error) {
        reject(new Error(`Excel 文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 获取所有 Sheet 名称
 * @param workbook - XLSX.WorkBook 工作簿
 * @returns string[] - Sheet 名称数组
 */
export function getSheetNames(workbook: XLSX.WorkBook): string[] {
  return workbook.SheetNames;
}

/**
 * 获取 Sheet 元数据
 * 注意：Excel 文件第1行是备注，第2行是真正的表头
 * @param workbook - XLSX.WorkBook 工作簿
 * @param sheetName - Sheet 名称
 * @returns SheetInfo - Sheet 元数据
 */
export function getSheetInfo(workbook: XLSX.WorkBook, sheetName: string): SheetInfo {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" 不存在`);
  }

  // 获取所有行
  const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as (string | number | null)[][];

  // 第1行是备注，第2行是表头
  const headerRow = allRows[1];
  const dataRowCount = allRows.length - 2; // 减去备注行和表头行

  // 获取表头（第二行）
  const headers: string[] = [];
  if (headerRow) {
    for (let i = 0; i < headerRow.length; i++) {
      const headerValue = headerRow[i];
      if (headerValue !== undefined && headerValue !== null && headerValue !== '') {
        headers.push(String(headerValue).trim());
      }
    }
  }

  return {
    name: sheetName,
    rowCount: Math.max(0, dataRowCount),
    columns: headers,
  };
}

// 列名映射（Excel 中的原始列名 -> 标准化列名）
// 支持多种格式：下划线/连字符/空格，以及不同的大小写
const RAW_COLUMN_MAPPING: Record<string, keyof RawDataRow> = {
  // 基础字段
  'YEAR': 'YEAR',
  'MONTH': 'MONTH',
  'CATEGORY': 'CATEGORY',
  'KEYWORDS': 'KEYWORDS',

  // 声量字段 - 支持多种格式（Buzz/BUZZ）
  '小红书_Buzz': '小红书_Buzz',
  '小红书-Buzz': '小红书_Buzz',
  '小红书-BUZZ': '小红书_Buzz',
  '小红书_BUZZ': '小红书_Buzz',
  '抖音_Buzz': '抖音_Buzz',
  '抖音-Buzz': '抖音_Buzz',
  '抖音-BUZZ': '抖音_Buzz',
  '抖音_BUZZ': '抖音_Buzz',
  'TTL_Buzz': 'TTL_Buzz',
  'TTL Buzz': 'TTL_Buzz',
  'TTL BUZZ': 'TTL_Buzz',
  'TTL_BUZZ': 'TTL_Buzz',

  // 增长率字段 - 支持多种格式（空格/下划线/连字符）
  'TTL_Buzz_YOY': 'TTL_Buzz_YOY',
  'TTL Buzz YOY': 'TTL_Buzz_YOY',
  'TTL BUZZ YOY': 'TTL_Buzz_YOY',
  'TTL_BUZZ_YOY': 'TTL_Buzz_YOY',
  'TTL-Buzz-YOY': 'TTL_Buzz_YOY',
  'TTL-BUZZ-YOY': 'TTL_Buzz_YOY',
  'TTL_Buzz_MOM': 'TTL_Buzz_MOM',
  'TTL Buzz MOM': 'TTL_Buzz_MOM',
  'TTL BUZZ MOM': 'TTL_Buzz_MOM',
  'TTL_BUZZ_MOM': 'TTL_Buzz_MOM',
  'TTL-Buzz-MOM': 'TTL_Buzz_MOM',
  'TTL-BUZZ-MOM': 'TTL_Buzz_MOM',

  // 搜索量字段 - 支持多种格式（包括不同月份的对比）
  '小红书_SEARCH': '小红书_SEARCH',
  '小红书-SEARCH': '小红书_SEARCH',
  '小红书_SEARCH_vs_Dec': '小红书_SEARCH_vs_Dec',
  '小红书-SEARCH vs.Dec': '小红书_SEARCH_vs_Dec',
  '小红书-SEARCH vs.Jul': '小红书_SEARCH_vs_Dec',
  '小红书-SEARCH vs.Aug': '小红书_SEARCH_vs_Dec',
  '小红书-SEARCH vs.May': '小红书_SEARCH_vs_Dec',
  '小红书-SEARCHvs.Dec': '小红书_SEARCH_vs_Dec',
  '小红书-SEARCHvs.Jul': '小红书_SEARCH_vs_Dec',
  '小红书-SEARCHvs.May': '小红书_SEARCH_vs_Dec',
  '抖音_SEARCH': '抖音_SEARCH',
  '抖音-SEARCH': '抖音_SEARCH',
  '抖音_SEARCH_vs_Dec': '抖音_SEARCH_vs_Dec',
  '抖音-SEARCH vs.Dec': '抖音_SEARCH_vs_Dec',
  '抖音-SEARCH vs.Jul': '抖音_SEARCH_vs_Dec',
  '抖音-SEARCH vs.Aug': '抖音_SEARCH_vs_Dec',
  '抖音-SEARCH vs.May': '抖音_SEARCH_vs_Dec',
  '抖音-SEARCHvs.Dec': '抖音_SEARCH_vs_Dec',
  '抖音-SEARCHvs.Jul': '抖音_SEARCH_vs_Dec',
  '抖音-SEARCHvs.May': '抖音_SEARCH_vs_Dec',

  // 象限图
  '象限图': '象限图',
};

/**
 * 标准化列名用于模糊匹配
 * 将列名转换为大写并移除所有空格和特殊字符
 */
function normalizeColumnNameForMatch(name: string): string {
  return name.toUpperCase().replace(/[\s\-_\.]/g, '');
}

// 标准化后的列名到字段名的映射
const NORMALIZED_COLUMN_MAPPING: Record<string, keyof RawDataRow> = {
  'YEAR': 'YEAR',
  'MONTH': 'MONTH',
  'CATEGORY': 'CATEGORY',
  'KEYWORDS': 'KEYWORDS',
  '小红书BUZZ': '小红书_Buzz',
  '抖音BUZZ': '抖音_Buzz',
  'TTLBUZZ': 'TTL_Buzz',
  'TTLBUZZYOY': 'TTL_Buzz_YOY',
  'TTLBUZZMOM': 'TTL_Buzz_MOM',
  '小红书SEARCH': '小红书_SEARCH',
  '小红书SEARCHVSDEC': '小红书_SEARCH_vs_Dec',
  '小红书SEARCHVSJUL': '小红书_SEARCH_vs_Dec',
  '小红书SEARCHVSAUG': '小红书_SEARCH_vs_Dec',
  '小红书SEARCHVSMAY': '小红书_SEARCH_vs_Dec',
  '抖音SEARCH': '抖音_SEARCH',
  '抖音SEARCHVSDEC': '抖音_SEARCH_vs_Dec',
  '抖音SEARCHVSJUL': '抖音_SEARCH_vs_Dec',
  '抖音SEARCHVSAUG': '抖音_SEARCH_vs_Dec',
  '抖音SEARCHVSMAY': '抖音_SEARCH_vs_Dec',
  '象限图': '象限图',
};

/**
 * 智能匹配列名到字段名
 * 优先精确匹配，其次模糊匹配
 */
function mapColumnNameToField(colName: string): keyof RawDataRow | null {
  if (!colName) return null;

  const trimmedName = String(colName).trim();

  // 1. 先尝试精确匹配
  if (RAW_COLUMN_MAPPING[trimmedName]) {
    return RAW_COLUMN_MAPPING[trimmedName];
  }

  // 2. 尝试标准化后模糊匹配
  const normalizedKey = normalizeColumnNameForMatch(trimmedName);
  if (NORMALIZED_COLUMN_MAPPING[normalizedKey]) {
    return NORMALIZED_COLUMN_MAPPING[normalizedKey];
  }

  // 3. 特殊处理：检查是否包含关键词
  const upperName = trimmedName.toUpperCase();
  if (upperName.includes('YOY')) {
    return 'TTL_Buzz_YOY';
  }
  if (upperName.includes('MOM')) {
    return 'TTL_Buzz_MOM';
  }

  return null;
}

/**
 * 标准化月份格式
 * 将各种月份格式统一为三字母英文格式（Jan, Feb, Mar...）
 */
function normalizeMonth(month: string | number | null): string {
  if (month === null || month === undefined || month === '') {
    return '';
  }

  // 如果是数字，转换为标准月份
  if (typeof month === 'number') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || String(month);
  }

  const monthStr = String(month).trim();

  // 已经是标准格式
  const standardMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (standardMonths.includes(monthStr)) {
    return monthStr;
  }

  // 中文月份格式（1月、2月...）
  const chineseMatch = monthStr.match(/^(\d+)月?$/);
  if (chineseMatch) {
    const monthNum = parseInt(chineseMatch[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return standardMonths[monthNum - 1];
    }
  }

  // 纯数字格式
  const numMatch = monthStr.match(/^(\d{1,2})$/);
  if (numMatch) {
    const monthNum = parseInt(numMatch[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return standardMonths[monthNum - 1];
    }
  }

  // 英文完整月份名或其他格式
  const lowerMonth = monthStr.toLowerCase();
  const monthMapping: Record<string, string> = {
    'january': 'Jan', 'jan': 'Jan',
    'february': 'Feb', 'feb': 'Feb',
    'march': 'Mar', 'mar': 'Mar',
    'april': 'Apr', 'apr': 'Apr',
    'may': 'May',
    'june': 'Jun', 'jun': 'Jun',
    'july': 'Jul', 'jul': 'Jul',
    'august': 'Aug', 'aug': 'Aug',
    'september': 'Sep', 'sep': 'Sep', 'sept': 'Sep',
    'october': 'Oct', 'oct': 'Oct',
    'november': 'Nov', 'nov': 'Nov',
    'december': 'Dec', 'dec': 'Dec',
  };

  return monthMapping[lowerMonth] || monthStr;
}

/**
 * 解析单个 Sheet 的数据
 * 注意：Excel 文件第1行是备注，第2行是真正的表头
 * @param workbook - XLSX.WorkBook 工作簿
 * @param sheetName - Sheet 名称
 * @returns RawDataRow[] - 解析后的数据行
 */
export function parseSheetData(workbook: XLSX.WorkBook, sheetName: string): RawDataRow[] {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" 不存在`);
  }

  // 获取所有行（包括空行）
  const allRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
  }) as unknown as (string | number | null)[][];

  // 第1行是备注，第2行是表头，从第3行开始是数据
  const headerRow = allRows[1];
  const dataRows = allRows.slice(2);

  if (!headerRow) {
    throw new Error(`Sheet "${sheetName}" 没有表头行`);
  }

  // 建立列索引到字段名的映射（使用智能匹配）
  const columnMapping: (keyof RawDataRow | null)[] = headerRow.map((colName, idx) => {
    const field = mapColumnNameToField(colName != null ? String(colName) : '');
    // 调试日志
    if (colName) {
      console.log(`[列映射] 列${idx + 1}: '${String(colName).trim()}' -> ${field ? `'${String(field)}'` : '未映射'}`);
    }
    return field;
  });

  // 数值类型字段列表
  const numericFields: (keyof RawDataRow)[] = [
    'YEAR',
    '小红书_Buzz',
    '抖音_Buzz',
    'TTL_Buzz',
    'TTL_Buzz_YOY',
    'TTL_Buzz_MOM',
    '小红书_SEARCH',
    '小红书_SEARCH_vs_Dec',
    '抖音_SEARCH',
    '抖音_SEARCH_vs_Dec',
  ];

  // 转换数据行
  const jsonData: RawDataRow[] = dataRows
    .filter((row) => row && row.some((cell) => cell !== null && cell !== '')) // 过滤空行
    .map((row) => {
      const normalizedRow: Record<string, unknown> = {};

      columnMapping.forEach((fieldName, colIndex) => {
        if (fieldName) {
          const value = row[colIndex];

          if (value === null || value === undefined || value === '') {
            normalizedRow[fieldName] = numericFields.includes(fieldName) ? 0 : '';
          } else if (typeof value === 'number') {
            normalizedRow[fieldName] = value;
          } else if (typeof value === 'string') {
            if (numericFields.includes(fieldName)) {
              const numValue = parseFloat(value);
              normalizedRow[fieldName] = isNaN(numValue) ? 0 : numValue;
            } else {
              normalizedRow[fieldName] = value;
            }
          } else {
            normalizedRow[fieldName] = value;
          }
        }
      });

      // 标准化月份格式
      if (normalizedRow.MONTH) {
        const monthValue = normalizedRow.MONTH;
        normalizedRow.MONTH = normalizeMonth(typeof monthValue === 'number' ? monthValue : String(monthValue));
      }

      return normalizedRow as unknown as RawDataRow;
    });

  // 调试：检查首行数据
  if (jsonData.length > 0) {
    const firstRow = jsonData[0];
    console.log(`[数据解析] Sheet: ${sheetName}, 首行数据:`, {
      关键词: firstRow.KEYWORDS,
      月份: firstRow.MONTH,
      品类: firstRow.CATEGORY,
      TTL_Buzz: firstRow.TTL_Buzz,
      TTL_Buzz_YOY: firstRow.TTL_Buzz_YOY,
      象限图: firstRow.象限图,
    });
  }

  return jsonData;
}

/**
 * 标准化列名（中文转英文）
 * @param name - 原始列名
 * @returns string - 标准化后的列名
 */
function normalizeColumnName(name: string): string {
  // 检查是否已经有对应的英文映射
  if (COLUMN_NAME_MAPPING[name]) {
    return COLUMN_NAME_MAPPING[name];
  }

  // 如果没有映射，保持原样
  return name;
}

/**
 * 数据验证
 * @param data - RawDataRow[] 数据数组
 * @returns { valid: boolean; errors: string[] } - 验证结果
 */
export function validateData(data: RawDataRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查数据是否为空
  if (!data || data.length === 0) {
    errors.push('数据为空');
    return { valid: false, errors };
  }

  // 检查必需列
  const requiredColumns = ['YEAR', 'MONTH', 'CATEGORY', 'KEYWORDS', 'TTL_Buzz'];
  const firstRow = data[0];

  for (const col of requiredColumns) {
    if (!(col in firstRow)) {
      errors.push(`缺少必需列: ${col}`);
    }
  }

  // 检查数据类型
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 1;

    // 验证 YEAR
    if (row.YEAR !== undefined && typeof row.YEAR !== 'number') {
      errors.push(`第 ${rowNum} YEAR  行:应该是数字类型`);
    }

    // 验证 MONTH
    if (row.MONTH !== undefined && typeof row.MONTH !== 'string') {
      errors.push(`第 ${rowNum} 行: MONTH 应该是字符串类型`);
    }

    // 验证 CATEGORY
    if (row.CATEGORY !== undefined && typeof row.CATEGORY !== 'string') {
      errors.push(`第 ${rowNum} 行: CATEGORY 应该是字符串类型`);
    }

    // 验证 KEYWORDS
    if (row.KEYWORDS !== undefined && typeof row.KEYWORDS !== 'string') {
      errors.push(`第 ${rowNum} 行: KEYWORDS 应该是字符串类型`);
    }

    // 验证数值列
    const numericColumns = [
      '小红书_Buzz',
      '抖音_Buzz',
      'TTL_Buzz',
      'TTL_Buzz_YOY',
      'TTL_Buzz_MOM',
      '小红书_SEARCH',
      '小红书_SEARCH_vs_Dec',
      '抖音_SEARCH',
      '抖音_SEARCH_vs_Dec',
    ];

    for (const col of numericColumns) {
      const value = (row as unknown as Record<string, unknown>)[col];
      if (value !== undefined && typeof value !== 'number') {
        errors.push(`第 ${rowNum} 行: ${col} 应该是数字类型`);
      }
    }

    // 检查象限图字段
    const quadrantValue = (row as unknown as Record<string, unknown>)['象限图'];
    if (quadrantValue !== undefined && typeof quadrantValue !== 'string') {
      errors.push(`第 ${rowNum} 行: 象限图 应该是字符串类型`);
    }
  }

  // 如果有太多错误，只显示前10条
  if (errors.length > 10) {
    errors.splice(10);
    errors.push('...（更多错误省略）');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 导出数据为 Excel 文件
 * @param data - RawDataRow[] 数据数组
 * @param sheetName - Sheet 名称
 * @returns Blob - Excel 文件 Blob
 */
export function exportToExcel(data: RawDataRow[], sheetName: string = 'Data'): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
