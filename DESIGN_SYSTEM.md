# PM 项目管理工具 - 设计系统规范

## 🎨 颜色系统

### 主色调
```css
Primary Blue:    #3b82f6 (Blue 500)
Hover:         #2563eb (Blue 600)
Active:        #1d4ed8 (Blue 700)
```

### Slate 色系（表面色）
```css
Surface 0:  #ffffff (白色背景)
Surface 50: #f8fafc (页面背景)
Surface 100: #f1f5f9 (边框)
Surface 200: #e2e8f0 (分隔线)
Surface 300: #cbd5e1 (禁用边框)
Surface 400: #94a3b8 (图标)
Surface 500: #64748b (次要文本)
Surface 600: #475569 (文本)
Surface 700: #334155 (标题)
Surface 800: #1e293b (深色背景)
Surface 900: #0f172a (主要文本)
```

### 语义色
```css
Success:       #10b981 (Green 500)
Warning:       #f59e0b (Amber 500)
Danger:        #ef4444 (Red 500)
Info:          #3b82f6 (Blue 500)
```

---

## 📐 间距系统

```css
--space-xs:   0.25rem  /* 4px  */
--space-sm:   0.5rem   /* 8px  */
--space-md:   0.75rem  /* 12px */
--space-lg:   1rem     /* 16px */
--space-xl:   1.5rem   /* 24px */
--space-2xl:  2rem     /* 32px */
```

---

## 🔲 圆角规范

```css
--radius-sm:   8px   /* 小：按钮、输入框 */
--radius-md:   10px  /* 中：对话框内元素 */
--radius-lg:   12px  /* 大：卡片、面板 */
--radius-xl:   16px  /* 超大：对话框、页面容器 */
```

---

## 🎭 动画规范

### 过渡
```css
/* 快速微交互 */
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1)

/* 标准交互 */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)

/* 缓慢交互 */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### 变换
```css
/* 悬停上浮 */
transform: translateY(-1px)

/* 卡片悬停 */
transform: translateY(-2px)

/* 按钮按下 */
transform: translateY(0)
```

---

## 🌟 阴影层级

```css
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md:   0 4px 12px rgba(0, 0, 0, 0.08)
--shadow-lg:   0 8px 24px rgba(0, 0, 0, 0.12)
--shadow-xl:   0 20px 60px rgba(0, 0, 0, 0.15)
```

---

## 📝 组件样式规范

### 按钮
- 默认按钮：`raised` 属性，带阴影
- 文本按钮：`text` 属性，无背景
- 次要按钮：`outlined` 属性，带边框
- 尺寸：`small` / 默认 / `large`
- 圆角：10px

### 输入框
- 圆角：10px
- 边框：#e2e8f0
- Focus：蓝色光晕 3px
- 错误：红色边框 + 红色光晕

### 卡片
- 边框：#f1f5f9
- 圆角：16px
- 悬停：阴影增强 + 上浮 2px
- 内边距：1.25rem

### 对话框
- 圆角：16px
- 阴影：60px 高度模糊
- 头部：白色背景 + 底部边框
- 内容：白色背景
- 底部：浅灰背景 + 顶部边框

---

## 🎯 设计原则

### ✅ 必须遵守
1. **颜色对比度**：文本与背景对比度 ≥ 4.5:1
2. **触摸目标**：最小 44x44px（实际上大部分按钮已满足）
3. **cursor-pointer**：所有可点击元素
4. **过渡动画**：所有交互状态使用 150-200ms
5. **视觉反馈**：hover、focus、active 都有明确反馈

### ❌ 禁止使用
1. **Emojis 作为图标**：使用 PrimeIcons
2. **硬编码颜色**：使用 CSS 变量或 PrimeVue 语义化颜色
3. **过慢的动画**：超过 300ms 的过渡
4. **不统一的间距**：坚持使用间距系统
5. **无障碍忽略**：确保键盘导航和屏幕阅读器支持

---

## 🧩 组件清单

| 组件 | 文件 | 状态 | 备注 |
|------|------|------|------|
| 主容器 | App.vue | ✅ | 全局样式、PrimeVue 组件 |
| 主题配置 | main.ts | ✅ | 自定义语义化颜色 |
| 主布局 | Home.vue | ✅ | Splitter、右侧容器 |
| 侧边栏 | PL.vue | ✅ | 项目列表、品牌标识、搜索 |
| 项目详情 | PD.vue | ✅ | 仓库网格、空状态 |
| 工具栏 | ToolBar.vue | ✅ | 操作按钮、Tooltip |
| 窗口栏 | WindowBar.vue | ✅ | 窗口控制按钮 |
| 仪表盘 | Dashboard.vue | ✅ | 统计卡片、欢迎区 |

---

## 📱 响应式断点

```css
/* 移动端 */
@media (max-width: 640px) {
  /* 手机 < 640px */
}

/* 平板 */
@media (max-width: 768px) {
  /* 平板 < 768px */
}

/* 桌面 */
@media (min-width: 1024px) {
  /* 桌面 ≥ 1024px */
}
```

---

## 🎨 渐变配色

### 主色渐变（蓝色）
```css
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

### 图标背景渐变
```css
/* 蓝色（项目/仓库） */
background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);

/* 黄色（SVN） */
background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);

/* 绿色（成功） */
background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
```

---

## 🔧 快速参考

### 常用样式类
```css
.cursor-pointer        { cursor: pointer; }
.text-left            { text-align: left; }
.text-center          { text-align: center; }
.font-medium          { font-weight: 500; }
.font-semibold        { font-weight: 600; }
.font-bold           { font-weight: 700; }
```

### PrimeVue 组件深度选择器优化
```css
:deep(.p-button) { }
:deep(.p-inputtext) { }
:deep(.p-card) { }
:deep(.p-dialog) { }
:deep(.p-panel) { }
:deep(.p-toolbar) { }
:deep(.p-splitter) { }
```

---

## ✅ 优化检查清单

- [x] 所有组件使用统一的 Slate 色系
- [x] 所有圆角符合规范（8/10/12/16px）
- [x] 所有动画使用统一的 easing function
- [x] 所有阴影渐进增强
- [x] 所有交互有视觉反馈
- [x] 所有文本对比度 ≥ 4.5:1
- [x] 所有组件响应式友好
- [x] 空状态设计统一
- [x] 图标使用 PrimeIcons
- [x] 无硬编码颜色

---

## 🚀 下一步建议

当前 UI 优化已基本完成。建议接下来实现：

1. **Git 仓库状态读取** - 显示分支、未提交更改等
2. **任务管理模块** - 为每个仓库添加任务列表
3. **快捷操作工具栏功能** - 实现工具栏按钮的实际功能
4. **Dashboard 统计增强** - 添加图表、趋势分析

项目已具备专业的设计基础，可以开始实现核心功能了！
