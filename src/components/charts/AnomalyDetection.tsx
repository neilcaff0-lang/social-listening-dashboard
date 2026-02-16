"use client";

import { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { detectKeywordAnomalies } from '@/lib/advanced-analytics';
import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface AnomalyDetectionProps {
  className?: string;
}

export default function AnomalyDetection({ className }: AnomalyDetectionProps) {
  const { rawData, filters } = useDataStore();

  // 检测异常
  const anomalies = useMemo(() => {
    if (rawData.length === 0) return [];
    return detectKeywordAnomalies(rawData, filters);
  }, [rawData, filters]);

  // 按严重程度分组
  const groupedAnomalies = useMemo(() => {
    const high = anomalies.filter(a => a.severity === 'high');
    const medium = anomalies.filter(a => a.severity === 'medium');
    return { high, medium };
  }, [anomalies]);

  if (anomalies.length === 0) {
    return (
      <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">异常检测</h3>
            <p className="text-sm text-gray-500">识别数据中的异常波动</p>
          </div>
        </div>
        <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50">
          <p className="text-sm text-gray-400">暂无异常数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5", className)}>
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">异常检测</h3>
            <p className="text-sm text-gray-500">发现 {anomalies.length} 个异常波动</p>
          </div>
        </div>
        <div className="flex gap-2">
          {groupedAnomalies.high.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
              {groupedAnomalies.high.length} 高风险
            </span>
          )}
          {groupedAnomalies.medium.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
              {groupedAnomalies.medium.length} 中风险
            </span>
          )}
        </div>
      </div>

      {/* 异常列表 */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {anomalies.slice(0, 10).map((anomaly, index) => (
          <div
            key={`${anomaly.keyword}-${anomaly.month}-${index}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              anomaly.severity === 'high' ? "bg-red-50" : "bg-amber-50"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              anomaly.severity === 'high' ? "bg-red-200" : "bg-amber-200"
            )}>
              {anomaly.metric === 'buzz' ? (
                <TrendingDown className={cn(
                  "w-4 h-4",
                  anomaly.severity === 'high' ? "text-red-700" : "text-amber-700"
                )} />
              ) : (
                <TrendingUp className={cn(
                  "w-4 h-4",
                  anomaly.severity === 'high' ? "text-red-700" : "text-amber-700"
                )} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {anomaly.keyword}
                <span className="text-gray-400 mx-1">·</span>
                <span className="text-gray-500">{anomaly.month}</span>
              </p>
              <p className={cn(
                "text-xs",
                anomaly.severity === 'high' ? "text-red-600" : "text-amber-600"
              )}>
                {anomaly.metric === 'buzz' ? '声量' : 'YOY'}异常：
                实际值 {anomaly.value.toFixed(1)}，
                偏离 {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}σ
              </p>
            </div>
            <div className={cn(
              "text-xs font-medium",
              anomaly.severity === 'high' ? "text-red-700" : "text-amber-700"
            )}>
              {anomaly.severity === 'high' ? '高风险' : '中风险'}
            </div>
          </div>
        ))}
      </div>

      {/* 提示 */}
      {anomalies.length > 10 && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          还有 {anomalies.length - 10} 个异常未显示
        </p>
      )}
    </div>
  );
}
