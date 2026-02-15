#!/bin/bash

# 自动 Git 提交脚本
# 监控文件变化并自动提交

PROJECT_DIR="/Users/neil/sns-dashboard"
LOG_FILE="$PROJECT_DIR/auto-git.log"

cd "$PROJECT_DIR"

echo "=== 自动 Git 监控已启动 ===" | tee -a "$LOG_FILE"
echo "项目目录: $PROJECT_DIR" | tee -a "$LOG_FILE"
echo "监控中... (按 Ctrl+C 停止)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 防抖动 - 避免频繁提交
LAST_COMMIT_TIME=0
DEBOUNCE_SECONDS=5

commit_changes() {
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - LAST_COMMIT_TIME))

    if [ $ELAPSED -lt $DEBOUNCE_SECONDS ]; then
        return
    fi

    LAST_COMMIT_TIME=$CURRENT_TIME

    # 检查是否有变化
    if [ -n "$(git status --porcelain)" ]; then
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        git add .
        git commit -m "自动保存 - $TIMESTAMP"
        echo "[$TIMESTAMP] 已提交更改" | tee -a "$LOG_FILE"
    fi
}

# 监控 src 和 public 目录的变化
fswatch -o "$PROJECT_DIR/src" "$PROJECT_DIR/public" | while read; do
    commit_changes
done
