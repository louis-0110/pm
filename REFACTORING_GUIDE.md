# PM 项目重构指南

本文档提供 PD.vue 和 RD.vue 组件的详细重构指南，基于已完成的 PL.vue 重构模式。

---

## 🎯 重构目标

- 使用新的 composables 替代直接数据库操作
- 使用统一的常量定义
- 使用 useDialog/useFormDialog 管理对话框
- 使用 useToast 统一消息提示

---

## 📋 重构步骤（以 PL.vue 为参考）

### 步骤 1：更新 Imports

**原代码**：
```typescript
import dbFn from '@/db'
import { useToast } from 'primevue/usetoast'
import { gitApi, svnApi } from '@/api'
```

**重构后**：
```typescript
import { useDialog, useFormDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { useVcs } from '@/composables/useVcs'
import { MESSAGES } from '@/constants/messages'
import { VCS_TYPES, detectVcsFromUrl } from '@/constants/vcs'
```

### 步骤 2：移除数据库直接操作

**原代码**：
```typescript
const db = await dbFn

const getProjectInfo = async (id: string) => {
    const res = await db.select<Project[]>('SELECT * FROM projects WHERE id = $1', [id])
    projectInfo.value = res[0] || null
}
```

**重构后**：
```typescript
let dbCache: DatabaseInstance | null = null

async function getDb(): Promise<DatabaseInstance> {
  if (!dbCache) {
    const { useDatabase } = await import('@/composables/useDatabase')
    dbCache = await useDatabase()
  }
  return dbCache
}

const getProjectInfo = async (id: string) => {
    const db = await getDb()
    projectInfo.value = await db.project.findById(Number(id))
}
```

### 步骤 3：对话框状态管理

**原代码**：
```typescript
const showModal = ref(false)
const formSubmitted = ref(false)
let isOpeningDialog = false

function openDialog() {
    if (isOpeningDialog) return
    isOpeningDialog = true
    // 重置表单...
    nextTick(() => {
        showModal.value = true
        isOpeningDialog = false
    })
}
```

**重构后**：
```typescript
const formDialog = useFormDialog<{
    name: string
    description: string
}>()

function openDialog() {
    formDialog.openWithReset({
        name: '',
        description: ''
    })
}

// 在模板中使用
// v-model:visible="formDialog.visible"
// v-model="formDialog.formData.name"
// :class="{ 'p-invalid': !formDialog.formData.name && formDialog.submitted }"
```

### 步骤 4：Toast 消息

**原代码**：
```typescript
toast.add({
    severity: 'success',
    summary: '创建成功',
    detail: `项目 "${name}" 已创建`,
    life: 3000
})
```

**重构后**：
```typescript
toast.createSuccess(name)  // 预设方法
// 或
toast.showSuccess(MESSAGES.SUCCESS.CREATE, MESSAGES.PROJECT.CREATED(name))
```

### 步骤 5：VCS 操作

**原代码**：
```typescript
if (repo.vcs === 'git') {
    await gitApi.pull(repo.path)
} else if (repo.vcs === 'svn') {
    await svnApi.update(repo.path)
}
```

**重构后**：
```typescript
const vcs = useVcs()

// 统一接口，自动根据类型选择
await vcs.pull(repo.vcs, repo.path)
await vcs.push(repo.vcs, repo.path)
await vcs.commit(repo.vcs, repo.path, message)
```

### 步骤 6：常量使用

**原代码**：
```typescript
const vcsType = newRepository.value.vcs === 'git' ? 'Git' : 'SVN'
cloneProgress.value.status = `正在${vcsType === 'Git' ? '克隆' : '检出'}仓库...`
```

**重构后**：
```typescript
import { VCS_TYPES, getVcsLabel } from '@/constants/vcs'

const vcsType = getVcsLabel(newRepository.value.vcs as VcsType)
cloneProgress.value.status = `正在${vcsType === 'Git' ? '克隆' : '检出'}仓库...`
```

---

## 🔧 PD.vue 具体修改建议

### 需要修改的函数列表

| 函数名 | 修改内容 |
|--------|----------|
| `openPjWithVscode` | 使用 `toast.openSuccess()` |
| `getProjectInfo` | 使用 `db.project.findById()` |
| `getRepositories` | 使用 `db.repository.findByProjectId()` |
| `onCreateNewRepository` | 使用 `vcs.clone()`, `db.repository.create()` |
| `deleteRepository` | 使用 `db.repository.delete()` |
| `batchPull` | 使用 `vcs.pull()` 批量操作 |
| `batchPush` | 使用 `vcs.push()` 批量操作 |
| `loadGitStatus` | 使用 `vcs.getStatus()` |
| `loadSvnStatus` | 使用 `vcs.getStatus()` |

### 对话框状态替换

| 原变量 | 新变量 |
|--------|--------|
| `isShowRepository` | `formDialog.visible` |
| `isShowRePjName` | `renameDialog.visible` |
| `showBatchResults` | `batchResultsDialog.visible` |
| `cloneProgress.show` | `cloneProgressDialog.visible` |
| `formSubmitted` | `formDialog.submitted` |
| `renameFormSubmitted` | `renameDialog.submitted` |

---

## 🔧 RD.vue 具体修改建议

### 需要修改的函数列表

| 函数名 | 修改内容 |
|--------|----------|
| `loadRepositoryInfo` | 使用 `db.repository.findById()` |
| `loadGitStatus` | 使用 `vcs.getStatus()` |
| `loadSvnStatus` | 使用 `vcs.getStatus()` |
| `handlePull` | 使用 `vcs.pull()` |
| `handlePush` | 使用 `vcs.push()` |
| `handleCommit` | 使用 `vcs.commit()` |
| `handleUpdate` | 使用 `vcs.pull()` (SVN) |
| `handleDiff` | 使用 `vcs.diff()` |
| `handleDiff` | 使用 `vcs.clone()` |

---

## 📝 完整示例：函数重构

### 示例 1：添加仓库

**原代码**：
```typescript
async function onCreateNewRepository() {
    formSubmitted.value = true

    if (!newRepository.value.name) {
        return
    }

    const res = await db.execute(
        'INSERT INTO repositories (name, path, project_id, vcs) VALUES ($1, $2, $3, $4)',
        [newRepository.value.name, newRepository.value.path, newRepository.value.project_id, newRepository.value.vcs]
    )

    if (res.rowsAffected > 0) {
        toast.add({
            severity: 'success',
            summary: '添加成功',
            detail: '仓库已添加',
            life: 3000
        })
        await getRepositories(projectInfo.value.id)
    }
}
```

**重构后**：
```typescript
async function onCreateNewRepository() {
    formDialog.markSubmitted()

    if (!formDialog.formData.name) {
        return
    }

    const db = await getDb()
    const repository = await db.repository.create({
        name: formDialog.formData.name,
        path: formDialog.formData.path,
        project_id: Number(formDialog.formData.project_id),
        vcs: formDialog.formData.vcs as 'git' | 'svn' | ''
    })

    if (repository) {
        toast.showSuccess(MESSAGES.SUCCESS.CREATE, MESSAGES.REPOSITORY.ADDED)
        await getRepositories(projectInfo.value!.id)
        formDialog.closeAndReset()
    }
}
```

### 示例 2：批量拉取

**原代码**：
```typescript
async function batchPull() {
    batchLoading.value.pull = true
    const results: Array<{ repo: Repository; success: boolean; message: string }> = []

    for (const repo of repositoryList.value) {
        try {
            let message: string
            if (repo.vcs === 'git') {
                message = await gitApi.pull(repo.path)
            } else if (repo.vcs === 'svn') {
                message = await svnApi.update(repo.path)
            }
            results.push({ repo, success: true, message })
            await loadGitStatus(repo)
        } catch (error) {
            results.push({ repo, success: false, message: error as string })
        }
    }

    batchLoading.value.pull = false
    showBatchResults.value = true
    batchResults.value = results
}
```

**重构后**：
```typescript
async function batchPull() {
    batchLoading.value.pull = true
    const results: Array<{ repo: Repository; success: boolean; message: string }> = []

    for (const repo of repositoryList.value) {
        try {
            const message = await vcs.pull(repo.vcs, repo.path)
            results.push({ repo, success: true, message })
            await loadRepositoryStatus(repo)
        } catch (error) {
            results.push({ repo, success: false, message: error as string })
        }
    }

    batchLoading.value.pull = false
    batchResultsDialog.open()
    batchResults.value = results
}
```

---

## ⚠️ 注意事项

1. **数据库操作**：所有数据库操作都需要先调用 `await getDb()`
2. **类型转换**：注意 ID 的类型转换（String ↔ Number）
3. **对话框关闭**：使用 `closeAndReset()` 或 `close()` 方法
4. **表单验证**：使用 `markSubmitted()` 标记，使用 `submitted` 属性检查
5. **VCS 类型**：使用 `VCS_TYPES` 常量，避免硬编码字符串

---

## 🚀 快速参考

### Composables 导入

```typescript
import { useDialog, useFormDialog } from '@/composables/useDialog'
import { useToast } from '@/composables/useToast'
import { useVcs } from '@/composables/useVcs'
import { MESSAGES } from '@/constants/messages'
import { VCS_TYPES, detectVcsFromUrl } from '@/constants/vcs'
```

### 数据库操作模式

```typescript
// 获取 DB 实例
const db = await getDb()

// 项目操作
await db.project.findAll()
await db.project.findById(id)
await db.project.create(name, description)
await db.project.delete(id)

// 仓库操作
await db.repository.findByProjectId(projectId)
await db.repository.findById(id)
await db.repository.create(data)
await db.repository.delete(id)
```

### Toast 消息模式

```typescript
toast.showSuccess(summary, detail)
toast.showError(summary, detail)
toast.showWarning(summary, detail)
toast.showInfo(summary, detail)

// 预设消息
toast.createSuccess(name)
toast.deleteSuccess(name)
toast.updateSuccess(name)
toast.operationFailed(action, error)
```

### VCS 操作模式

```typescript
const vcs = useVcs()

// 统一接口
await vcs.getStatus(vcsType, path)
await vcs.pull(vcsType, path)
await vcs.push(vcsType, path)
await vcs.commit(vcsType, path, message)
await vcs.diff(vcsType, path)
await vcs.clone(vcsType, url, targetPath)
```

---

## ✅ 重构完成后检查清单

- [ ] 所有 `db.select()` 替换为 `db.project.xxx()` 或 `db.repository.xxx()`
- [ ] 所有 `db.execute()` 替换为数据仓库方法
- [ ] 所有 `toast.add()` 替换为 `toast.xxx()` 方法
- [ ] 所有直接对话框 `ref` 替换为 `useDialog/useFormDialog`
- [ ] 所有硬编码的 VCS 类型字符串替换为 `VCS_TYPES` 常量
- [ ] 所有 `gitApi`/`svnApi` 调用替换为 `vcs.xxx()` 方法
- [ ] 测试所有功能确保正常运行
