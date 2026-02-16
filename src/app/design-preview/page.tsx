"use client";

import { BarChart3, TrendingUp, Search, Hash, Users, Activity, Zap, Target, Award, TrendingDown } from "lucide-react";

/**
 * Dashboard 设计预览页面
 * 访问 /design-preview 查看 10 种不同风格
 */

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard UI 设计预览</h1>
        <p className="text-base-content/60 mb-8">10 种风格供你选择，告诉我你喜欢哪个编号</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ========== 风格 1: 简洁现代 ========== */}
          <div className="col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-primary">风格 1</span>
              简洁现代 (Minimal Modern)
            </h2>
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-base-100 rounded-xl p-5 border border-base-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-base-content/60">总声量</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">125.6K</div>
                  <div className="badge badge-success badge-sm mt-2 gap-1">
                    <TrendingUp className="w-3 h-3" />+12.5%
                  </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 border border-base-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-base-content/60">平均同比</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">+8.3%</div>
                  <div className="badge badge-ghost badge-sm mt-2">稳定增长</div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 border border-base-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-base-content/60">总搜索量</span>
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">89.2K</div>
                  <div className="badge badge-success badge-sm mt-2 gap-1">
                    <TrendingUp className="w-3 h-3" />+5.2%
                  </div>
                </div>
                <div className="bg-base-100 rounded-xl p-5 border border-base-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-base-content/60">关键词数</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <Hash className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">2,458</div>
                  <div className="text-xs text-base-content/50 mt-2">筛选中 156 / 2,458</div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-base-50 rounded-xl p-6 border border-base-200 min-h-[200px] flex items-center justify-center">
                  <span className="text-base-content/40">气泡图区域</span>
                </div>
                <div className="bg-base-50 rounded-xl p-6 border border-base-200 min-h-[200px] flex items-center justify-center">
                  <span className="text-base-content/40">趋势图区域</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 2: 玻璃拟态 ========== */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-secondary">风格 2</span>
              玻璃拟态 (Glassmorphism)
            </h2>
            <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-sm min-h-[400px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">总声量</div>
                  <div className="text-2xl font-bold text-gray-800">125.6K</div>
                  <div className="text-sm text-green-600 mt-1">↑ +12.5%</div>
                </div>
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">平均同比</div>
                  <div className="text-2xl font-bold text-gray-800">+8.3%</div>
                  <div className="text-sm text-gray-500 mt-1">稳定增长</div>
                </div>
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center mb-3">
                    <Search className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">搜索量</div>
                  <div className="text-2xl font-bold text-gray-800">89.2K</div>
                  <div className="text-sm text-green-600 mt-1">↑ +5.2%</div>
                </div>
                <div className="bg-white/30 backdrop-blur-md rounded-2xl p-5 border border-white/40 shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center mb-3">
                    <Hash className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">关键词</div>
                  <div className="text-2xl font-bold text-gray-800">2,458</div>
                  <div className="text-sm text-gray-500 mt-1">156 筛选中</div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 3: 深色商务 ========== */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-accent">风格 3</span>
              深色商务 (Dark Business)
            </h2>
            <div className="bg-gray-900 rounded-2xl p-6 min-h-[400px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">总声量</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">125.6K</div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                    </div>
                    <span className="text-xs text-green-400">+12.5%</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">平均同比</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">+8.3%</div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">稳定</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">搜索量</span>
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                      <Search className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">89.2K</div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"></div>
                    </div>
                    <span className="text-xs text-green-400">+5.2%</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">关键词</span>
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Hash className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">2,458</div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-400">156</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 4: 彩色渐变 ========== */}
          <div className="col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-info">风格 4</span>
              彩色渐变 (Gradient Colorful)
            </h2>
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="text-blue-100 text-sm mb-1">总声量</div>
                    <div className="text-3xl font-bold">125.6K</div>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12.5% 同比</span>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-purple-100 text-sm mb-1">平均同比</div>
                    <div className="text-3xl font-bold">+8.3%</div>
                    <div className="text-purple-200 text-sm mt-2">稳定增长</div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="text-emerald-100 text-sm mb-1">总搜索量</div>
                    <div className="text-3xl font-bold">89.2K</div>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+5.2% 同比</span>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <Hash className="w-6 h-6" />
                    </div>
                    <div className="text-orange-100 text-sm mb-1">关键词数</div>
                    <div className="text-3xl font-bold">2,458</div>
                    <div className="text-orange-200 text-sm mt-2">筛选 156 条</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 min-h-[150px] flex items-center justify-center">
                  <span className="text-slate-400">气泡图区域</span>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 min-h-[150px] flex items-center justify-center">
                  <span className="text-slate-400">趋势图区域</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 5: 新拟态 (Neumorphism) ========== */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-success">风格 5</span>
              新拟态 (Neumorphism)
            </h2>
            <div className="bg-gray-100 rounded-2xl p-6 min-h-[400px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-2xl p-5 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
                  <div className="w-12 h-12 rounded-full bg-gray-100 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center mb-3 text-blue-500">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">总声量</div>
                  <div className="text-2xl font-bold text-gray-700">125.6K</div>
                  <div className="text-sm text-green-500 mt-2 font-medium">+12.5%</div>
                </div>
                <div className="bg-gray-100 rounded-2xl p-5 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
                  <div className="w-12 h-12 rounded-full bg-gray-100 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center mb-3 text-purple-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">平均同比</div>
                  <div className="text-2xl font-bold text-gray-700">+8.3%</div>
                  <div className="text-sm text-gray-400 mt-2">稳定增长</div>
                </div>
                <div className="bg-gray-100 rounded-2xl p-5 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
                  <div className="w-12 h-12 rounded-full bg-gray-100 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center mb-3 text-green-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">搜索量</div>
                  <div className="text-2xl font-bold text-gray-700">89.2K</div>
                  <div className="text-sm text-green-500 mt-2 font-medium">+5.2%</div>
                </div>
                <div className="bg-gray-100 rounded-2xl p-5 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
                  <div className="w-12 h-12 rounded-full bg-gray-100 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] flex items-center justify-center mb-3 text-orange-500">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-gray-500 mb-1">关键词</div>
                  <div className="text-2xl font-bold text-gray-700">2,458</div>
                  <div className="text-sm text-gray-400 mt-2">156 筛选</div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 6: 扁平插画 (Flat Illustration) ========== */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-warning">风格 6</span>
              扁平插画 (Flat Illustration)
            </h2>
            <div className="bg-white rounded-2xl p-6 min-h-[400px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-5 bg-[#E3F2FD] border-2 border-[#1976D2]">
                  <div className="w-12 h-12 rounded-2xl bg-[#1976D2] flex items-center justify-center mb-3 text-white">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-[#1976D2] font-medium mb-1">总声量</div>
                  <div className="text-3xl font-black text-[#1976D2]">125.6K</div>
                  <div className="inline-block mt-2 px-2 py-1 bg-[#1976D2] text-white text-xs font-bold rounded-lg">
                    +12.5%
                  </div>
                </div>
                <div className="rounded-2xl p-5 bg-[#F3E5F5] border-2 border-[#7B1FA2]">
                  <div className="w-12 h-12 rounded-2xl bg-[#7B1FA2] flex items-center justify-center mb-3 text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-[#7B1FA2] font-medium mb-1">平均同比</div>
                  <div className="text-3xl font-black text-[#7B1FA2]">+8.3%</div>
                  <div className="inline-block mt-2 px-2 py-1 bg-[#7B1FA2] text-white text-xs font-bold rounded-lg">
                    稳定
                  </div>
                </div>
                <div className="rounded-2xl p-5 bg-[#E8F5E9] border-2 border-[#388E3C]">
                  <div className="w-12 h-12 rounded-2xl bg-[#388E3C] flex items-center justify-center mb-3 text-white">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-[#388E3C] font-medium mb-1">搜索量</div>
                  <div className="text-3xl font-black text-[#388E3C]">89.2K</div>
                  <div className="inline-block mt-2 px-2 py-1 bg-[#388E3C] text-white text-xs font-bold rounded-lg">
                    +5.2%
                  </div>
                </div>
                <div className="rounded-2xl p-5 bg-[#FFF3E0] border-2 border-[#F57C00]">
                  <div className="w-12 h-12 rounded-2xl bg-[#F57C00] flex items-center justify-center mb-3 text-white">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-[#F57C00] font-medium mb-1">关键词</div>
                  <div className="text-3xl font-black text-[#F57C00]">2,458</div>
                  <div className="inline-block mt-2 px-2 py-1 bg-[#F57C00] text-white text-xs font-bold rounded-lg">
                    筛选中
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 7: 极简线条 (Minimal Line) ========== */}
          <div className="col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-error">风格 7</span>
              极简线条 (Minimal Line)
            </h2>
            <div className="bg-white rounded-2xl p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-400 uppercase tracking-wider">总声量</span>
                  </div>
                  <div className="text-3xl font-light text-gray-800">125.6K</div>
                  <div className="text-sm text-blue-500 mt-1">+12.5% ↗</div>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-400 uppercase tracking-wider">同比</span>
                  </div>
                  <div className="text-3xl font-light text-gray-800">+8.3%</div>
                  <div className="text-sm text-gray-400 mt-1">稳定 →</div>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-400 uppercase tracking-wider">搜索量</span>
                  </div>
                  <div className="text-3xl font-light text-gray-800">89.2K</div>
                  <div className="text-sm text-green-500 mt-1">+5.2% ↗</div>
                </div>
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-400 uppercase tracking-wider">关键词</span>
                  </div>
                  <div className="text-3xl font-light text-gray-800">2,458</div>
                  <div className="text-sm text-gray-400 mt-1">156 筛选</div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="border border-dashed border-gray-300 rounded-xl p-8 min-h-[150px] flex items-center justify-center">
                  <span className="text-gray-300">气泡图区域</span>
                </div>
                <div className="border border-dashed border-gray-300 rounded-xl p-8 min-h-[150px] flex items-center justify-center">
                  <span className="text-gray-300">趋势图区域</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 8: 卡片堆叠 (Card Stack) ========== */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-info">风格 8</span>
              卡片堆叠 (Card Stack)
            </h2>
            <div className="bg-base-100 rounded-2xl p-6 min-h-[400px]">
              <div className="relative h-48 mb-4">
                <div className="absolute top-0 left-0 w-full bg-blue-500 rounded-2xl p-5 text-white shadow-lg transform translate-y-0 z-30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-100 text-sm">总声量</div>
                      <div className="text-3xl font-bold">125.6K</div>
                      <div className="text-sm text-blue-100 mt-1">+12.5% 较上月</div>
                    </div>
                    <BarChart3 className="w-10 h-10 text-blue-200" />
                  </div>
                </div>
                <div className="absolute top-3 left-2 w-[96%] bg-purple-500 rounded-2xl p-5 text-white shadow-lg transform z-20">
                  <div className="flex items-center justify-between opacity-60">
                    <div>
                      <div className="text-sm">平均同比</div>
                      <div className="text-2xl font-bold">+8.3%</div>
                    </div>
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
                <div className="absolute top-6 left-4 w-[92%] bg-green-500 rounded-2xl p-5 text-white shadow-lg transform z-10">
                  <div className="flex items-center justify-between opacity-40">
                    <div>
                      <div className="text-sm">搜索量</div>
                      <div className="text-2xl font-bold">89.2K</div>
                    </div>
                    <Search className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 9: 仪表盘 (Gauge Style) ========== */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-primary">风格 9</span>
              仪表盘 (Gauge Style)
            </h2>
            <div className="bg-gray-900 rounded-2xl p-6 min-h-[400px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-full aspect-square flex flex-col items-center justify-center border-4 border-blue-500/30 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent rotate-45"></div>
                  <BarChart3 className="w-6 h-6 text-blue-400 mb-1" />
                  <div className="text-2xl font-bold text-white">125K</div>
                  <div className="text-xs text-gray-400">总声量</div>
                </div>
                <div className="bg-gray-800 rounded-full aspect-square flex flex-col items-center justify-center border-4 border-purple-500/30 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent rotate-[60deg]"></div>
                  <TrendingUp className="w-6 h-6 text-purple-400 mb-1" />
                  <div className="text-2xl font-bold text-white">+8%</div>
                  <div className="text-xs text-gray-400">同比</div>
                </div>
                <div className="bg-gray-800 rounded-full aspect-square flex flex-col items-center justify-center border-4 border-green-500/30 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent rotate-[30deg]"></div>
                  <Search className="w-6 h-6 text-green-400 mb-1" />
                  <div className="text-2xl font-bold text-white">89K</div>
                  <div className="text-xs text-gray-400">搜索</div>
                </div>
                <div className="bg-gray-800 rounded-full aspect-square flex flex-col items-center justify-center border-4 border-orange-500/30 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent rotate-[120deg]"></div>
                  <Hash className="w-6 h-6 text-orange-400 mb-1" />
                  <div className="text-2xl font-bold text-white">2.4K</div>
                  <div className="text-xs text-gray-400">关键词</div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 风格 10: 数据大屏 (Command Center) ========== */}
          <div className="col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="badge badge-secondary">风格 10</span>
              数据大屏 (Command Center)
            </h2>
            <div className="bg-black rounded-2xl p-6 min-h-[400px] font-mono">
              <div className="flex items-center justify-between mb-6 border-b border-green-500/30 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 text-sm">SYSTEM ONLINE</span>
                </div>
                <div className="text-green-500/60 text-sm">DATA_STREAM_V2.4</div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-500/60 text-xs mb-2">TOTAL_VOLUME</div>
                  <div className="text-3xl font-bold text-green-400">125.6K</div>
                  <div className="text-green-500 text-xs mt-2">▲ +12.5%</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-purple-500/60 text-xs mb-2">YOY_CHANGE</div>
                  <div className="text-3xl font-bold text-purple-400">+8.3%</div>
                  <div className="text-purple-500 text-xs mt-2">= STABLE</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-500/60 text-xs mb-2">SEARCH_VOL</div>
                  <div className="text-3xl font-bold text-blue-400">89.2K</div>
                  <div className="text-blue-500 text-xs mt-2">▲ +5.2%</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="text-orange-500/60 text-xs mb-2">KEYWORDS</div>
                  <div className="text-3xl font-bold text-orange-400">2,458</div>
                  <div className="text-orange-500 text-xs mt-2">156 ACTIVE</div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 min-h-[120px]">
                  <div className="text-green-500/40 text-xs mb-2">[CHART_BUBBLE_ZONE]</div>
                  <div className="flex items-center justify-center h-full text-green-500/20">AWAITING_DATA...</div>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 min-h-[120px]">
                  <div className="text-green-500/40 text-xs mb-2">[CHART_TREND_ZONE]</div>
                  <div className="flex items-center justify-center h-full text-green-500/20">AWAITING_DATA...</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 选择提示 */}
        <div className="mt-8 p-6 bg-primary/10 rounded-2xl border border-primary/20">
          <h3 className="text-lg font-semibold mb-2">💡 怎么选？</h3>
          <p className="text-base-content/70 mb-4">
            告诉我你喜欢哪个风格（比如“我喜欢风格 6”），我会帮你把 Dashboard 改成那个风格。也可以混搭，比如“风格 1 的布局 + 风格 4 的颜色”。
          </p>
          <div className="flex flex-wrap gap-2">
            {["简洁现代", "玻璃拟态", "深色商务", "彩色渐变", "新拟态", "扁平插画", "极简线条", "卡片堆叠", "仪表盘", "数据大屏"].map((name, i) => (
              <span key={i} className="badge badge-primary badge-lg">{i + 1}. {name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
