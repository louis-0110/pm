# PrimeVue 主题配置调试

## 问题
Dialog 显示绿色，而不是配置的蓝色主题

## 可能的原因

### 1. PrimeVue 4.x 主题系统变化
PrimeVue 4.x 使用了新的主题系统 `@primeuix/themes`，配置方式可能与旧版本不同

### 2. CSS 优先级问题
App.vue 中的自定义样式可能覆盖了主题样式

## 调试步骤

### 步骤 1: 检查 CSS 变量
在浏览器开发者工具中检查：
```css
--p-primary-color: 应该是 #2563eb
```

### 步骤 2: 测试简单 Button
创建一个测试 Button 看主题是否生效：
```vue
<Button label="测试按钮" severity="primary" />
```
如果是蓝色，说明主题生效了，只是 Dialog 有问题
如果是绿色，说明主题没生效

### 步骤 3: 检查 DOM 结构
看看 Dialog 的 HTML 结构和实际应用的样式

## 解决方案

### 方案 A: 使用 PrimeVue 4.x 新的配置方式
检查是否需要导入主题 CSS

### 方案 B: 移除 App.vue 中的自定义样式
让主题系统完全控制样式

### 方案 C: 使用 CSS 变量覆盖
在 App.vue 中使用 CSS 变量而不是硬编码颜色
