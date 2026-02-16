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
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SheetInfo } from '@/types';
import * as XLSX from 'xlsx';
import ModuleNav from '@/components/layout/ModuleNav';
import TopBar from '@/components/layout/TopBar';

// 上传流程步骤
type UploadStep = 'upload' | 'sheet-select' | 'preview' | 'confirm';

// 步骤标签
const STEP_LABELS = ['上传文件', '选择Sheet', '数据预览', '确认导入'];

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
  const [importError, setImportError] = useState<string | null>(null);

  // 文件回调
  const handleFileSelect = useCallback(
    (_file: File, wb: XLSX.WorkBook, infos: SheetInfo[]) => {
      setWorkbook(wb);
      setSheetInfos(infos);
      setSelectedSheets(infos.map((info) => info.name));
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
    setImportError(null);
    try {
      const allData: Parameters<typeof setRawData>[0] = [];
      const categories: Parameters<typeof setRawData>[1] = [];

      selectedSheets.forEach((sheetName) => {
        const data = parseSheetData(workbook, sheetName);
        allData.push(...data);
        const uniqueCategories = [...new Set(data.map((row) => row.CATEGORY))];
        uniqueCategories.forEach((cat) => {
          if (!categories.find((c) => c.name === cat)) {
            categories.push({ id: cat, name: cat, sheetName });
          }
        });
      });

      const validation = validateData(allData);
      if (!validation.valid) {
        console.warn('数据验证警告:', validation.errors);
      }

      setRawData(allData, categories, sheetInfos);
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '导入过程中发生未知错误';
      setImportError(errorMessage);
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

  const currentStepNumber = getStepNumber(currentStep);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 左侧导航 */}
      <ModuleNav />

      {/* 右侧内容区 */}
      <div style={{ marginLeft: '240px' }} className="min-h-screen flex flex-col">
        {/* 顶部栏 */}
        <TopBar />

        {/* 主内容区 - 居中布局 */}
        <main className="flex-1 flex items-start justify-center p-8">
          <div className="w-full max-w-5xl">
            {/* 步骤指示器 - 居中 */}
            <div className="mb-10">
              <div className="flex items-center justify-center gap-2">
                {(['upload', 'sheet-select', 'preview', 'confirm'] as UploadStep[]).map(
                  (step, index) => (
                    <div key={step} className="flex items-center">
                      {/* 步骤项 */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`
                            flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                            ${currentStepNumber > index + 1
                              ? 'bg-[#10B981] text-white shadow-md shadow-green-500/25'
                              : currentStepNumber === index + 1
                                ? 'bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] text-white shadow-lg shadow-[#6C5CE7]/30 ring-4 ring-[#6C5CE7]/10'
                                : 'bg-[#E2E8F0] text-[#A0AEC0]'
                            }
                          `}
                        >
                          {currentStepNumber > index + 1 ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={`
                          text-sm font-semibold transition-colors
                          ${currentStepNumber === index + 1 ? 'text-[#0F1419]' : 'text-[#A0AEC0]'}
                        `}>
                          {STEP_LABELS[index]}
                        </span>
                      </div>
                      {/* 连接线 */}
                      {index < 3 && (
                        <div
                          className={`
                            h-0.5 w-8 mx-3 rounded-full transition-colors duration-300
                            ${currentStepNumber > index + 1 ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}
                          `}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 错误提示 */}
            {importError && (
              <div className="mb-6 w-full">
                <ErrorAlert
                  title="导入失败"
                  message={importError}
                  type="error"
                  onClose={() => setImportError(null)}
                />
              </div>
            )}

            {/* 步骤内容卡片 */}
            <div className="flex flex-col items-center">
              {/* 步骤1: 文件上传 */}
              {currentStep === 'upload' && (
                <FileUploader onFileSelect={handleFileSelect} />
              )}

              {/* 步骤2: Sheet选择 */}
              {currentStep === 'sheet-select' && workbook && (
                <div className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                  <SheetSelector
                    sheetInfos={sheetInfos}
                    selectedSheets={selectedSheets}
                    onSelectionChange={handleSheetSelectionChange}
                  />
                </div>
              )}

              {/* 步骤3: 数据预览 */}
              {currentStep === 'preview' && workbook && (
                <div className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                  <DataPreview
                    workbook={workbook}
                    selectedSheets={selectedSheets}
                  />
                </div>
              )}

              {/* 步骤4: 确认导入 */}
              {currentStep === 'confirm' && workbook && (
                <div className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
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
              <div className="mt-8 flex w-full justify-between">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  上一步
                </Button>

                {currentStep !== 'confirm' && (
                  <Button
                    onClick={handleNext}
                    disabled={currentStep === 'sheet-select' && selectedSheets.length === 0}
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
  );
}
