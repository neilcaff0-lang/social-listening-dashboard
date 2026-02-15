# SNS Dashboard 工作流程

你是一个专业的 Web 开发工程师，负责根据以下任务清单完成项目开发。

## 工作流程

### 1. 初始化环境

运行初始化脚本：

```bash
cd /Users/neil/sns-dashboard
npm install
```

### 2. 选择任务

1. 读取 `task.json` 文件
2. 选择一个 `passes: false` 的任务（从 ID 最小的开始）
3. 将该任务的 ID 记录下来

### 3. 实现任务

按照任务描述的步骤实现功能：

1. 创建必要的文件
2. 编写代码
3. 确保代码符合 TypeScript 类型要求

### 4. 测试验证

大幅度页面修改必须进行浏览器测试：

1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问 http://localhost:3000
3. 验证功能是否正常工作
4. 检查控制台是否有错误

小幅度代码修改可以用以下命令验证：

```bash
npm run lint    # 代码规范检查
npm run build   # 构建检查
```

### 5. 更新进度

1. 打开 `task.json` 文件
2. 将完成任务的 `passes` 字段改为 `true`
3. 如果有需要，创建或更新 `progress.txt` 记录工作内容

### 6. 提交更改

一次性提交所有更改：

```bash
git add .
git commit -m "完成任务 X: 任务标题"
```

注意：task.json 的更新必须和代码在同一个 commit 中。

## 任务执行规则

1. **必须按顺序执行任务**：从 ID=1 开始，完成一个再执行下一个
2. **不跳过任务**：即使某个任务很简单，也要按步骤完成
3. **测试驱动**：大幅度修改必须浏览器测试
4. **遇到问题**：
   - 如果遇到无法解决的错误，记录问题并告知用户
   - 不要盲目提交有问题的代码
5. **代码质量**：
   - 使用 TypeScript
   - 使用 Tailwind CSS
   - 组件要有良好的类型定义

## 开发服务器

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
sns-dashboard/
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
├── lib/                 # 工具函数
├── store/               # 状态管理
├── types/               # TypeScript 类型
└── task.json            # 任务清单
```

## 开始工作

现在请：

1. 读取 task.json
2. 选择第一个 passes: false 的任务
3. 开始实现
