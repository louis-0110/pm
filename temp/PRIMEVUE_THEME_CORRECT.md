# PrimeVue 4.x 主题配置 - 正确方式

## 问题
1. 尝试导入不存在的 CSS 文件：`@primeuix/themes/aura/theme.css`
2. Dialog 显示绿色而不是蓝色

## 根本原因
PrimeVue 4.x 的主题系统与旧版本不同：
- **不再提供预编译的 CSS 文件**
- **使用 JavaScript 配置来生成主题**
- **通过 `semantic` 配置来自定义颜色**

## 正确的配置方式

### 1. main.ts 中的主题配置（主要方式）

```typescript
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

createApp(App).use(PrimeVue, {
    theme: {
        preset: Aura,              // 使用 Aura 预设主题
        options: {
            prefix: 'p',
            darkModeSelector: false,
            cssLayer: false
        },
        semantic: {                // 自定义颜色
            primary: {
                50: '#eff6ff',     // 最浅的蓝色
                500: '#3b82f6',    // 标准蓝色
                600: '#2563eb',    // 主要按钮颜色
                700: '#1d4ed8',    // 悬停颜色
                // ... 更多色阶
            },
            colorScheme: {
                light: {
                    primary: {
                        color: '{primary.600}',        // 默认颜色
                        hoverColor: '{primary.700}',   // 悬停颜色
                        activeColor: '{primary.600}'   // 激活颜色
                    }
                }
            }
        }
    }
})
```

### 2. colorScheme 配置说明

```typescript
colorScheme: {
    light: {                        // 浅色模式
        primary: {
            color: '{primary.600}',  // 引用 primary.600 的值
            hoverColor: '{primary.700}',
            activeColor: '{primary.600}'
        },
        highlight: {
            background: '{primary.50}',
            focusBackground: '{primary.100}',
            color: '{primary.700}',
            focusColor: '{primary.800}'
        }
    }
}
```

**关键点：**
- 使用 `{primary.600}` 这样的语法引用色板
- `{...}` 语法会自动解析为对应的颜色值
- 所有组件会自动应用这些颜色

## 错误的方式

### ❌ 不应该导入不存在的 CSS
```typescript
import '@primeuix/themes/aura/theme.css'  // 这个文件不存在！
```

### ❌ 不应该只依赖 CSS 变量
```css
/* 仅靠 CSS 变量不会生效 */
:root {
    --p-primary-600: #2563eb;
}
```

## 应用颜色的组件

### 受 semantic 配置影响的组件：

1. **Button**
   ```vue
   <Button severity="primary" />
   <!-- 使用 primary.600 作为背景色 -->
   ```

2. **Dialog**
   ```vue
   <Dialog v-model:visible="visible">
   <!-- 主要按钮使用 primary 颜色 -->
   ```

3. **InputText**
   ```vue
   <InputText />
   <!-- 聚焦边框使用 primary 颜色 -->
   ```

4. **Checkbox / Radio**
   ```vue
   <Checkbox />
   <!-- 选中状态使用 primary 颜色 -->
   ```

5. **所有其他 PrimeVue 组件**
   - Toggle
   - Slider
   - ProgressBar
   - DatePicker
   - 等等...

## 自定义主题颜色

### 修改为主要颜色

```typescript
// main.ts
semantic: {
    primary: {
        600: '#2563eb',  // 蓝色
    }
}

// 改为紫色
semantic: {
    primary: {
        600: '#9333ea',  // 紫色
        700: '#7e22ce',
        // ... 其他色阶
    }
}

// 改为绿色
semantic: {
    primary: {
        600: '#16a34a',  // 绿色
        700: '#15803d',
        // ... 其他色阶
    }
}
```

### 完整的色板定义

建议定义完整的色板（50-950）以获得最佳效果：

```typescript
primary: {
    50: '#eff6ff',   // 最浅
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',   // 标准色
    600: '#2563eb',   // 主要色
    700: '#1d4ed8',   // 深色
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'    // 最深
}
```

## 文件结构

```
src/
├── main.ts              # 主题配置（主要）
├── styles/
│   ├── global.css       # 全局样式
│   └── theme.css        # 额外的主题覆盖（可选）
└── App.vue              # 组件样式
```

## 验证主题是否生效

### 检查点：
1. ✅ Button `severity="primary"` 显示蓝色
2. ✅ Dialog 主要按钮显示蓝色
3. ✅ InputText 聚焦边框显示蓝色
4. ✅ 所有组件颜色统一

### 开发者工具检查：
在浏览器中检查元素，查看计算后的样式：
```css
/* 主要按钮的背景色应该是 */
background-color: #2563eb;

/* 悬停时应该是 */
background-color: #1d4ed8;
```

## 与 App.vue 样式的关系

App.vue 中的 `:deep()` 样式会覆盖主题配置：

```css
/* App.vue */
:deep(.p-button) {
    border-radius: 10px;  /* ✅ 装饰性样式，保留 */
}

:deep(.p-button) {
    background: green;    /* ❌ 颜色覆盖，会破坏主题 */
}
```

**最佳实践：**
- ✅ 在 `main.ts` 中配置颜色
- ✅ 在 `App.vue` 中配置装饰性样式（圆角、阴影等）
- ❌ 避免在 `App.vue` 中硬编码颜色

## PrimeVue 4.x 主题系统特点

1. **基于配置而非 CSS**
   - 不需要导入主题 CSS 文件
   - 通过 JavaScript 对象配置

2. **使用设计令牌**
   - 完整的色板（50-950）
   - 语义化颜色命名

3. **自动应用**
   - 所有组件自动应用主题色
   - 无需手动编写 CSS

4. **类型安全**
   - TypeScript 类型支持
   - 配置时有智能提示

---

**配置状态:** ✅ 已正确配置
**主题色:** #2563eb (蓝色)
**配置方式:** main.ts 中的 semantic 配置
**文件修改:** main.ts（主要），theme.css（可选）
