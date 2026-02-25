# PrimeVue 主题配置说明

## 问题
Dialog 和组件显示绿色，而不是配置的蓝色主题

## 根本原因
PrimeVue 4.x 使用了新的主题系统 `@primeuix/themes`，需要：
1. 导入主题 CSS 文件
2. 使用 CSS 变量（设计令牌）来自定义颜色

## 解决方案

### 1. 导入主题 CSS
在 `main.ts` 中添加：
```typescript
import '@primeuix/themes/aura/theme.css'
import './styles/theme.css'  // 自定义主题
```

### 2. 创建自定义主题
创建了 `src/styles/theme.css`，定义蓝色系的设计令牌：

```css
:root {
    /* Primary 色板 - 蓝色系 */
    --p-primary-600: #2563eb;  /* 主要按钮颜色 */
    --p-primary-700: #1d4ed8;  /* 悬停颜色 */
    --p-primary-800: #1e40af;  /* 激活颜色 */

    /* Surface 色板 */
    --p-surface-0: #ffffff;    /* 纯白背景 */
    --p-surface-50: #f8fafc;   /* 浅灰背景 */
    /* ... */
}
```

### 3. CSS 变量命名规范
PrimeVue 4.x 使用以下命名规范：
- `--p-primary-{50-950}`: Primary 色板
- `--p-surface-{0-950}`: Surface 色板
- `--p-{component}-{property}`: 组件特定属性

## 主题颜色应用

### Button 组件
```vue
<Button label="提交" severity="primary" />
<!-- 背景色: --p-primary-600 (#2563eb) -->
<!-- 悬停色: --p-primary-700 (#1d4ed8) -->
```

### Dialog 组件
```vue
<Dialog v-model:visible="visible" header="标题">
    <!-- 背景色: --p-surface-0 (#ffffff) -->
    <!-- 边框色: --p-surface-200 (#e2e8f0) -->
</Dialog>
```

### InputText 组件
```vue
<InputText />
<!-- 聚焦边框: --p-primary-600 (#2563eb) -->
<!-- 聚焦阴影: --p-primary-100 (#dbeafe) -->
```

## 自定义主题颜色

### 修改主题色
如果想换成其他颜色，只需修改 `src/styles/theme.css`：

```css
/* 紫色系 */
--p-primary-600: #9333ea;
--p-primary-700: #7e22ce;
--p-primary-800: #6b21a8;

/* 绿色系 */
--p-primary-600: #16a34a;
--p-primary-700: #15803d;
--p-primary-800: #166534;

/* 橙色系 */
--p-primary-600: #ea580c;
--p-primary-700: #c2410c;
--p-primary-800: #9a3412;
```

## 文件结构
```
src/
├── main.ts                    # 导入主题 CSS
├── styles/
│   ├── global.css            # 全局样式
│   └── theme.css             # 自定义主题（新建）
└── App.vue                    # 组件样式覆盖
```

## 验证主题是否生效

### 检查清单
- [ ] Button `severity="primary"` 显示蓝色
- [ ] InputText 聚焦时边框显示蓝色
- [ ] Dialog 主要按钮显示蓝色
- [ ] 所有组件颜色一致

### 开发者工具检查
在浏览器开发者工具中检查：
```css
/* 应该看到这些 CSS 变量 */
--p-primary-600: #2563eb
--p-primary-700: #1d4ed8
--p-surface-0: #ffffff
```

## 与 App.vue 样式的关系

App.vue 中的样式仍然有效，但优先级更高：
```css
/* App.vue 中的 :deep() 样式会覆盖主题 */
:deep(.p-dialog) {
    border-radius: 16px;  /* 这会保留 */
    background: #ffffff;  /* 这会覆盖主题变量 */
}
```

**建议：**
- 保留圆角、阴影等装饰性样式在 App.vue
- 移除颜色相关的硬编码，改用 CSS 变量

## 技术细节

### PrimeVue 4.x 主题系统
- 使用 **设计令牌（Design Tokens）**
- 基于 **CSS 变量**
- 支持 **语义化颜色**
- 提供 **完整色板**（50-950）

### 主题加载顺序
1. `@primeuix/themes/aura/theme.css` - 基础主题
2. `./styles/theme.css` - 自定义覆盖
3. `App.vue` 中的 `:deep()` - 组件级覆盖

**优先级：** 组件级 > 自定义主题 > 基础主题

---

**状态:** ✅ 已配置蓝色主题
**主题色:** #2563eb (蓝色)
**文件修改:**
- `src/main.ts` - 添加主题导入
- `src/styles/theme.css` - 新建自定义主题
