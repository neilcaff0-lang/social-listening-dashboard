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
    <div className="w-full max-w-xl">
      {/* 拖拽上传区域 */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!selectedFile ? handleClick : undefined}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed py-10 px-8 transition-all duration-200
          ${isDragging
            ? 'border-[#6C5CE7] bg-[#6C5CE7]/5'
            : 'border-[#E8ECF1] bg-white hover:border-[#6C5CE7]/50 hover:bg-[#F5F7FA]'
          }
          ${selectedFile ? 'cursor-default border-[#00C48C] bg-[#00C48C]/5' : ''}
          ${error ? 'border-[#FF6B6B] bg-[#FF6B6B]/5' : ''}
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00C48C]/10">
                <FileSpreadsheet className="h-6 w-6 text-[#00C48C]" />
              </div>
              <div>
                <p className="font-medium text-[#1A1D23]">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-[#9AA0AB]">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="rounded-lg p-2 text-[#9AA0AB] hover:bg-[#F5F7FA] hover:text-[#5A6170] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : isLoading ? (
          // 加载中
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#E8ECF1] border-t-[#6C5CE7]" />
            <p className="font-medium text-[#1A1D23]">
              正在解析文件...
            </p>
            {/* 进度条 */}
            <div className="mt-4 h-2 w-48 overflow-hidden rounded-full bg-[#E8ECF1]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#a29bfe] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[#9AA0AB]">{uploadProgress}%</p>
          </div>
        ) : error ? (
          // 错误状态
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B6B]/10">
              <AlertCircle className="h-6 w-6 text-[#FF6B6B]" />
            </div>
            <p className="mb-2 font-medium text-[#FF6B6B]">
              {error}
            </p>
            <p className="text-sm text-[#9AA0AB]">请重新选择文件</p>
          </div>
        ) : (
          // 默认状态
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7]/10 to-[#a29bfe]/10">
              <Upload className="h-7 w-7 text-[#6C5CE7]" />
            </div>
            <p className="mb-2 font-medium text-[#1A1D23]">
              拖拽文件到此处，或点击选择
            </p>
            <p className="text-sm text-[#9AA0AB]">
              支持 .xlsx 和 .xls 格式的 Excel 文件
            </p>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#5A6170]">
        <CheckCircle className="h-4 w-4 text-[#00C48C]" />
        <span>文件上传后自动解析Sheet信息</span>
      </div>
    </div>
  );
}
