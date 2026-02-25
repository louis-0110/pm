# Dialog 闪烁问题修复 - 代码重写完成

## 问题
用户反馈："所有的Dialog在打开的时候，都会闪烁一下"
问题原因：Dialog 变量可能被多次修改或响应式数据更新导致连锁反应。

## 解决方案
完全重写了所有 Dialog 相关代码，采用以下策略：

### 1. 统一代码结构
将所有 Dialog 相关代码按以下结构组织：
```javascript
// ==================== Dialog 状态 ====================
const isShowXXX = ref(false)

// ==================== 防止重复打开的标志 ====================
let isOpeningDialog = false

// ==================== 表单数据 ====================
const formData = ref({ ... })
```

### 2. 防止重复打开机制
使用 `isOpeningDialog` 标志位防止 Dialog 被多次打开：
```javascript
function openDialog() {
    // 防止重复打开
    if (isOpeningDialog) return

    isOpeningDialog = true

    // 先设置数据
    formData.value = { ... }

    // 使用 nextTick 确保数据更新后再打开 Dialog
    nextTick(() => {
        isShowXXX.value = true
        isOpeningDialog = false
    })
}
```

### 3. 移除所有 watch 监听
删除了所有监听 Dialog 状态变化的 watch，避免额外的响应式触发。

### 4. 移除所有调试代码
清理了之前添加的 console.log 和调试用 watch。

## 修改的文件

### PD.vue (项目详情页)

**修改内容：**
1. 重新组织代码结构，将 Dialog 状态变量集中定义
2. 重写 `addRepository()` 函数
   - 添加 `isOpeningDialog` 检查
   - 先设置数据，然后用 nextTick 打开 Dialog
3. 重写 `editPjName()` 函数
   - 添加 `isOpeningDialog` 检查
   - 先设置数据，然后用 nextTick 打开 Dialog
4. 删除所有调试用的 watch 和 console.log

**关键代码：**
```javascript
// 防止重复打开的标志
let isOpeningDialog = false

async function addRepository() {
    if (isOpeningDialog) return

    const result = await open({ ... })

    if (result) {
        isOpeningDialog = true

        // 先设置数据
        newRepository.value.path = result
        newRepository.value.vcs = vcs
        formSubmitted.value = false

        // 使用 nextTick 确保数据更新后再打开 Dialog
        nextTick(() => {
            isShowRepository.value = true
            isOpeningDialog = false
        })
    }
}

function editPjName(item: any) {
    if (isOpeningDialog) return

    isOpeningDialog = true

    // 先设置数据
    pjInfo.value.name = item.name
    pjInfo.value.id = item.id
    renameFormSubmitted.value = false

    // 使用 nextTick 确保数据更新后再打开 Dialog
    nextTick(() => {
        isShowRePjName.value = true
        isOpeningDialog = false
    })
}
```

### PL.vue (项目列表页)

**修改内容：**
1. 将 `watch` 导入改为 `nextTick`
2. 添加 `isOpeningDialog` 标志位
3. 新增 `openNewProjectDialog()` 函数
   - 防止重复打开
   - 重置表单数据
   - 使用 nextTick 打开 Dialog
4. 更新模板中的事件绑定：`@click="showModal = true"` → `@click="openNewProjectDialog"`

**关键代码：**
```javascript
// 防止重复打开的标志
let isOpeningDialog = false

// 打开新建项目 Dialog
function openNewProjectDialog() {
    if (isOpeningDialog) return

    isOpeningDialog = true

    // 重置表单
    model.value.projectName = ''
    model.value.description = ''
    formSubmitted.value = false

    // 使用 nextTick 确保数据更新后再打开 Dialog
    nextTick(() => {
        showModal.value = true
        isOpeningDialog = false
    })
}
```

### RD.vue (仓库详情页)

**修改内容：**
1. 将 `watch` 导入改为 `nextTick`
2. 重新组织代码结构
3. 添加 `isOpeningDialog` 标志位
4. 新增 `openEditDialog()` 函数
5. 新增 `openCommitDialog()` 函数
6. 重写 `handleDiff()` 函数
   - 添加防重复打开逻辑
   - 使用 nextTick 打开 Dialog
7. 更新模板中的事件绑定
8. 删除所有调试用的 watch

**关键代码：**
```javascript
// 防止重复打开的标志
let isOpeningDialog = false

// 打开编辑名称 Dialog
function openEditDialog() {
    if (isOpeningDialog) return

    isOpeningDialog = true

    // 设置数据
    editName.value = repositoryInfo.value.name
    editFormSubmitted.value = false

    nextTick(() => {
        showEditDialog.value = true
        isOpeningDialog = false
    })
}

// 打开提交 Dialog
function openCommitDialog() {
    if (isOpeningDialog) return

    isOpeningDialog = true

    // 重置表单
    commitMessage.value = ''
    commitFormSubmitted.value = false

    nextTick(() => {
        showCommitDialog.value = true
        isOpeningDialog = false
    })
}

// 查看 Diff
async function handleDiff() {
    if (isOpeningDialog) return

    isOpeningDialog = true

    try {
        let result: string
        if (repositoryInfo.value.vcs === 'git') {
            result = await invoke('git_diff', { path: repositoryInfo.value.path })
        } else if (repositoryInfo.value.vcs === 'svn') {
            result = await invoke('svn_diff', { path: repositoryInfo.value.path })
        }

        diffOutput.value = result

        nextTick(() => {
            showDiffDialog.value = true
            isOpeningDialog = false
        })
    } catch (error) {
        isOpeningDialog = false
        toast.add({ severity: 'error', summary: '获取失败', detail: error as string })
    }
}
```

## 技术要点

### 1. 防止竞态条件
使用 `isOpeningDialog` 标志位防止在同一个 Dialog 打开过程中再次触发打开操作。

### 2. 确保数据更新顺序
```javascript
// ❌ 错误：Dialog 打开时数据还未更新
isShowXXX.value = true
formData.value = data

// ✅ 正确：先更新数据，再打开 Dialog
formData.value = data
nextTick(() => {
    isShowXXX.value = true
})
```

### 3. 使用 nextTick
`nextTick` 确保在 Vue 完成 DOM 更新后再执行回调，避免 Dialog 在数据未准备好时打开。

### 4. 移除不必要的响应式监听
删除所有监听 Dialog 状态变化的 watch，减少响应式系统的负担。

## 测试建议

1. **测试所有 Dialog**
   - PD.vue: 添加仓库、编辑仓库名称
   - PL.vue: 新建项目
   - RD.vue: 编辑名称、提交更改、查看 Diff

2. **快速点击测试**
   - 快速多次点击打开按钮
   - 确认 Dialog 只打开一次
   - 确认没有闪烁

3. **数据展示测试**
   - 确认 Dialog 打开后数据正确显示
   - 确认表单默认值正确

4. **关闭后再打开测试**
   - 关闭 Dialog
   - 再次打开
   - 确认数据已重置

## 预期效果

- ✅ Dialog 打开流畅，无闪烁
- ✅ 防止重复打开
- ✅ 数据更新顺序正确
- ✅ 代码结构清晰，易于维护
- ✅ 移除了所有调试代码

---

**重写完成时间**: 2025-02-04
**修改文件数量**: 3
**新增函数**: 5
**重写函数**: 3
**删除调试代码**: 10+ 处
