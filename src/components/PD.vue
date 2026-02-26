<template>
    <div class="page-container">
        <!-- 项目头部 -->
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-title">
                    <div class="page-icon">
                        <i class="pi pi-folder-open"></i>
                    </div>
                    <div class="title-text">
                        <h1>{{ projectInfo?.name || '未命名项目' }}</h1>
                        <p
                            v-if="projectInfo?.description"
                            class="page-description"
                        >
                            {{ projectInfo.description }}
                        </p>
                        <p
                            v-else
                            class="page-description empty"
                        >
                            暂无描述
                        </p>
                    </div>
                </div>
            </div>
            <div class="header-actions">
                <Button
                    severity="secondary"
                size="small"
                label="添加仓库"
                    icon="pi pi-plus"
                    @click="addRepository"
                />
                <!-- 批量操作按钮组 -->
                <div v-if="repositoryList && repositoryList.length > 1" class="batch-actions">
                    <Button
                        severity="secondary"
                        size="small"
                        icon="pi pi-download"
                        label="全部拉取"
                        @click="batchPull"
                        :loading="batchLoading.pull"
                        v-tooltip.top="'拉取所有仓库的最新代码'"
                    />
                    <Button
                        severity="secondary"
                        size="small"
                        icon="pi pi-upload"
                        label="全部推送"
                        @click="batchPush"
                        :loading="batchLoading.push"
                        v-tooltip.top="'推送所有仓库到远程'"
                    />
                </div>
            </div>
        </div>

        <!-- 仓库网格 -->
        <div
            v-if="repositoryList && repositoryList.length > 0"
            class="repository-grid"
        >
            <Card
                v-for="item in repositoryList"
                :key="item.id"
                class="repository-card"
                @click="navigateToDetail(item.id)"
            >
                <template #content>
                    <div class="repository-content">
                        <!-- 仓库头部 -->
                        <div class="repository-header">
                            <div
                                class="repository-icon"
                                :class="item.vcs"
                            >
                                <i
                                    :class="
                                        item.vcs === 'git' ? 'pi pi-github' : 'pi pi-code-branch'
                                    "
                                />
                            </div>
                            <div class="repository-info">
                                <h3 class="repository-name">{{ item.name }}</h3>
                                <Tag
                                    :value="item.vcs === 'git' ? 'Git' : 'SVN'"
                                    :severity="item.vcs === 'git' ? 'info' : 'warning'"
                                    class="repository-tag"
                                />
                            </div>
                        </div>

                        <!-- Git 状态 -->
                        <div
                            v-if="item.vcs === 'git' && getGitStatus(item.id)"
                            class="git-status"
                        >
                            <div class="git-status-item">
                                <i class="pi pi-code-branch"></i>
                                <span>{{ getGitStatus(item.id)?.branch || 'unknown' }}</span>
                            </div>
                            <div
                                v-if="getGitStatus(item.id)?.is_dirty"
                                class="git-status-badge dirty"
                            >
                                <i class="pi pi-exclamation-circle"></i>
                                <span
                                    >{{
                                        getGitStatus(item.id)?.modified_files?.length || 0
                                    }}
                                    个文件已修改</span
                                >
                            </div>
                            <div
                                v-else
                                class="git-status-badge clean"
                            >
                                <i class="pi pi-check-circle"></i>
                                <span>干净</span>
                            </div>
                        </div>

                        <!-- SVN 状态 -->
                        <div
                            v-if="item.vcs === 'svn' && getSvnStatus(item.id)"
                            class="git-status"
                        >
                            <div class="git-status-item">
                                <i class="pi pi-code-branch"></i>
                                <span>r{{ getSvnStatus(item.id)?.revision || 'unknown' }}</span>
                            </div>
                            <div
                                v-if="getSvnStatus(item.id)?.is_dirty"
                                class="git-status-badge dirty"
                            >
                                <i class="pi pi-exclamation-circle"></i>
                                <span
                                    >{{
                                        getSvnStatus(item.id)?.modified_files?.length || 0
                                    }}
                                    个文件已修改</span
                                >
                            </div>
                            <div
                                v-else
                                class="git-status-badge clean"
                            >
                                <i class="pi pi-check-circle"></i>
                                <span>干净</span>
                            </div>
                        </div>

                        <!-- 仓库路径 -->
                        <div class="repository-path">
                            <i class="pi pi-folder"></i>
                            <span>{{ item.path }}</span>
                        </div>

                        <!-- 操作按钮 -->
                        <div
                            class="repository-actions"
                            @click.stop
                        >
                            <Button
                                icon="pi pi-code"
                                text
                                v-tooltip.top="'用 VSCode 打开'"
                                @click="openPjWithVscode(item.path)"
                            />
                            <Button
                                icon="pi pi-folder-open"
                                text
                                v-tooltip.top="'打开文件夹'"
                                @click="openPjWithFolder(item.path)"
                            />
                            <Button
                                icon="pi pi-pencil"
                                text
                                severity="secondary"
                                v-tooltip.top="'编辑名称'"
                                @click="editPjName(item)"
                            />
                            <Button
                                icon="pi pi-trash"
                                text
                                severity="danger"
                                v-tooltip.top="'删除仓库'"
                                @click="deleteRepository(item)"
                            />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- 空状态 -->
        <div
            v-else
            class="empty-repositories"
        >
            <div class="empty-illustration">
                <div class="empty-icon-bg">
                    <i class="pi pi-inbox"></i>
                </div>
            </div>
            <h3>暂无仓库</h3>
            <p>添加代码仓库来管理项目文件</p>
            <Button
                label="添加第一个仓库"
                icon="pi pi-plus"
                severity="primary"
                outlined
                @click="addRepository"
                class="empty-action-button"
            />
        </div>
    </div>

    <!-- 添加仓库对话框 -->
    <Dialog
        v-model:visible="isShowRepository"
        modal
        header="添加代码仓库"
        :style="{ width: '550px' }"
        @after-hide="onAfterLeave"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <form @submit.prevent="onCreateNewRepository">
            <div class="dialog-content">
                <!-- 模式选择 -->
                <div class="form-field">
                    <label>
                        <i class="pi pi-plus-circle"></i>
                        添加方式
                    </label>
                    <div class="mode-selector">
                        <Button
                            :label="'本地路径'"
                            :severity="addMode === 'local' ? 'primary' : 'secondary'"
                            :outlined="addMode !== 'local'"
                            size="small"
                            @click="addMode = 'local'"
                        />
                        <Button
                            :label="'URL 克隆'"
                            :severity="addMode === 'clone' ? 'primary' : 'secondary'"
                            :outlined="addMode !== 'clone'"
                            size="small"
                            @click="addMode = 'clone'"
                        />
                    </div>
                </div>

                <div class="form-field">
                    <label>
                        <i class="pi pi-tag"></i>
                        仓库名称
                    </label>
                    <InputText
                        v-model="newRepository.name"
                        placeholder="例如：前端项目、后端 API"
                        :class="{ 'p-invalid': !newRepository.name && formSubmitted }"
                    />
                    <small
                        class="p-error"
                        v-if="!newRepository.name && formSubmitted"
                        >请输入仓库名称</small
                    >
                </div>

                <!-- 本地路径模式 -->
                <template v-if="addMode === 'local'">
                    <div class="form-field">
                        <label>
                            <i class="pi pi-folder"></i>
                            本地路径
                        </label>
                        <div class="path-input-group">
                            <InputText
                                :model-value="newRepository.path || ''"
                                placeholder="点击右侧按钮选择仓库目录"
                                :class="{ 'p-invalid': !newRepository.path && formSubmitted }"
                                readonly
                                class="path-input"
                            />
                            <Button
                                icon="pi pi-folder-open"
                                severity="secondary"
                                outlined
                                @click="selectLocalPath"
                                v-tooltip.top="'选择文件夹'"
                            />
                        </div>
                        <small
                            class="p-error"
                            v-if="!newRepository.path && formSubmitted"
                            >请选择仓库目录</small
                        >
                        <div class="path-info" v-if="newRepository.path">
                            <Tag
                                v-if="newRepository.vcs"
                                :value="newRepository.vcs.toUpperCase()"
                                :severity="newRepository.vcs === 'git' ? 'success' : 'warning'"
                            />
                            <small class="p-hint" v-else>
                                未检测到版本控制系统
                            </small>
                        </div>
                    </div>
                </template>

                <!-- URL 克隆模式 -->
                <template v-if="addMode === 'clone'">
                    <div class="form-field">
                        <label>
                            <i class="pi pi-link"></i>
                            仓库 URL
                        </label>
                        <InputText
                            v-model="cloneUrl"
                            placeholder="例如：https://github.com/user/repo.git 或 http://server/svn/project"
                            :class="{ 'p-invalid': !cloneUrl && formSubmitted }"
                        />
                        <small
                            class="p-error"
                            v-if="!cloneUrl && formSubmitted"
                            >请输入仓库 URL</small
                        >
                        <small class="p-hint" v-if="cloneUrl && !newRepository.vcs">
                            支持 Git (.git) 和 SVN (svn:// 或 http://.../svn/...) URL
                        </small>
                        <small class="p-success" v-if="newRepository.vcs">
                            检测到 {{ newRepository.vcs.toUpperCase() }} 仓库
                        </small>
                        <!-- SVN 中文 URL 提示 -->
                        <Message v-if="cloneUrl && newRepository.vcs === 'svn' && hasChineseInUrl(cloneUrl)"
                            severity="warn"
                            :closable="false"
                            class="mt-2"
                        >
                            <div class="flex flex-column gap-2">
                                <span class="font-semibold">
                                    <i class="pi pi-exclamation-triangle mr-2"></i>
                                    检测到 SVN URL 包含中文字符
                                </span>
                                <span class="text-sm">
                                    由于命令行工具的限制，应用内可能无法直接 checkout 包含中文的 SVN URL。
                                </span>
                                <div class="flex flex-column gap-2 mt-2">
                                    <span class="font-semibold text-sm">推荐方案：</span>
                                    <ol class="text-sm m-0 pl-4 flex flex-column gap-2">
                                        <li>
                                            <strong>使用 TortoiseSVN：</strong>
                                            <div class="mt-1 text-xs opacity-80">
                                                右键点击文件夹 → SVN Checkout... → 粘贴 URL
                                            </div>
                                        </li>
                                        <li>
                                            <strong>使用命令行：</strong>
                                            <div class="mt-1 p-2 bg-surface-100 dark:bg-surface-800 rounded text-xs font-mono">
                                                chcp 65001<br>
                                                svn checkout "{{ cloneUrl }}" "目标路径"
                                            </div>
                                        </li>
                                        <li>
                                            <strong>然后在应用中添加：</strong>
                                            <div class="mt-1 text-xs opacity-80">
                                                切换到"本地路径"模式，选择已 checkout 的目录
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                                <div class="flex gap-2 mt-2">
                                    <Button
                                        label="复制命令"
                                        size="small"
                                        severity="secondary"
                                        outlined
                                        @click="copySvnCommand"
                                        v-tooltip.top="'复制到剪贴板'"
                                    />
                                    <Button
                                        label="切换到本地路径"
                                        size="small"
                                        severity="help"
                                        outlined
                                        @click="addMode = 'local'"
                                        v-tooltip.top="'直接添加已 checkout 的目录'"
                                    />
                                </div>
                            </div>
                        </Message>
                    </div>

                    <div class="form-field">
                        <label>
                            <i class="pi pi-folder"></i>
                            存储位置
                        </label>
                        <div class="path-input-group">
                            <InputText
                                v-model="cloneTargetPath"
                                placeholder="选择克隆目标文件夹"
                                :class="{ 'p-invalid': !cloneTargetPath && formSubmitted }"
                                readonly
                                class="path-input"
                            />
                            <Button
                                icon="pi pi-folder-open"
                                severity="secondary"
                                outlined
                                @click="selectCloneTarget"
                                v-tooltip.top="'选择文件夹'"
                            />
                        </div>
                        <small
                            class="p-error"
                            v-if="!cloneTargetPath && formSubmitted"
                            >请选择存储位置</small
                        >
                    </div>
                </template>
            </div>

            <div class="dialog-footer">
                <Button
                    label="取消"
                    severity="secondary"
                    text
                    @click="isShowRepository = false"
                />
                <Button
                    type="submit"
                    :label="addMode === 'clone' ? '克隆并添加' : '添加'"
                    severity="primary"
                    :loading="isCloning"
                />
            </div>
        </form>
    </Dialog>

    <!-- 克隆进度对话框 -->
    <Dialog
        v-model:visible="cloneProgress.show"
        modal
        header="正在克隆仓库"
        :style="{ width: '500px' }"
        :dismissableMask="false"
        :closeOnEscape="false"
        :closable="false"
    >
        <div class="clone-progress-content">
            <ProgressBar mode="indeterminate" style="height: 6px; margin-bottom: 1rem;" />
            <div class="progress-info">
                <p class="progress-status">{{ cloneProgress.status }}</p>
                <p class="progress-details" v-if="cloneProgress.details">
                    <i class="pi pi-file"></i>
                    当前文件: {{ cloneProgress.details }}
                </p>
            </div>
            <div class="progress-hint">
                <i class="pi pi-info-circle"></i>
                <span>克隆大型仓库可能需要几分钟时间，请耐心等待...</span>
            </div>
        </div>
    </Dialog>

    <!-- 编辑仓库名称对话框 -->
    <Dialog
        v-model:visible="isShowRePjName"
        modal
        header="编辑仓库名称"
        :style="{ width: '450px' }"
        @after-hide="onAfterLeaveRePjName"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <form @submit.prevent="onUpdatePjName">
            <div class="dialog-content">
                <div class="form-field">
                    <label>
                        <i class="pi pi-tag"></i>
                        仓库名称
                    </label>
                    <InputText
                        v-model="pjInfo.name"
                        placeholder="输入新的仓库名称"
                        :class="{ 'p-invalid': !pjInfo.name && renameFormSubmitted }"
                    />
                    <small
                        class="p-error"
                        v-if="!pjInfo.name && renameFormSubmitted"
                        >请输入仓库名称</small
                    >
                </div>
            </div>

            <div class="dialog-footer">
                <Button
                    label="取消"
                    severity="secondary"
                    text
                    @click="isShowRePjName = false"
                />
                <Button
                    type="submit"
                    label="保存"
                    severity="primary"
                />
            </div>
        </form>
    </Dialog>

    <!-- 批量操作结果对话框 -->
    <Dialog
        v-model:visible="showBatchResults"
        modal
        header="批量操作结果"
        :style="{ width: '600px' }"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <div class="batch-results-content">
            <div
                v-for="result in batchResults"
                :key="result.repo.id"
                class="batch-result-item"
                :class="{ success: result.success, error: !result.success }"
            >
                <div class="result-icon">
                    <i :class="result.success ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                </div>
                <div class="result-info">
                    <div class="result-name">{{ result.repo.name }}</div>
                    <div class="result-message">{{ result.message }}</div>
                </div>
            </div>
        </div>
        <div class="dialog-footer">
            <Button label="关闭" severity="secondary" text @click="showBatchResults = false" />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import dbFn from '@/db'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir } from '@tauri-apps/plugin-fs'
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { gitApi, svnApi, systemApi } from '@/api'
import { eventBus, Events } from '@/utils/eventBus'
import type { Project, Repository, GitStatus, SvnStatus } from '@/types'

const db = await dbFn
const toast = useToast()
const route = useRoute()
const router = useRouter()

// Git 状态存储
const gitStatuses = ref<Map<string, GitStatus>>(new Map())
// SVN 状态存储
const svnStatuses = ref<Map<string, SvnStatus>>(new Map())

const projectInfo = ref<Project | null>(null)
const repositoryList = ref<Repository[]>([])
const formSubmitted = ref(false)
const renameFormSubmitted = ref(false)

// 批量操作状态
const batchLoading = ref({
    pull: false,
    push: false
})
const batchResults = ref<Array<{ repo: Repository; success: boolean; message: string }>>([])
const showBatchResults = ref(false)

async function openPjWithVscode(path: string) {
    try {
        await systemApi.openInVscode(path)
        toast.add({
            severity: 'success',
            summary: '打开成功',
            detail: 'VSCode 已启动',
            life: 3000
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: '打开失败',
            detail: error as string,
            life: 5000
        })
    }
}

async function openPjWithFolder(path: string) {
    await systemApi.openFolder(path)
}

const getProjectInfo = async (id: string) => {
    const res = await db.select<Project[]>('SELECT * FROM projects WHERE id = $1', [id])
    projectInfo.value = res[0] || null
}

const getRepositories = async (id: number | string) => {
    const res = await db.select<Repository[]>('SELECT * FROM repositories WHERE project_id = $1', [id])
    repositoryList.value = res
}

// ==================== Dialog 状态 ====================
const isShowRepository = ref(false)
const isShowRePjName = ref(false)

// ==================== 表单数据 ====================
const newRepository = ref({
    name: '',
    path: '',
    url: '',
    vcs: '',
    project_id: route.params.id,
})

// 克隆模式相关状态
const addMode = ref<'local' | 'clone'>('local')
const cloneUrl = ref('')
const cloneTargetPath = ref('')
const isCloning = ref(false)
const cloneProgress = ref({
    show: false,
    status: '',
    details: '',
})

const pjInfo = ref({
    name: '',
    id: '',
})

// ==================== 防止重复打开的标志 ====================
let isOpeningDialog = false

// 使用 watch 替代 watchEffect，避免连锁触发
watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            getProjectInfo(newId as string)
            getRepositories(newId as string)
            newRepository.value.project_id = newId
        }
    },
    { immediate: true },
)

// 监听项目删除事件
onMounted(() => {
    eventBus.on(Events.PROJECT_DELETED, handleProjectDeleted)
    // 监听仓库状态变化事件
    eventBus.on(Events.REFRESH_REPOSITORY_STATUS, handleRepositoryStatusRefresh)
})

onUnmounted(() => {
    eventBus.off(Events.PROJECT_DELETED, handleProjectDeleted)
    eventBus.off(Events.REFRESH_REPOSITORY_STATUS, handleRepositoryStatusRefresh)
})

// 处理项目删除事件
function handleProjectDeleted(deletedProject: any) {
    if (!deletedProject || !projectInfo.value) return

    // 如果当前查看的项目被删除，返回首页（使用 == 而不是 === 以避免类型问题）
    if (projectInfo.value.id == deletedProject.id) {
        toast.add({
            severity: 'info',
            summary: '项目已删除',
            detail: '当前项目已被删除，返回首页',
            life: 3000
        })
        // 清空项目信息
        projectInfo.value = null
        repositoryList.value = []
        router.push('/')
    }
}

// 处理仓库状态刷新事件
async function handleRepositoryStatusRefresh(repoId: number | string) {
    if (!repositoryList.value) return

    // 在当前项目的仓库列表中查找该仓库
    const repo = repositoryList.value.find(r => r.id === Number(repoId))
    if (!repo) return

    // 根据仓库类型刷新状态
    if (repo.vcs === 'git') {
        await loadGitStatus(repo)
    } else if (repo.vcs === 'svn') {
        await loadSvnStatus(repo)
    }
}

async function onCreateNewRepository() {
    formSubmitted.value = true

    if (!newRepository.value.name) {
        return
    }

    // 克隆模式
    if (addMode.value === 'clone') {
        if (!cloneUrl.value || !cloneTargetPath.value) {
            return
        }

        isCloning.value = true

        // 显示进度对话框
        const vcsType = newRepository.value.vcs === 'git' ? 'Git' : 'SVN'
        cloneProgress.value = {
            show: true,
            status: `正在${vcsType === 'Git' ? '克隆' : '检出'}仓库...`,
            details: `从 ${cloneUrl.value} ${vcsType === 'Git' ? '克隆' : '检出'}到 ${cloneTargetPath.value}`,
        }

        try {
            // 执行克隆
            if (newRepository.value.vcs === 'git') {
                await gitApi.clone(cloneUrl.value, cloneTargetPath.value)
            } else if (newRepository.value.vcs === 'svn') {
                await svnApi.checkout(cloneUrl.value, cloneTargetPath.value)
            } else {
                throw new Error('无法识别的仓库类型')
            }

            // 克隆成功，保存到数据库
            cloneProgress.value.status = '保存仓库信息...'
            cloneProgress.value.details = '正在将仓库添加到项目...'

            const repoPath = cloneTargetPath.value
            const res = await db.execute(
                'INSERT OR IGNORE INTO repositories (name, path, url, project_id, vcs) VALUES ($1, $2, $3, $4, $5) ',
                [
                    newRepository.value.name,
                    repoPath,
                    cloneUrl.value,
                    newRepository.value.project_id,
                    newRepository.value.vcs,
                ],
            )

            if (res.rowsAffected < 1) {
                toast.add({
                    severity: 'warn',
                    summary: '克隆成功但添加失败',
                    detail: '仓库已克隆但可能已存在于列表中',
                    life: 3000,
                })
            } else {
                toast.add({
                    severity: 'success',
                    summary: '克隆成功',
                    detail: `仓库 "${newRepository.value.name}" 已克隆并添加`,
                    life: 3000,
                })
            }

            isShowRepository.value = false

            // 刷新仓库列表
            if (projectInfo.value) {
                await getRepositories(projectInfo.value.id)
                eventBus.emit(Events.REPOSITORY_ADDED, newRepository.value)
            }
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: '克隆失败',
                detail: error as string,
                life: 5000,
            })
        } finally {
            isCloning.value = false
            cloneProgress.value.show = false
        }
        return
    }

    // 本地路径模式
    if (!newRepository.value.path) {
        return
    }

    try {
        // 确保 vcs 有有效值（数据库约束要求 'git', 'svn' 或 ''）
        const vcsValue = newRepository.value.vcs || ''
        // 确保 project_id 是整数
        const projectId = Number(newRepository.value.project_id)

        const res = await db.execute(
            'INSERT OR IGNORE INTO repositories (name, path, url, project_id, vcs) VALUES ($1, $2, $3, $4, $5) ',
            [
                newRepository.value.name,
                newRepository.value.path,
                newRepository.value.url || null,
                projectId,
                vcsValue,
            ],
        )
        if (res.rowsAffected < 1) {
            toast.add({
                severity: 'error',
                summary: '添加失败',
                detail: '该仓库可能已存在',
                life: 3000,
            })
            return
        }
        toast.add({
            severity: 'success',
            summary: '添加成功',
            detail: `仓库 "${newRepository.value.name}" 已添加`,
            life: 3000,
        })
        isShowRepository.value = false
        // 手动重新获取仓库列表，而不是触发 watchEffect
        if (projectInfo.value) {
            await getRepositories(projectInfo.value.id)
            // 通知其他组件数据已更新
            eventBus.emit(Events.REPOSITORY_ADDED, newRepository.value)
        }
    } catch (error) {
        console.error('添加仓库失败:', error)
        const errorMsg = error instanceof Error ? error.message : String(error)
        toast.add({
            severity: 'error',
            summary: '添加失败',
            detail: errorMsg,
            life: 5000,
        })
    }
}

// 打开添加仓库对话框
function addRepository() {
    // 重置表单数据
    newRepository.value = {
        name: '',
        path: '',
        url: '',
        vcs: '',
        project_id: route.params.id,
    }
    addMode.value = 'local'
    cloneUrl.value = ''
    cloneTargetPath.value = ''
    formSubmitted.value = false

    // 直接打开对话框
    isShowRepository.value = true
}

// 选择本地仓库路径
async function selectLocalPath() {
    const result = await open({
        multiple: false,
        directory: true,
    })

    if (result) {
        // 检测版本管理工具
        let vcs = ''
        const entries = await readDir(result)
        for (const entry of entries) {
            if (entry.name == '.git') {
                vcs = 'git'
                break
            } else if (entry.name == '.svn') {
                vcs = 'svn'
                break
            }
        }

        newRepository.value.path = result
        newRepository.value.vcs = vcs
    }
}

// 选择克隆目标文件夹
async function selectCloneTarget() {
    const result = await open({
        multiple: false,
        directory: true,
    })

    if (result) {
        cloneTargetPath.value = result
    }
}

// 从 URL 检测 VCS 类型
function detectVcsFromUrl(url: string): string {
    const lowerUrl = url.toLowerCase()

    // SVN 检测（优先检测，因为有些 SVN URL 使用 HTTP 协议）
    // 1. svn:// 或 svn+ssh:// 等协议
    if (lowerUrl.startsWith('svn://') || lowerUrl.startsWith('svn+')) {
        return 'svn'
    }
    // 2. HTTP/HTTPS 协议且包含 /svn/ 路径
    if ((lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) && lowerUrl.includes('/svn/')) {
        return 'svn'
    }

    // Git 支持多种协议：https, git@, git://, ssh://
    if (lowerUrl.includes('.git') ||
        lowerUrl.startsWith('git@') ||
        lowerUrl.startsWith('git://') ||
        lowerUrl.startsWith('ssh://git@') ||
        lowerUrl.startsWith('https://github.com') ||
        lowerUrl.startsWith('https://gitlab.com') ||
        lowerUrl.startsWith('https://gitee.com') ||
        lowerUrl.startsWith('https://bitbucket.org')) {
        return 'git'
    }

    return ''
}

// 从 URL 提取仓库名称
function extractRepoNameFromUrl(url: string): string {
    try {
        // 移除 .git 后缀
        let cleanUrl = url.replace(/\.git$/, '')
        // 提取最后一段路径
        const parts = cleanUrl.split('/')
        const lastPart = parts[parts.length - 1]
        // 如果是 git@ 格式，需要处理
        if (lastPart.includes(':')) {
            const colonParts = lastPart.split(':')
            return colonParts[colonParts.length - 1]
        }
        return lastPart || ''
    } catch {
        return ''
    }
}

// 检测 URL 是否包含中文字符
function hasChineseInUrl(url: string): boolean {
    // 匹配中文字符（包括中文标点）
    return /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(url)
}

// 复制 SVN checkout 命令到剪贴板
async function copySvnCommand() {
    const command = `chcp 65001\nsvn checkout "${cloneUrl.value}" "目标路径"`

    try {
        await navigator.clipboard.writeText(command)
        toast.add({
            severity: 'success',
            summary: '复制成功',
            detail: '命令已复制到剪贴板，请在命令行中粘贴执行',
            life: 3000
        })
    } catch (error) {
        // 如果 clipboard API 不可用，使用传统方法
        const textarea = document.createElement('textarea')
        textarea.value = command
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()

        try {
            document.execCommand('copy')
            toast.add({
                severity: 'success',
                summary: '复制成功',
                detail: '命令已复制到剪贴板，请在命令行中粘贴执行',
                life: 3000
            })
        } catch (err) {
            toast.add({
                severity: 'error',
                summary: '复制失败',
                detail: '请手动复制命令',
                life: 3000
            })
        }

        document.body.removeChild(textarea)
    }
}

// 监听 cloneUrl 变化，自动检测 VCS 类型和提取名称
watch(cloneUrl, (newUrl) => {
    if (newUrl) {
        const vcs = detectVcsFromUrl(newUrl)
        newRepository.value.vcs = vcs

        // 如果名称为空，自动从 URL 提取
        if (!newRepository.value.name) {
            const repoName = extractRepoNameFromUrl(newUrl)
            if (repoName) {
                newRepository.value.name = repoName
            }
        }
    } else {
        newRepository.value.vcs = ''
    }
})

// 监听 addMode 切换，重置表单数据避免污染
watch(addMode, (newMode, oldMode) => {
    // 首次初始化时不处理
    if (oldMode === undefined) return

    // 保存当前名称（用户可能已经输入了）
    const currentName = newRepository.value.name

    if (newMode === 'local') {
        // 切换到本地路径模式：清空克隆相关字段
        cloneUrl.value = ''
        cloneTargetPath.value = ''
        newRepository.value.url = ''
        newRepository.value.vcs = ''
        // 保留名称和路径
        newRepository.value.name = currentName
    } else if (newMode === 'clone') {
        // 切换到 URL 克隆模式：清空本地路径相关字段
        newRepository.value.path = ''
        newRepository.value.vcs = ''
        // 保留名称
        newRepository.value.name = currentName
    }

    // 重置表单验证状态
    formSubmitted.value = false
})

const deleteRepository = async (item: Repository) => {
    await db.execute('DELETE FROM repositories WHERE id = $1', [item.id])
    await getRepositories(projectInfo.value!.id)
    // 通知其他组件数据已更新
    eventBus.emit(Events.REPOSITORY_DELETED, item)
    toast.add({
        severity: 'success',
        summary: '删除成功',
        detail: `仓库 "${item.name}" 已删除`,
        life: 3000,
    })
}

// ==================== 批量操作 ====================
/**
 * 批量拉取所有 Git 仓库和更新所有 SVN 仓库
 */
async function batchPull() {
    if (!repositoryList.value.length) return

    batchLoading.value.pull = true
    batchResults.value = []

    const gitRepos = repositoryList.value.filter(r => r.vcs === 'git')
    const svnRepos = repositoryList.value.filter(r => r.vcs === 'svn')

    let successCount = 0
    let failCount = 0

    // 批量处理 Git 仓库
    for (const repo of gitRepos) {
        try {
            await gitApi.pull(repo.path)
            batchResults.value.push({ repo, success: true, message: '拉取成功' })
            successCount++
            // 刷新状态
            await loadGitStatus(repo)
        } catch (error) {
            batchResults.value.push({ repo, success: false, message: error as string })
            failCount++
        }
    }

    // 批量处理 SVN 仓库
    for (const repo of svnRepos) {
        try {
            await svnApi.update(repo.path)
            batchResults.value.push({ repo, success: true, message: '更新成功' })
            successCount++
            // 刷新状态
            await loadSvnStatus(repo)
        } catch (error) {
            batchResults.value.push({ repo, success: false, message: error as string })
            failCount++
        }
    }

    batchLoading.value.pull = false

    // 显示汇总结果
    if (failCount === 0) {
        toast.add({
            severity: 'success',
            summary: '批量操作成功',
            detail: `成功更新 ${successCount} 个仓库`,
            life: 3000
        })
    } else {
        showBatchResults.value = true
        toast.add({
            severity: 'warn',
            summary: '批量操作完成',
            detail: `成功: ${successCount}, 失败: ${failCount}`,
            life: 5000
        })
    }
}

/**
 * 批量推送所有 Git 仓库
 */
async function batchPush() {
    if (!repositoryList.value.length) return

    // 只推送 Git 仓库
    const gitRepos = repositoryList.value.filter(r => r.vcs === 'git')
    if (!gitRepos.length) {
        toast.add({
            severity: 'info',
            summary: '没有 Git 仓库',
            detail: 'SVN 仓库不支持推送操作',
            life: 3000
        })
        return
    }

    batchLoading.value.push = true
    batchResults.value = []

    let successCount = 0
    let failCount = 0

    for (const repo of gitRepos) {
        try {
            await gitApi.push(repo.path)
            batchResults.value.push({ repo, success: true, message: '推送成功' })
            successCount++
            // 刷新状态
            await loadGitStatus(repo)
        } catch (error) {
            batchResults.value.push({ repo, success: false, message: error as string })
            failCount++
        }
    }

    batchLoading.value.push = false

    // 显示汇总结果
    if (failCount === 0) {
        toast.add({
            severity: 'success',
            summary: '批量推送成功',
            detail: `成功推送 ${successCount} 个仓库`,
            life: 3000
        })
    } else {
        showBatchResults.value = true
        toast.add({
            severity: 'warn',
            summary: '批量推送完成',
            detail: `成功: ${successCount}, 失败: ${failCount}`,
            life: 5000
        })
    }
}

function editPjName(item: any) {
    // 防止重复打开
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

async function onUpdatePjName() {
    renameFormSubmitted.value = true

    if (!pjInfo.value.name) {
        return
    }

    await db.execute('UPDATE repositories SET name = $1 where id = $2', [
        pjInfo.value.name,
        pjInfo.value.id,
    ])
    isShowRePjName.value = false
    getRepositories(route.params.id as string)
    toast.add({ severity: 'success', summary: '更新成功', detail: '仓库名称已更新', life: 3000 })
}

function onAfterLeave() {
    newRepository.value.name = ''
    newRepository.value.path = ''
    newRepository.value.url = ''
    newRepository.value.vcs = ''
    formSubmitted.value = false
    // 重置克隆模式相关状态
    addMode.value = 'local'
    cloneUrl.value = ''
    cloneTargetPath.value = ''
    isCloning.value = false
}

function onAfterLeaveRePjName() {
    pjInfo.value.name = ''
    pjInfo.value.id = ''
    renameFormSubmitted.value = false
}

// 获取 Git 状态
function getGitStatus(repoId: number | string): GitStatus | undefined {
    return gitStatuses.value.get(String(repoId))
}

// 加载仓库的 Git 状态
async function loadGitStatus(repository: Repository) {
    if (repository.vcs !== 'git') return

    try {
        const status = await gitApi.getStatus(repository.path)
        gitStatuses.value.set(String(repository.id), status)
    } catch (error) {
        // 静默失败
    }
}

// 加载所有 Git 仓库的状态
async function loadAllGitStatuses() {
    if (!repositoryList.value) return

    for (const repo of repositoryList.value) {
        if (repo.vcs === 'git') {
            await loadGitStatus(repo)
        }
    }
}

// 获取 SVN 状态
function getSvnStatus(repoId: number | string): SvnStatus | undefined {
    return svnStatuses.value.get(String(repoId))
}

// 加载仓库的 SVN 状态
async function loadSvnStatus(repository: Repository) {
    if (repository.vcs !== 'svn') return

    try {
        const status = await svnApi.getStatus(repository.path)
        svnStatuses.value.set(String(repository.id), status)
    } catch (error) {
        // 静默失败
    }
}

// 加载所有 SVN 仓库的状态
async function loadAllSvnStatuses() {
    if (!repositoryList.value) return

    for (const repo of repositoryList.value) {
        if (repo.vcs === 'svn') {
            await loadSvnStatus(repo)
        }
    }
}

// 导航到仓库详情页
function navigateToDetail(repoId: number | string) {
    router.push(`/repository/${repoId}`)
}

// 监听 repositoryList 变化，自动加载 Git 和 SVN 状态
// 使用标志位防止重复执行
let isLoadingStatuses = false
watch(
    () => repositoryList.value,
    (newList) => {
        // 防止初始化时重复执行
        if (isLoadingStatuses) return

        // 只在列表真正变化时执行（长度变化或内容变化）
        if (newList && newList.length > 0) {
            isLoadingStatuses = true
            Promise.all([loadAllGitStatuses(), loadAllSvnStatuses()]).finally(() => {
                isLoadingStatuses = false
            })
        }
    },
    { immediate: true },
)
</script>

<style scoped>
/* ==================== 页面容器 ==================== */
.page-container {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: #f8fafc;
    box-sizing: border-box;
}

/* ==================== 页面头部 ==================== */
.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
}

.page-header-content {
    flex: 1;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}

.batch-actions {
    display: flex;
    gap: 0.5rem;
    padding-left: 1rem;
    border-left: 1px solid #e2e8f0;
}

.page-title {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.page-icon {
    width: 3.5rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-radius: 12px;
    color: #2563eb;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.title-text h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
}

.page-description {
    margin: 0;
    font-size: 0.9375rem;
    color: #64748b;
    line-height: 1.6;
}

.page-description.empty {
    font-style: italic;
    opacity: 0.6;
}

/* ==================== 主要操作按钮 - 现代设计 ==================== */
.add-repo-button :deep(.p-button) {
    position: relative;
    border-radius: 10px;
    font-weight: 600;
    letter-spacing: 0.01em;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
    border: none;
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.04),
        0 3px 8px rgba(59, 130, 246, 0.25);
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    overflow: hidden;
}

.add-repo-button :deep(.p-button::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.add-repo-button :deep(.p-button:hover) {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow:
        0 4px 8px rgba(59, 130, 246, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.06);
}

.add-repo-button :deep(.p-button:hover::before) {
    opacity: 1;
}

.add-repo-button :deep(.p-button:active) {
    transform: translateY(0);
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.04),
        0 2px 5px rgba(59, 130, 246, 0.2);
}

.add-repo-button :deep(.p-button .p-button-icon) {
    font-size: 0.9375rem;
    margin-right: 0.5rem;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.add-repo-button :deep(.p-button:hover .p-button-icon) {
    transform: rotate(90deg);
}

.add-repo-button :deep(.p-button .p-button-label) {
    font-weight: 600;
    position: relative;
    z-index: 1;
}

/* ==================== 仓库网格 ==================== */
.repository-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
}

.repository-card {
    border: 1px solid #f1f5f9;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.repository-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.repository-card :deep(.p-card-content) {
    padding: 1.25rem;
}

.repository-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* ==================== 仓库头部 ==================== */
.repository-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.repository-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.repository-icon.git {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
}

.repository-icon.svn {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #d97706;
}

.repository-info {
    flex: 1;
    min-width: 0;
}

.repository-name {
    margin: 0 0 0.375rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.repository-tag {
    font-size: 0.6875rem;
    font-weight: 500;
}

/* ==================== Git 状态 ==================== */
.git-status {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
}

.git-status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: #334155;
    font-weight: 500;
}

.git-status-item i {
    color: #3b82f6;
    font-size: 0.875rem;
}

.git-status-badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.625rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
}

.git-status-badge.dirty {
    background: #fef2f2;
    color: #dc2626;
}

.git-status-badge.dirty i {
    color: #dc2626;
    font-size: 0.8125rem;
}

.git-status-badge.clean {
    background: #f0fdf4;
    color: #16a34a;
}

.git-status-badge.clean i {
    color: #16a34a;
    font-size: 0.8125rem;
}

/* ==================== 仓库路径 ==================== */
.repository-path {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    font-size: 0.8125rem;
    color: #64748b;
}

.repository-path i {
    color: #3b82f6;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.repository-path span {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Consolas', 'Monaco', monospace;
}

/* ==================== 操作按钮 ==================== */
.repository-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.875rem;
    border-top: 1px solid #f1f5f9;
}

.repository-actions :deep(.p-button) {
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.repository-actions :deep(.p-button:hover) {
    background: #f8fafc;
    transform: translateY(-1px);
}

.repository-actions :deep(.p-button:active) {
    transform: translateY(0);
}

.repository-actions :deep(.p-button .p-button-icon) {
    font-size: 1rem;
    margin: 0;
}

.repository-actions :deep(.p-button.p-button-danger:hover) {
    background: #fef2f2;
}

.repository-actions :deep(.p-button.p-button-secondary:hover) {
    background: #f8fafc;
}

/* ==================== Tooltip 样式优化 ==================== */
.repository-actions :deep(.p-tooltip) {
    font-size: 0.8125rem;
    font-weight: 500;
}

.repository-actions :deep(.p-tooltip .p-tooltip-text) {
    background: #1e293b;
    border-radius: 6px;
    padding: 0.375rem 0.625rem;
}

/* ==================== 空状态 ==================== */
.empty-repositories {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    text-align: center;
}

.empty-illustration {
    margin-bottom: 1.5rem;
}

.empty-icon-bg {
    width: 6rem;
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 50%;
    margin-bottom: 1.5rem;
}

.empty-icon-bg i {
    font-size: 3rem;
    color: #94a3b8;
    opacity: 0.5;
}

.empty-repositories h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #334155;
}

.empty-repositories p {
    margin: 0 0 2rem 0;
    font-size: 0.9375rem;
    color: #64748b;
}

.empty-action-button :deep(.p-button) {
    position: relative;
    border-radius: 10px;
    font-weight: 600;
    letter-spacing: 0.01em;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
    border: none;
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.04),
        0 3px 8px rgba(59, 130, 246, 0.25);
    padding: 0.75rem 1.75rem;
    font-size: 0.875rem;
    overflow: hidden;
}

.empty-action-button :deep(.p-button::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.empty-action-button :deep(.p-button:hover) {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow:
        0 4px 8px rgba(59, 130, 246, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.06);
}

.empty-action-button :deep(.p-button:hover::before) {
    opacity: 1;
}

.empty-action-button :deep(.p-button:active) {
    transform: translateY(0);
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.04),
        0 2px 5px rgba(59, 130, 246, 0.2);
}

.empty-action-button :deep(.p-button .p-button-icon) {
    font-size: 0.9375rem;
    margin-right: 0.5rem;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.empty-action-button :deep(.p-button:hover .p-button-icon) {
    transform: rotate(90deg);
}

.empty-action-button :deep(.p-button .p-button-label) {
    font-weight: 600;
    position: relative;
    z-index: 1;
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

.form-field :deep(.p-inputtext) {
    width: 100%;
}

/* 模式选择器 */
.mode-selector {
    display: flex;
    gap: 0.5rem;
}

.mode-selector :deep(.p-button) {
    flex: 1;
    border-radius: 8px;
}

/* 路径输入组 */
.path-input-group {
    display: flex;
    gap: 0.5rem;
}

.path-input-group .path-input {
    flex: 1;
}

.path-input-group :deep(.p-button) {
    flex-shrink: 0;
}

/* 提示文字 */
.p-hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #64748b;
}

.p-success {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #16a34a;
}

/* 路径信息显示 */
.path-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.path-display {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    color: #64748b;
    font-size: 0.875rem;
}

.path-display i {
    color: #3b82f6;
    font-size: 1rem;
}

.path-display span {
    flex: 1;
    font-family: 'Consolas', 'Monaco', monospace;
}

/* ==================== 对话框底部按钮 ==================== */
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

/* ==================== 批量操作结果 ==================== */
.batch-results-content {
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.batch-result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    transition: all 0.15s ease;
}

.batch-result-item.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.batch-result-item.error {
    background: #fef2f2;
    border-color: #fecaca;
}

.batch-result-item .result-icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.batch-result-item.success .result-icon {
    color: #16a34a;
    font-size: 1.25rem;
}

.batch-result-item.error .result-icon {
    color: #dc2626;
    font-size: 1.25rem;
}

.batch-result-item .result-info {
    flex: 1;
    min-width: 0;
}

.batch-result-item .result-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: #0f172a;
    margin-bottom: 0.125rem;
}

.batch-result-item .result-message {
    font-size: 0.8125rem;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ==================== 克隆进度对话框 ==================== */
.clone-progress-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0;
}

.progress-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.progress-status {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-color);
}

.progress-details {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    word-break: break-all;
    line-height: 1.4;
}

.progress-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

.progress-hint i {
    color: var(--primary-color);
    font-size: 1rem;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: stretch;
    }

    .page-title {
        flex-direction: row;
    }

    .repository-grid {
        grid-template-columns: 1fr;
    }

    .repository-actions {
        justify-content: space-between;
    }
}
</style>
