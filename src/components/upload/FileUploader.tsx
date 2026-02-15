'use client';

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile, getSheetNames, getSheetInfo } from '@/lib/excel-parser';
import { SheetInfo } from '@/types';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onFileSelect: (file: File, workbook: XLSX.WorkBook, sheetInfos: SheetInfo[]) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 支持的文件格式
  const acceptedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  const acceptedExtensions = '.xlsx,.xls';

  // 处理拖拽进入
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // 处理拖拽离开
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // 处理拖拽移动
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 处理文件放置
  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  // 处理文件选择
  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  // 处理文件
  const processFile = async (file: File) => {
    // 验证文件类型
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['xlsx', 'xls'].includes(fileExtension)) {
      setError('请上传 .xlsx 或 .xls 格式的 Excel 文件');
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 模拟进度
      setUploadProgress(30);

      // 解析文件
      const workbook = await parseExcelFile(file);
      setUploadProgress(60);

      // 获取所有 Sheet 信息
      const sheetNames = getSheetNames(workbook);
      const sheetInfos: SheetInfo[] = sheetNames.map((name) =>
        getSheetInfo(workbook, name)
      );
      setUploadProgress(100);

      // 回调
      onFileSelect(file, workbook, sheetInfos);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败');
      setSelectedFile(null);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 点击选择文件
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 清除已选择的文件
  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* 拖拽上传区域 */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!selectedFile ? handleClick : undefined}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-neutral-300 bg-white hover:border-blue-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-500'
          }
          ${selectedFile ? 'cursor-default border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900' : ''}
          ${error ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedExtensions}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          // 已选择文件
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-50">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : isLoading ? (
          // 加载中
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600" />
            <p className="font-medium text-neutral-900 dark:text-neutral-50">
              正在解析文件...
            </p>
            {/* 进度条 */}
            <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-neutral-500">{uploadProgress}%</p>
          </div>
        ) : error ? (
          // 错误状态
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="mb-2 font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
            <p className="text-sm text-neutral-500">请重新选择文件</p>
          </div>
        ) : (
          // 默认状态
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mb-1 font-medium text-neutral-900 dark:text-neutral-50">
              拖拽文件到此处，或点击选择
            </p>
            <p className="text-sm text-neutral-500">
              支持 .xlsx 和 .xls 格式的 Excel 文件
            </p>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>文件上传后自动解析Sheet信息</span>
      </div>
    </div>
  );
}
