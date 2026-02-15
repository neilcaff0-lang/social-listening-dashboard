#!/bin/bash
# SNS Dashboard 启动脚本

cd /Users/neil/sns-dashboard

# 检查是否已有服务在运行
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用，正在终止旧进程..."
    kill $(lsof -t -i :3000) 2>/dev/null
    sleep 1
fi

# 清理锁文件
rm -rf .next/dev/lock 2>/dev/null

echo "🚀 启动 SNS Dashboard..."
echo "📍 地址: http://localhost:3000/dashboard"
echo ""

npm run dev
