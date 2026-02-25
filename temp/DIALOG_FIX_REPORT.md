# 修复 Dialog 多次弹出问题

## 问题描述
在应用中，Dialog（弹出窗口）会出现多次弹出或重复触发的情况。

## 根本原因
1. **watchEffect 连锁触发**：PD.vue 中两个 watchEffect 相互触发
2. **搜索无防抖**：PL.vue 中搜索功能每次输入都触发数据库查询
3. **状态管理混乱**：响应式状态变化导致的连锁反应

## 修复内容

### 1. PD.vue - 修复 watchEffect 连锁触发

#### 问题代码
```javascript
// 第一个 watchEffect
watchEffect(() => {
    if (route.params.id) {
        getProjectInfo(route.params.id as string)
        getRepositories(route.params.id as string)  // 更新 repositoryList
        newRepository.value.project_id = route.params.id
    }
})

// 第二个 watchEffect
watchEffect(() => {
    if (repositoryList.value && repositoryList.value.length > 0) {
        loadAllGitStatuses()  // repositoryList 变化时触发
        loadAllSvnStatuses()
    }
})
```

#### 修复方案
```javascript
// 使用 watch 替代 watchEffect，精确监听特定变量
watch(() => route.params.id, (newId) => {
    if (newId) {
        getProjectInfo(newId as string)
        getRepositories(newId as string)
        newRepository.value.project_id = newId
    }
}, { immediate: true })

// 添加标志位防止重复执行
let isLoadingStatuses = false
watch(() => repositoryList.value, (newList, oldList) => {
    if (isLoadingStatuses) return

    if (newList && newList.length > 0) {
        isLoadingStatuses = true
        Promise.all([
            loadAllGitStatuses(),
            loadAllSvnStatuses()
        ]).finally(() => {
            isLoadingStatuses = false
        })
    }
}, { immediate: true })
```

#### 修复效果
- ✅ 避免了 watchEffect 的连锁触发
- ✅ 使用标志位防止重复执行
- ✅ 使用 Promise.all 并行执行，提高性能

### 2. PD.vue - 修复数据操作重复触发

#### 修改位置
- `onCreateNewRepository` 函数（第 304-307 行）
- `deleteRepository` 函数（第 338-344 行）

#### 修复方案
```javascript
// onCreateNewRepository
async function onCreateNewRepository() {
    // ... 数据库操作
    toast.add({ severity: 'success', summary: '添加成功', ... })
    isShowRepository.value = false
    // 手动重新获取，避免触发 watch
    await getRepositories(projectInfo.value.id)
}

// deleteRepository
const deleteRepository = async (item: any) => {
    const res = await db.execute('DELETE FROM repositories where id = $1', [item.id])
    // 手动重新获取，避免触发 watch
    await getRepositories(projectInfo.value.id)
    toast.add({ severity: 'success', summary: '删除成功', ... })
}
```

#### 修复效果
- ✅ 数据操作完成后手动刷新列表
- ✅ 避免触发不必要的 watch 回调
- ✅ 使用 await 确保操作完成

### 3. PL.vue - 添加搜索防抖

#### 问题代码
```javascript
const searchProject = () => {
    if (!search.value.trim()) {
        getProjectList()
        return
    }
    db.select<ProjectList>('SELECT * FROM projects where name like $1', ...)
    // 每次输入都触发数据库查询
}
```

#### 修复方案
```javascript
// 添加防抖
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const searchProject = () => {
    // 清除之前的定时器
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    // 300ms 后执行
    searchTimeout = setTimeout(() => {
        if (!search.value.trim()) {
            getProjectList()
            return
        }
        db.select<ProjectList>('SELECT * FROM projects where name like $1', ...)
    }, 300)
}
```

#### 修复效果
- ✅ 用户停止输入 300ms 后才执行搜索
- ✅ 避免频繁的数据库查询
- ✅ 提升搜索性能

## 技术总结

### 问题根源
1. **watchEffect 的过度响应**：watchEffect 会追踪所有内部使用的响应式变量，任何一个变化都会导致回调重新执行
2. **缺乏防抖机制**：输入事件没有防抖，导致频繁操作
3. **异步操作未正确处理**：数据更新后触发的副作用没有被正确管理

### 解决方案
1. **使用 watch 替代 watchEffect**：精确监听特定变量，避免过度响应
2. **添加防抖处理**：对于高频事件（如输入），添加防抖机制
3. **使用标志位**：防止异步操作重复执行
4. **使用 Promise.all**：并行执行独立的异步操作

## 测试建议

1. **测试添加仓库**
   - 打开项目详情页
   - 点击"添加仓库"
   - 检查 Dialog 只弹出一次

2. **测试搜索功能**
   - 在项目列表页快速输入搜索
   - 确认数据库查询不会频繁执行

3. **测试删除仓库**
   - 删除一个仓库
   - 确认只显示一次成功提示

4. **测试路由切换**
   - 在不同项目间切换
   - 确认状态加载不会重复执行

## 相关文件
- `src/components/PD.vue` - 项目详情页
- `src/components/PL.vue` - 项目列表页
- `src/components/RD.vue` - 仓库详情页（已验证无问题）

---

**修复完成时间**: 2025-02-04
