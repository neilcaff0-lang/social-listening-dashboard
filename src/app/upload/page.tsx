'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { FileUploader } from '@/components/upload/FileUploader';
import { SheetSelector } from '@/components/upload/SheetSelector';
import { DataPreview } from '@/components/upload/DataPreview';
import { ImportConfirm } from '@/components/upload/ImportConfirm';
import { parseSheetData, validateData } from '@/lib/excel-parser';
import { useDataStore } from '@/store/useDataStore';
import { Button } from '@/components/ui/Button';
import { SheetInfo } from '@/types';
import * as XLSX from 'xlsx';
import Header from '@/components/layout/Header';
import ModuleNav from '@/components/layout/ModuleNav';

// 上传流程步骤
type UploadStep = 'upload' | 'sheet-select' | 'preview' | 'confirm';

export default function UploadPage() {
  const router = useRouter();
  const { setRawData } = useDataStore();

  // 当前步骤
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');

  // 文件数据
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetInfos, setSheetInfos] = useState<SheetInfo[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // 文件回调
  const handleFileSelect = useCallback(
    (_file: File, wb: XLSX.WorkBook, infos: SheetInfo[]) => {
      setWorkbook(wb);
      setSheetInfos(infos);
      // 默认选择所有Sheet
      setSelectedSheets(infos.map((info) => info.name));
      // 跳转到Sheet选择步骤
      setCurrentStep('sheet-select');
    },
    []
  );

  // Sheet选择变化
  const handleSheetSelectionChange = useCallback((sheets: string[]) => {
    setSelectedSheets(sheets);
  }, []);

  // 下一步
  const handleNext = () => {
    if (currentStep === 'sheet-select') {
      setCurrentStep('preview');
    } else if (currentStep === 'preview') {
      setCurrentStep('confirm');
    }
  };

  // 上一步
  const handleBack = () => {
    if (currentStep === 'sheet-select') {
      setCurrentStep('upload');
    } else if (currentStep === 'preview') {
      setCurrentStep('sheet-select');
    } else if (currentStep === 'confirm') {
      setCurrentStep('preview');
    }
  };

  // 确认导入
  const handleConfirmImport = useCallback(async () => {
    if (!workbook || selectedSheets.length === 0) return;

    setIsImporting(true);
    try {
      // 解析所有选中的Sheet数据
      const allData: Parameters<typeof setRawData>[0] = [];
      const categories: Parameters<typeof setRawData>[1] = [];

      selectedSheets.forEach((sheetName) => {
        const data = parseSheetData(workbook, sheetName);
        allData.push(...data);

        // 从数据中提取品类
        const uniqueCategories = [...new Set(data.map((row) => row.CATEGORY))];
        uniqueCategories.forEach((cat) => {
          if (!categories.find((c) => c.name === cat)) {
            categories.push({
              id: cat,
              name: cat,
              sheetName: sheetName,
            });
          }
        });
      });

      // 验证数据
      const validation = validateData(allData);
      if (!validation.valid) {
        console.warn('数据验证警告:', validation.errors);
      }

      // 存储数据
      setRawData(allData, categories, sheetInfos);

      // 跳转到仪表盘
      router.push('/dashboard');
    } catch (error) {
      console.error('导入失败:', error);
    } finally {
      setIsImporting(false);
    }
  }, [workbook, selectedSheets, sheetInfos, setRawData, router]);

  // 获取步骤编号
  const getStepNumber = (step: UploadStep): number => {
    const steps: UploadStep[] = ['upload', 'sheet-select', 'preview', 'confirm'];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 顶部导航栏 */}
      <Header />

      <div className="flex">
        {/* 左侧模块导航 */}
        <ModuleNav />

        {/* 右侧内容区 */}
        <div className="flex flex-1 flex-col transition-all md:ml-56">
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-5xl">
              {/* 页面标题 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  导入数据
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  上传您的 Excel 文件，我们将自动解析数据并为您展示分析结果
                </p>
              </div>

              {/* 步骤指示器 */}
              <div className="mb-8 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  {(['upload', 'sheet-select', 'preview', 'confirm'] as UploadStep[]).map(
                    (step, index) => (
                      <div key={step} className="flex items-center">
                        {/* 步骤圆圈 */}
                        <div
                          className={`
                            flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                            ${
                              getStepNumber(currentStep) > getStepNumber(step)
                                ? 'bg-green-600 text-white'
                                : getStepNumber(currentStep) === getStepNumber(step)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                            }
                          `}
                        >
                          {getStepNumber(currentStep) > getStepNumber(step) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {/* 连接线 */}
                        {index < 3 && (
                          <div
                            className={`
                              h-0.5 w-12
                              ${
                                getStepNumber(currentStep) > getStepNumber(step)
                                  ? 'bg-green-600'
                                  : 'bg-neutral-200 dark:bg-neutral-800'
                              }
                            `}
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 步骤内容 */}
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                {/* 步骤1: 文件上传 */}
                {currentStep === 'upload' && (
                  <div className="flex flex-col items-center py-8">
                    <FileUploader onFileSelect={handleFileSelect} />
                  </div>
                )}

                {/* 步骤2: Sheet选择 */}
                {currentStep === 'sheet-select' && workbook && (
                  <div>
                    <SheetSelector
                      sheetInfos={sheetInfos}
                      selectedSheets={selectedSheets}
                      onSelectionChange={handleSheetSelectionChange}
                    />
                  </div>
                )}

                {/* 步骤3: 数据预览 */}
                {currentStep === 'preview' && workbook && (
                  <div>
                    <DataPreview
                      workbook={workbook}
                      selectedSheets={selectedSheets}
                    />
                  </div>
                )}

                {/* 步骤4: 确认导入 */}
                {currentStep === 'confirm' && workbook && (
                  <div>
                    <ImportConfirm
                      sheetCount={selectedSheets.length}
                      sheetNames={selectedSheets}
                      sheetInfos={sheetInfos}
                      onConfirm={handleConfirmImport}
                      onBack={handleBack}
                      isLoading={isImporting}
                    />
                  </div>
                )}
              </div>

              {/* 底部按钮 */}
              {currentStep !== 'upload' && (
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    上一步
                  </Button>

                  {currentStep !== 'confirm' && (
                    <Button
                      onClick={handleNext}
                      disabled={
                        currentStep === 'sheet-select' && selectedSheets.length === 0
                      }
                      className="gap-2"
                    >
                      下一步
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
