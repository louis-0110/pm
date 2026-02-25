<template>
    <div class="repository-detail-page">
        <!-- 头部 -->
        <div class="detail-header">
            <div class="header-content">
                <Button
                    icon="pi pi-arrow-left"
                    text
                    severity="secondary"
                    @click="goBack"
                    class="back-button"
                />
                <div class="repository-info-large">
                    <div class="repository-icon-large" :class="repositoryInfo?.vcs">
                        <i :class="repositoryInfo?.vcs === 'git' ? 'pi pi-github' : 'pi pi-code-branch'" />
                    </div>
                    <div class="repository-text">
                        <h1>{{ repositoryInfo?.name || '未命名仓库' }}</h1>
                        <p class="repository-path-text">
                            <i class="pi pi-folder"></i>
                            {{ repositoryInfo?.path }}
                        </p>
                    </div>
                </div>
                <div class="header-actions">
                    <Button
                        icon="pi pi-pencil"
                        text
                        severity="secondary"
                        v-tooltip.top="'编辑名称'"
                        @click="openEditDialog"
                    />
                    <Button
                        icon="pi pi-copy"
                        text
                        severity="secondary"
                        v-tooltip.top="'复制路径'"
                        @click="copyPath"
                    />
                </div>
            </div>
        </div>

        <!-- Git 状态徽章 -->
        <div v-if="repositoryInfo?.vcs === 'git' && gitStatus" class="status-badges">
            <div class="status-badge">
                <i class="pi pi-code-branch"></i>
                <span class="badge-label">分支</span>
                <span class="badge-value">{{ gitStatus.branch || 'unknown' }}</span>
            </div>

            <div class="status-badge" :class="{ dirty: gitStatus.is_dirty, clean: !gitStatus.is_dirty }">
                <i :class="gitStatus.is_dirty ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'" />
                <span class="badge-label">状态</span>
                <span class="badge-value">
                    {{ gitStatus.is_dirty ? `${gitStatus.modified_files?.length || 0} 个修改` : '干净' }}
                </span>
            </div>

            <div class="status-badge">
                <i class="pi pi-code"></i>
                <span class="badge-label">提交</span>
                <span class="badge-value commit-hash">{{ gitStatus.commit?.slice(0, 8) || 'N/A' }}</span>
            </div>
        </div>

        <!-- SVN 状态徽章 -->
        <div v-if="repositoryInfo?.vcs === 'svn' && svnStatus" class="status-badges">
            <div class="status-badge">
                <i class="pi pi-code-branch"></i>
                <span class="badge-label">版本</span>
                <span class="badge-value">{{ svnStatus.revision || 'N/A' }}</span>
            </div>

            <div class="status-badge" :class="{ dirty: svnStatus.is_dirty, clean: !svnStatus.is_dirty }">
                <i :class="svnStatus.is_dirty ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'" />
                <span class="badge-label">状态</span>
                <span class="badge-value">
                    {{ svnStatus.is_dirty ? `${svnStatus.modified_files?.length || 0} 个修改` : '干净' }}
                </span>
            </div>

            <div class="status-badge" v-if="svnStatus.author">
                <i class="pi pi-user"></i>
                <span class="badge-label">作者</span>
                <span class="badge-value">{{ svnStatus.author }}</span>
            </div>

            <div class="status-badge" v-if="svnStatus.date">
                <i class="pi pi-calendar"></i>
                <span class="badge-label">日期</span>
                <span class="badge-value">{{ formatSvnDate(svnStatus.date || '') }}</span>
            </div>
        </div>

        <!-- 快捷操作 -->
        <div class="section-title">
            <i class="pi pi-bolt"></i>
            <span>快捷操作</span>
        </div>
        <div class="actions-grid">
            <!-- Git 操作 -->
            <template v-if="repositoryInfo?.vcs === 'git'">
                <Card class="action-card" @click="handlePull" :class="{ loading: loading.pull }">
                    <template #content>
                        <div class="action-item">
                            <div class="action-icon">
                                <i class="pi pi-download"></i>
                            </div>
                            <div class="action-content">
                                <div class="action-name">拉取</div>
                                <div class="action-desc">从远程拉取最新代码</div>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="action-card" @click="openCommitDialog" :class="{ disabled: !hasDirtyFiles() }">
                    <template #content>
                        <div class="action-item">
                            <div class="action-icon">
                                <i class="pi pi-check"></i>
                            </div>
                            <div class="action-content">
                                <div class="action-name">提交</div>
                                <div class="action-desc">{{ hasDirtyFiles() ? '提交当前更改' : '暂无更改' }}</div>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="action-card" @click="handlePush" :class="{ loading: loading.push }">
                    <template #content>
                        <div class="action-item">
                            <div class="action-icon">
                                <i class="pi pi-upload"></i>
                            </div>
                            <div class="action-content">
                                <div class="action-name">推送</div>
                                <div class="action-desc">推送本地提交到远程</div>
                            </div>
                        </div>
                    </template>
                </Card>
            </template>

            <!-- SVN 操作 -->
            <template v-if="repositoryInfo?.vcs === 'svn'">
                <Card class="action-card" @click="handleUpdate" :class="{ loading: loading.update }">
                    <template #content>
                        <div class="action-item">
                            <div class="action-icon">
                                <i class="pi pi-download"></i>
                            </div>
                            <div class="action-content">
                                <div class="action-name">更新</div>
                                <div class="action-desc">从服务器更新到最新版本</div>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="action-card" @click="openCommitDialog" :class="{ disabled: !hasDirtyFiles() }">
                    <template #content>
                        <div class="action-item">
                            <div class="action-icon">
                                <i class="pi pi-check"></i>
                            </div>
                            <div class="action-content">
                                <div class="action-name">提交</div>
                                <div class="action-desc">提交当前更改</div>
                            </div>
                        </div>
                    </template>
                </Card>
            </template>

            <!-- 通用操作 -->
            <Card class="action-card" @click="handleTerminal">
                <template #content>
                    <div class="action-item">
                        <div class="action-icon">
                            <i class="pi pi-desktop"></i>
                        </div>
                        <div class="action-content">
                            <div class="action-name">终端</div>
                            <div class="action-desc">在终端中打开</div>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="action-card" @click="handleOpenVscode">
                <template #content>
                    <div class="action-item">
                        <div class="action-icon" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #2563eb;">
                            <i class="pi pi-microsoft"></i>
                        </div>
                        <div class="action-content">
                            <div class="action-name">VSCode</div>
                            <div class="action-desc">用 VSCode 打开</div>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="action-card" @click="handleDiff">
                <template #content>
                    <div class="action-item">
                        <div class="action-icon">
                            <i class="pi pi-file-edit"></i>
                        </div>
                        <div class="action-content">
                            <div class="action-name">查看 Diff</div>
                            <div class="action-desc">查看文件变更</div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- 文件变更列表 -->
        <div v-if="hasDirtyFiles()" class="section-title">
            <i class="pi pi-list"></i>
            <span>文件变更</span>
            <Tag :value="`${dirtyFilesCount()} 个文件`" severity="secondary" />
        </div>
        <div v-if="hasDirtyFiles()" class="files-list">
            <!-- Git 文件变更 -->
            <template v-if="repositoryInfo?.vcs === 'git' && gitStatus">
                <div v-for="file in gitStatus.modified_files" :key="file" class="file-item-compact modified">
                    <i class="pi pi-file-edit"></i>
                    <span class="file-name" :title="file">{{ file }}</span>
                    <span class="file-status">已修改</span>
                </div>
                <div v-for="file in gitStatus.untracked_files" :key="file" class="file-item-compact untracked">
                    <i class="pi pi-file-plus"></i>
                    <span class="file-name" :title="file">{{ file }}</span>
                    <span class="file-status">未跟踪</span>
                </div>
            </template>

            <!-- SVN 文件变更 -->
            <template v-if="repositoryInfo?.vcs === 'svn' && svnStatus">
                <div v-for="file in svnStatus.modified_files" :key="file" class="file-item-compact modified">
                    <i class="pi pi-file-edit"></i>
                    <span class="file-name" :title="file">{{ file }}</span>
                    <span class="file-status">已修改</span>
                </div>
                <div v-for="file in svnStatus.untracked_files" :key="file" class="file-item-compact untracked">
                    <i class="pi pi-file-plus"></i>
                    <span class="file-name" :title="file">{{ file }}</span>
                    <span class="file-status">未跟踪</span>
                </div>
            </template>
        </div>
    </div>

    <!-- 编辑名称对话框 -->
    <Dialog
        v-model:visible="showEditDialog"
        modal
        header="编辑仓库名称"
        :style="{ width: '450px' }"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <form @submit.prevent="updateRepositoryName">
            <div class="dialog-content">
                <div class="form-field">
                    <label>
                        <i class="pi pi-tag"></i>
                        仓库名称
                    </label>
                    <InputText
                        v-model="editName"
                        placeholder="输入新的仓库名称"
                        :class="{ 'p-invalid': !editName && editFormSubmitted }"
                    />
                    <small class="p-error" v-if="!editName && editFormSubmitted">请输入仓库名称</small>
                </div>
            </div>

            <div class="dialog-footer">
                <Button label="取消" severity="secondary" text @click="showEditDialog = false" />
                <Button type="submit" label="保存" severity="primary" />
            </div>
        </form>
    </Dialog>

    <!-- 提交对话框 -->
    <Dialog
        v-model:visible="showCommitDialog"
        modal
        header="提交更改"
        :style="{ width: '500px' }"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <form @submit.prevent="handleCommit">
            <div class="dialog-content">
                <div class="form-field">
                    <label>
                        <i class="pi pi-comment"></i>
                        提交消息
                    </label>
                    <Textarea
                        v-model="commitMessage"
                        placeholder="输入提交消息..."
                        rows="5"
                        :class="{ 'p-invalid': !commitMessage && commitFormSubmitted }"
                    />
                    <small class="p-error" v-if="!commitMessage && commitFormSubmitted">请输入提交消息</small>
                </div>
            </div>

            <div class="dialog-footer">
                <Button label="取消" severity="secondary" text @click="showCommitDialog = false" />
                <Button type="submit" label="提交" severity="primary" :loading="loading.commit" />
            </div>
        </form>
    </Dialog>

    <!-- Diff 对话框 -->
    <Dialog
        v-model:visible="showDiffDialog"
        modal
        header="文件变更 (Diff)"
        :style="{ width: '800px' }"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <div class="diff-content">
            <pre v-if="diffOutput" class="diff-text">{{ diffOutput }}</pre>
            <div v-else class="diff-empty">暂无变更</div>
        </div>
        <div class="dialog-footer">
            <Button label="关闭" severity="secondary" text @click="showDiffDialog = false" />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import dbFn from '@/db'
import { gitApi, svnApi, systemApi } from '@/api'
import { formatSvnDate } from '@/utils'
import { eventBus, Events } from '@/utils/eventBus'
import type { Repository, GitStatus, SvnStatus } from '@/types'

const db = await dbFn
const toast = useToast()
const route = useRoute()
const router = useRouter()

// 仓库信息
const repositoryInfo = ref<Repository | null>(null)
const gitStatus = ref<GitStatus | null>(null)
const svnStatus = ref<SvnStatus | null>(null)

// ==================== Dialog 状态 ====================
const showEditDialog = ref(false)
const showCommitDialog = ref(false)
const showDiffDialog = ref(false)

// ==================== 防止重复打开的标志 ====================
let isOpeningDialog = false

// ==================== 表单状态 ====================
const editName = ref('')
const editFormSubmitted = ref(false)
const commitMessage = ref('')
const commitFormSubmitted = ref(false)

// 加载状态
const loading = ref({
    pull: false,
    push: false,
    commit: false,
    update: false
})

// Diff 输出
const diffOutput = ref('')

// 加载仓库信息
async function loadRepositoryInfo() {
    const res = await db.select<Repository[]>('SELECT * FROM repositories WHERE id = $1', [route.params.repoId])
    if (res && res.length > 0) {
        repositoryInfo.value = res[0]
        editName.value = res[0].name

        // 根据 VCS 类型加载状态
        if (res[0].vcs === 'git') {
            await loadGitStatus()
        } else if (res[0].vcs === 'svn') {
            await loadSvnStatus()
        }
    }
}

// 加载 Git 状态
async function loadGitStatus() {
    if (!repositoryInfo.value) return

    try {
        gitStatus.value = await gitApi.getStatus(repositoryInfo.value.path)
    } catch (error) {
        // 静默失败
    }
}

// 加载 SVN 状态
async function loadSvnStatus() {
    if (!repositoryInfo.value) return

    try {
        svnStatus.value = await svnApi.getStatus(repositoryInfo.value.path)
    } catch (error) {
        // 静默失败
    }
}

// 返回
function goBack() {
    router.back()
}

// 复制路径
async function copyPath() {
    if (!repositoryInfo.value) return

    try {
        await navigator.clipboard.writeText(repositoryInfo.value.path)
        toast.add({ severity: 'success', summary: '复制成功', detail: '路径已复制到剪贴板', life: 3000 })
    } catch (error) {
        toast.add({ severity: 'error', summary: '复制失败', detail: error as string, life: 3000 })
    }
}

// 打开编辑名称 Dialog
function openEditDialog() {
    if (!repositoryInfo.value) return

    // 防止重复打开
    if (isOpeningDialog) return

    isOpeningDialog = true

    // 设置数据
    editName.value = repositoryInfo.value.name
    editFormSubmitted.value = false

    // 使用 nextTick 确保数据更新后再打开 Dialog
    nextTick(() => {
        showEditDialog.value = true
        isOpeningDialog = false
    })
}

// 打开提交 Dialog
function openCommitDialog() {
    // 防止重复打开
    if (isOpeningDialog) return

    isOpeningDialog = true

    // 重置表单
    commitMessage.value = ''
    commitFormSubmitted.value = false

    // 使用 nextTick 确保数据更新后再打开 Dialog
    nextTick(() => {
        showCommitDialog.value = true
        isOpeningDialog = false
    })
}

// 更新仓库名称
async function updateRepositoryName() {
    if (!repositoryInfo.value) return

    editFormSubmitted.value = true

    if (!editName.value) {
        return
    }

    await db.execute('UPDATE repositories SET name = $1 WHERE id = $2', [editName.value, repositoryInfo.value.id])
    showEditDialog.value = false
    repositoryInfo.value.name = editName.value
    toast.add({ severity: 'success', summary: '更新成功', detail: '仓库名称已更新', life: 3000 })
}

// 拉取
async function handlePull() {
    if (!repositoryInfo.value) return

    loading.value.pull = true
    const repo = repositoryInfo.value

    try {
        const result = await gitApi.pull(repo.path)
        toast.add({ severity: 'success', summary: '拉取成功', detail: result, life: 3000 })
        await loadGitStatus()
        // 通知其他组件刷新该仓库的状态
        eventBus.emit(Events.REFRESH_REPOSITORY_STATUS, repo.id)
    } catch (error) {
        toast.add({ severity: 'error', summary: '拉取失败', detail: error as string, life: 3000 })
    } finally {
        loading.value.pull = false
    }
}

// 推送
async function handlePush() {
    if (!repositoryInfo.value) return

    loading.value.push = true
    const repo = repositoryInfo.value

    try {
        const result = await gitApi.push(repo.path)
        toast.add({ severity: 'success', summary: '推送成功', detail: result, life: 3000 })
        await loadGitStatus()
        // 通知其他组件刷新该仓库的状态
        eventBus.emit(Events.REFRESH_REPOSITORY_STATUS, repo.id)
    } catch (error) {
        toast.add({ severity: 'error', summary: '推送失败', detail: error as string, life: 3000 })
    } finally {
        loading.value.push = false
    }
}

// 提交（支持 Git 和 SVN）
async function handleCommit() {
    if (!repositoryInfo.value) return

    commitFormSubmitted.value = true

    if (!commitMessage.value) {
        return
    }

    loading.value.commit = true
    const repo = repositoryInfo.value

    try {
        let result: string

        if (repo.vcs === 'git') {
            result = await gitApi.commit(repo.path, commitMessage.value)
            await loadGitStatus()
        } else if (repo.vcs === 'svn') {
            result = await svnApi.commit(repo.path, commitMessage.value)
            await loadSvnStatus()
        } else {
            throw new Error('不支持的版本控制系统')
        }

        toast.add({ severity: 'success', summary: '提交成功', detail: result, life: 3000 })
        showCommitDialog.value = false
        commitMessage.value = ''
        commitFormSubmitted.value = false
        // 通知其他组件刷新该仓库的状态
        eventBus.emit(Events.REFRESH_REPOSITORY_STATUS, repo.id)
    } catch (error) {
        toast.add({ severity: 'error', summary: '提交失败', detail: error as string, life: 3000 })
    } finally {
        loading.value.commit = false
    }
}

// SVN 更新
async function handleUpdate() {
    if (!repositoryInfo.value) return

    loading.value.update = true
    const repo = repositoryInfo.value
    try {
        const result = await svnApi.update(repositoryInfo.value.path)
        toast.add({ severity: 'success', summary: '更新成功', detail: result, life: 3000 })
        await loadSvnStatus()
        // 通知其他组件刷新该仓库的状态
        eventBus.emit(Events.REFRESH_REPOSITORY_STATUS, repo.id)
    } catch (error) {
        toast.add({ severity: 'error', summary: '更新失败', detail: error as string, life: 3000 })
    } finally {
        loading.value.update = false
    }
}

// 打开终端
async function handleTerminal() {
    if (!repositoryInfo.value) return

    try {
        await systemApi.openTerminal(repositoryInfo.value.path)
        toast.add({ severity: 'success', summary: '打开成功', detail: '终端已启动', life: 3000 })
    } catch (error) {
        toast.add({ severity: 'error', summary: '打开失败', detail: error as string, life: 3000 })
    }
}

// 用 VSCode 打开
async function handleOpenVscode() {
    if (!repositoryInfo.value) return

    try {
        await systemApi.openInVscode(repositoryInfo.value.path)
        toast.add({ severity: 'success', summary: '打开成功', detail: 'VSCode 已启动', life: 3000 })
    } catch (error) {
        toast.add({ severity: 'error', summary: '打开失败', detail: error as string, life: 3000 })
    }
}

// 查看 Diff（支持 Git 和 SVN）
async function handleDiff() {
    if (!repositoryInfo.value) return

    // 防止重复打开
    if (isOpeningDialog) return

    isOpeningDialog = true

    try {
        let result: string

        if (repositoryInfo.value.vcs === 'git') {
            result = await gitApi.diff(repositoryInfo.value.path)
        } else if (repositoryInfo.value.vcs === 'svn') {
            result = await svnApi.diff(repositoryInfo.value.path)
        } else {
            throw new Error('不支持的版本控制系统')
        }

        diffOutput.value = result

        // 成功后打开对话框
        nextTick(() => {
            showDiffDialog.value = true
            isOpeningDialog = false
        })
    } catch (error) {
        isOpeningDialog = false
        toast.add({ severity: 'error', summary: '获取失败', detail: error as string, life: 3000 })
    }
}

// 辅助函数：检查是否有脏文件
function hasDirtyFiles() {
    if (repositoryInfo.value?.vcs === 'git') {
        return gitStatus.value?.is_dirty
    } else if (repositoryInfo.value?.vcs === 'svn') {
        return svnStatus.value?.is_dirty
    }
    return false
}

// 辅助函数：获取脏文件数量
function dirtyFilesCount() {
    if (repositoryInfo.value?.vcs === 'git') {
        return (gitStatus.value?.modified_files?.length || 0) + (gitStatus.value?.untracked_files?.length || 0)
    } else if (repositoryInfo.value?.vcs === 'svn') {
        return (svnStatus.value?.modified_files?.length || 0) + (svnStatus.value?.untracked_files?.length || 0)
    }
    return 0
}

onMounted(() => {
    loadRepositoryInfo()

    // 监听项目删除事件
    eventBus.on(Events.PROJECT_DELETED, handleProjectDeleted)
    eventBus.on(Events.REPOSITORY_DELETED, handleRepositoryDeleted)
})

onUnmounted(() => {
    // 清理事件监听
    eventBus.off(Events.PROJECT_DELETED, handleProjectDeleted)
    eventBus.off(Events.REPOSITORY_DELETED, handleRepositoryDeleted)
})

// 处理项目删除事件
function handleProjectDeleted(deletedProject: any) {
    if (!deletedProject || !repositoryInfo.value) return

    // 如果当前查看的仓库属于被删除的项目，返回首页（使用 == 而不是 === 以避免类型问题）
    if (repositoryInfo.value.project_id == deletedProject.id) {
        toast.add({
            severity: 'info',
            summary: '项目已删除',
            detail: '当前项目已被删除，返回首页',
            life: 3000
        })
        // 清空仓库信息
        repositoryInfo.value = null
        gitStatus.value = null
        svnStatus.value = null
        router.push('/')
    }
}

// 处理仓库删除事件
function handleRepositoryDeleted(deletedRepository: any) {
    if (!deletedRepository || !repositoryInfo.value) return

    // 如果当前查看的仓库被删除，返回项目详情页（使用 == 而不是 === 以避免类型问题）
    if (repositoryInfo.value.id == deletedRepository.id) {
        toast.add({
            severity: 'info',
            summary: '仓库已删除',
            detail: '当前仓库已被删除，返回项目详情',
            life: 3000
        })
        // 先保存项目ID，再清空仓库信息
        const projectId = repositoryInfo.value.project_id
        repositoryInfo.value = null
        gitStatus.value = null
        svnStatus.value = null
        router.push(`/project/${projectId}`)
    }
}
</script>

<style scoped>
.repository-detail-page {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: #f8fafc;
    box-sizing: border-box;
}

/* ==================== 头部 ==================== */
.detail-header {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
}

.back-button {
    flex-shrink: 0;
}

.back-button :deep(.p-button-icon) {
    font-size: 1.25rem;
}

.repository-info-large {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
}

.repository-icon-large {
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    font-size: 2rem;
    flex-shrink: 0;
}

.repository-icon-large.git {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
}

.repository-icon-large.svn {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #d97706;
}

.repository-text {
    flex: 1;
    min-width: 0;
}

.repository-text h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
}

.repository-path-text {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Consolas', 'Monaco', monospace;
}

.repository-path-text i {
    color: #3b82f6;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

/* ==================== 状态徽章 ==================== */
.status-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 2rem;
    padding: 1rem 1.25rem;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.8125rem;
    color: #64748b;
    transition: all 0.15s ease;
}

.status-badge i {
    font-size: 0.875rem;
    color: #64748b;
}

.status-badge:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
}

.status-badge .badge-label {
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 500;
}

.status-badge .badge-value {
    color: #475569;
    font-weight: 600;
    font-size: 0.8125rem;
}

.status-badge .commit-hash {
    font-family: 'Consolas', 'Monaco', monospace;
}

.status-badge.clean {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.status-badge.clean i,
.status-badge.clean .badge-value {
    color: #16a34a;
}

.status-badge.dirty {
    background: #fef2f2;
    border-color: #fecaca;
}

.status-badge.dirty i,
.status-badge.dirty .badge-value {
    color: #dc2626;
}

/* ==================== 操作网格 ==================== */
.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.action-card {
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.action-card.loading {
    opacity: 0.6;
    pointer-events: none;
}

.action-card.disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
}

.action-card.disabled :deep(.action-icon) {
    background: #f1f5f9;
    color: #94a3b8;
}

/* 添加加载动画 */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.action-card.loading :deep(.action-icon) {
    animation: pulse 1.5s ease-in-out infinite;
}

/* Diff 内容优化滚动条样式 */
.diff-content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.diff-content::-webkit-scrollbar-track {
    background: #1e293b;
    border-radius: 4px;
}

.diff-content::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
}

.diff-content::-webkit-scrollbar-thumb:hover {
    background: #64748b;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.action-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-radius: 12px;
    color: #2563eb;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.action-content {
    flex: 1;
}

.action-name {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 0.25rem;
}

.action-desc {
    font-size: 0.8125rem;
    color: #64748b;
}

/* ==================== 文件列表 ==================== */
.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1rem;
}

.section-title i {
    color: #3b82f6;
}

.section-title :deep(.p-tag) {
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
}

.files-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem 1.25rem;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.file-item-compact {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    transition: all 0.15s ease;
    cursor: pointer;
}

.file-item-compact:hover {
    background: #f8fafc;
}

.file-item-compact i {
    color: #64748b;
    font-size: 0.875rem;
    flex-shrink: 0;
    width: 1rem;
    text-align: center;
}

.file-item-compact.modified i {
    color: #f59e0b;
}

.file-item-compact.untracked i {
    color: #3b82f6;
}

.file-item-compact .file-name {
    flex: 1;
    font-size: 0.8125rem;
    color: #334155;
    font-family: 'Consolas', 'Monaco', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-item-compact .file-status {
    font-size: 0.6875rem;
    font-weight: 500;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    flex-shrink: 0;
}

.file-item-compact.modified .file-status {
    background: #fef3c7;
    color: #d97706;
}

.file-item-compact.untracked .file-status {
    background: #dbeafe;
    color: #2563eb;
}

/* ==================== 对话框 ==================== */
.dialog-content {
    padding: 0.5rem 0;
}

.form-field {
    margin-bottom: 1.25rem;
}

.form-field label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    color: #334155;
}

.form-field label i {
    color: #3b82f6;
    font-size: 0.875rem;
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-textarea) {
    width: 100%;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
    margin-top: 0.5rem;
}

.dialog-footer :deep(.p-button) {
    min-width: 5rem;
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==================== Diff 内容 ==================== */
.diff-content {
    max-height: 500px;
    overflow-y: auto;
    background: #1e293b;
    border-radius: 8px;
    padding: 1rem;
}

.diff-text {
    margin: 0;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: #e2e8f0;
    white-space: pre-wrap;
    word-break: break-all;
}

.diff-empty {
    text-align: center;
    color: #94a3b8;
    padding: 2rem;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
    .header-content {
        flex-wrap: wrap;
    }

    .repository-info-large {
        width: 100%;
    }

    .status-badges {
        padding: 0.875rem 1rem;
    }

    .status-badge {
        flex: 1 1 calc(50% - 0.375rem);
        min-width: 0;
        justify-content: center;
    }

    .status-badge .badge-label {
        display: none;
    }

    .actions-grid {
        grid-template-columns: 1fr;
    }
}
</style>
