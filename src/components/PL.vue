<template>
    <div class="sidebar">
        <!-- 头部 -->
        <div class="sidebar-header">
            <div class="brand" @click="goHome">
                <div class="brand-icon">
                    <img src="/src/assets/app-icon.png" alt="PM" class="brand-icon-img" />
                </div>
                <span class="brand-text">PM</span>
            </div>
            <Button
                severity="secondary"
                icon="pi pi-plus"
                size="small"
                v-tooltip.right="'新建项目'"
                @click="openNewProjectDialog"
            />
        </div>

        <!-- 搜索 -->
        <div class="sidebar-search">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                    v-model="search"
                    placeholder="搜索项目..."
                    @input="searchProject"
                />
            </IconField>
        </div>

        <!-- 项目列表 -->
        <div class="sidebar-content">
            <div
                v-if="pList.length > 0"
                class="project-list"
            >
                <div
                    v-for="item in pList"
                    :key="item.id"
                    :class="['project-item', { active: item.id + '' === $route.params.id }]"
                    @click="openProject(item)"
                >
                    <div class="project-item-inner">
                        <div class="project-icon-wrapper">
                            <i class="pi pi-folder"></i>
                            <Badge
                                v-if="getRepositoryCount(item.id)"
                                :value="getRepositoryCount(item.id)"
                            />
                        </div>
                        <div class="project-info">
                            <div class="project-name">{{ item.name }}</div>
                            <div class="project-meta">
                                <span
                                    v-if="item.description"
                                    class="project-desc"
                                    >{{ item.description }}</span
                                >
                                <span
                                    v-else
                                    class="project-desc empty"
                                    >暂无描述</span
                                >
                                <span class="project-time">{{ formatDate(item.updated_at) }}</span>
                            </div>
                        </div>
                        <Button
                            icon="pi pi-trash"
                            text
                            severity="secondary"
                            size="small"
                            class="delete-btn"
                            @click.stop="openDeleteDialog(item)"
                            v-tooltip.right="'删除项目'"
                        />
                        <div class="project-chevron">
                            <i class="pi pi-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div
                v-else
                class="empty-state"
            >
                <div class="empty-icon">
                    <i class="pi pi-folder-open"></i>
                </div>
                <h3>暂无项目</h3>
                <p>创建第一个项目来管理代码仓库</p>
                <Button
                    label="创建项目"
                    icon="pi pi-plus"
                    severity="primary"
                    @click="openNewProjectDialog"
                    class="empty-create-btn"
                />
            </div>
        </div>

        <!-- 底部 -->
        <div class="sidebar-footer">
            <div class="stats">
                <span class="stats-item">
                    <i class="pi pi-folder"></i>
                    {{ pList.length }} 个项目
                </span>
            </div>
        </div>
    </div>

    <!-- 新建项目对话框 -->
    <Dialog
        v-model:visible="showModal"
        modal
        header="新建项目"
        :style="{ width: '480px' }"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <form @submit.prevent="onCreateNewProject">
            <div class="form-content">
                <div class="form-field">
                    <label for="projectName">
                        <i class="pi pi-tag"></i>
                        项目名称
                    </label>
                    <InputText
                        id="projectName"
                        v-model="model.projectName"
                        placeholder="例如：前端项目"
                        :class="{ 'p-invalid': !model.projectName && formSubmitted }"
                    />
                    <small
                        class="p-error"
                        v-if="!model.projectName && formSubmitted"
                        >请输入项目名称</small
                    >
                </div>

                <div class="form-field">
                    <label for="description">
                        <i class="pi pi-align-left"></i>
                        项目描述
                        <span class="optional">（可选）</span>
                    </label>
                    <Textarea
                        id="description"
                        v-model="model.description"
                        placeholder="简要描述这个项目..."
                        rows="3"
                        auto-resize
                    />
                </div>
            </div>

            <div class="form-footer">
                <Button
                    label="取消"
                    severity="secondary"
                    text
                    @click="showModal = false"
                />
                <Button
                    type="submit"
                    label="创建"
                    severity="primary"
                />
            </div>
        </form>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog
        v-model:visible="showDeleteConfirm"
        modal
        header="确认删除"
        :style="{ width: '400px' }"
        :dismissableMask="true"
        :closeOnEscape="true"
    >
        <div class="delete-confirm-content">
            <i class="pi pi-exclamation-triangle warning-icon"></i>
            <p>确定要删除项目 <strong>"{{ projectToDelete?.name }}"</strong> 吗？</p>
            <p class="warning-text">这将同时删除该项目下的所有仓库记录，此操作不可撤销。</p>
        </div>
        <div class="form-footer">
            <Button
                label="取消"
                severity="secondary"
                text
                @click="showDeleteConfirm = false"
            />
            <Button
                label="删除"
                severity="danger"
                @click="confirmDeleteProject"
            />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import dbFn from '@/db'
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { formatDate, debounce } from '@/utils'
import { eventBus, Events } from '@/utils/eventBus'
import type { Project } from '@/types'

const db = await dbFn
const toast = useToast()
const router = useRouter()

const showModal = ref(false)
const showDeleteConfirm = ref(false)
const formSubmitted = ref(false)
const repositoryCounts = ref<Record<number, number>>({})

// 防止重复打开的标志
let isOpeningDialog = false

// 待删除的项目
const projectToDelete = ref<Project | null>(null)

const pList = ref<Project[]>([])

const model = ref({
    projectName: '',
    description: '',
})

getProjectList()

// 监听其他组件的数据变化请求
onMounted(() => {
    // 监听项目和仓库变化，刷新项目列表（包含仓库数量）
    eventBus.on(Events.REFRESH_PROJECTS, getProjectList)
    eventBus.on(Events.PROJECT_CREATED, getProjectList)
    eventBus.on(Events.PROJECT_DELETED, getProjectList)
    eventBus.on(Events.REPOSITORY_ADDED, getProjectList)
    eventBus.on(Events.REPOSITORY_DELETED, getProjectList)
})

onUnmounted(() => {
    // 清理所有事件监听
    eventBus.off(Events.REFRESH_PROJECTS, getProjectList)
    eventBus.off(Events.PROJECT_CREATED, getProjectList)
    eventBus.off(Events.PROJECT_DELETED, getProjectList)
    eventBus.off(Events.REPOSITORY_ADDED, getProjectList)
    eventBus.off(Events.REPOSITORY_DELETED, getProjectList)
})

// 打开新建项目 Dialog
function openNewProjectDialog() {
    // 防止重复打开
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

async function getProjectList() {
    try {
        const projects = await db.select<Project[]>('SELECT * FROM projects')
        pList.value = projects

        // 批量获取所有项目的仓库数量
        const counts = await db.select<{ project_id: number; count: number }[]>(
            'SELECT project_id, COUNT(*) as count FROM repositories GROUP BY project_id'
        )

        // 重置并更新计数
        repositoryCounts.value = {}
        counts.forEach(c => {
            repositoryCounts.value[c.project_id] = c.count
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: '加载失败',
            detail: error as string,
            life: 3000
        })
    }
}

const getRepositoryCount = (projectId: number) => {
    return repositoryCounts.value[projectId] || 0
}

const onCreateNewProject = () => {
    formSubmitted.value = true

    if (!model.value.projectName) {
        return
    }

    db.execute('INSERT OR IGNORE INTO projects (name, description) VALUES ($1, $2) ', [
        model.value.projectName,
        model.value.description,
    ])
        .then((res) => {
            if (res.rowsAffected < 1) {
                toast.add({
                    severity: 'error',
                    summary: '创建失败',
                    detail: '项目名称可能已存在',
                    life: 3000,
                })
                return
            }
            toast.add({
                severity: 'success',
                summary: '创建成功',
                detail: `项目 "${model.value.projectName}" 已创建`,
                life: 3000,
            })
            model.value.description = ''
            model.value.projectName = ''
            formSubmitted.value = false
            showModal.value = false
            getProjectList()
            // 通知其他组件数据已更新
            eventBus.emit(Events.PROJECT_CREATED, model.value.projectName)
        })
        .catch(() => {
            toast.add({ severity: 'error', summary: '创建失败', detail: '请稍后重试', life: 3000 })
        })
}

const openProject = (item: Project) => {
    router.push({ path: '/pd/' + item.id })
}

// 删除项目
const openDeleteDialog = (item: Project) => {
    projectToDelete.value = item
    showDeleteConfirm.value = true
}

const confirmDeleteProject = async () => {
    if (!projectToDelete.value) return

    // 保存项目信息用于事件通知
    const deletedProject = projectToDelete.value

    try {
        // 先删除关联的仓库记录
        await db.execute('DELETE FROM repositories WHERE project_id = $1', [deletedProject.id])
        // 再删除项目
        await db.execute('DELETE FROM projects WHERE id = $1', [deletedProject.id])

        toast.add({
            severity: 'success',
            summary: '删除成功',
            detail: `项目 "${deletedProject.name}" 已删除`,
            life: 3000
        })
        showDeleteConfirm.value = false
        projectToDelete.value = null
        getProjectList()
        // 通知其他组件数据已更新（使用保存的项目信息）
        eventBus.emit(Events.PROJECT_DELETED, deletedProject)
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: '删除失败',
            detail: error as string,
            life: 3000
        })
    }
}

// 返回首页
const goHome = () => {
    router.push('/')
}

const search = ref('')

// 使用工具函数中的 debounce
const searchProject = debounce(async () => {
    if (!search.value.trim()) {
        getProjectList()
        return
    }

    try {
        const res = await db.select<Project[]>(
            'SELECT * FROM projects WHERE name LIKE $1',
            [`%${search.value}%`]
        )
        pList.value = res

        // 批量获取仓库数量
        const counts = await db.select<{ project_id: number; count: number }[]>(
            'SELECT project_id, COUNT(*) as count FROM repositories GROUP BY project_id'
        )

        repositoryCounts.value = {}
        counts.forEach(c => {
            repositoryCounts.value[c.project_id] = c.count
        })
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: '搜索失败',
            detail: error as string,
            life: 3000
        })
    }
}, 300)
</script>

<style scoped>
/* ==================== 侧边栏容器 ==================== */
.sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
}

/* ==================== 头部 ==================== */
.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
}

.brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0.25rem;
    border-radius: 10px;
}

.brand:hover {
    background: rgba(59, 130, 246, 0.05);
}

.brand:active {
    transform: scale(0.98);
}

.brand-icon {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
}

.brand:hover .brand-icon {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.brand-icon-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.brand-text {
    font-size: 1.25rem;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.add-btn :deep(.p-button) {
    position: relative;
    width: 2rem;
    height: 2rem;
    border-radius: 9px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
    color: white;
    border: none;
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.04),
        0 2px 6px rgba(59, 130, 246, 0.25);
    overflow: hidden;
}

.add-btn :deep(.p-button::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0.3) 0%,
        rgba(255, 255, 255, 0) 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
}

.add-btn :deep(.p-button:hover) {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
    transform: translateY(-1px) scale(1.05);
    box-shadow:
        0 3px 8px rgba(59, 130, 246, 0.3),
        0 1px 2px rgba(0, 0, 0, 0.06);
}

.add-btn :deep(.p-button:hover::before) {
    opacity: 1;
}

.add-btn :deep(.p-button:active) {
    transform: translateY(0) scale(1);
}

.add-btn :deep(.p-button .p-button-icon) {
    font-size: 0.875rem;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 1;
}

.add-btn :deep(.p-button:hover .p-button-icon) {
    transform: rotate(90deg);
}

/* ==================== 搜索 ==================== */
.sidebar-search {
    padding: 1rem 1.25rem 0.75rem;
}

.sidebar-search :deep(.p-inputtext) {
    width: 100%;
    border-radius: 10px;
    padding: 0.625rem 0.875rem 0.625rem 2.5rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 0.875rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-search :deep(.p-inputtext:focus) {
    background: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sidebar-search :deep(.p-inputtext:hover) {
    border-color: #cbd5e1;
}

.sidebar-search :deep(.p-inputicon) {
    left: 0.75rem;
    color: #94a3b8;
    transition: color 0.2s ease;
}

.sidebar-search :deep(.p-inputtext:focus + .p-inputicon),
.sidebar-search :deep(.p-icon-field):has(.p-inputtext:focus) .p-inputicon {
    color: #3b82f6;
}

/* ==================== 内容区 ==================== */
.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 1rem 1rem;
}

/* 侧边栏滚动条样式 */
.sidebar-content::-webkit-scrollbar {
    width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

/* ==================== 项目列表 ==================== */
.project-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.project-item {
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.project-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 0 2px 2px 0;
    transition: height 0.15s ease;
}

.project-item:hover {
    background: #f8fafc;
}

.project-item:hover::before {
    height: 50%;
}

.project-item.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.project-item.active::before {
    height: 60%;
    background: rgba(255, 255, 255, 0.3);
}

.project-item-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    position: relative;
}

.project-icon-wrapper {
    position: relative;
    flex-shrink: 0;
}

.project-icon-wrapper > i {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #2563eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.15s ease;
}

.project-item.active .project-icon-wrapper > i {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.project-icon-wrapper :deep(.p-badge) {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 1.125rem;
    height: 1.125rem;
    font-size: 0.625rem;
    background: #ef4444;
    border: 2px solid #ffffff;
}

.project-item.active .project-icon-wrapper :deep(.p-badge) {
    border-color: #3b82f6;
    background: #fbbf24;
}

.project-info {
    flex: 1;
    min-width: 0;
}

.project-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: #0f172a;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s ease;
}

.project-item.active .project-name {
    color: white;
}

.project-meta {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.project-desc {
    font-size: 0.75rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s ease;
}

.project-desc.empty {
    font-style: italic;
    opacity: 0.5;
}

.project-item.active .project-desc {
    color: rgba(255, 255, 255, 0.8);
}

.project-time {
    font-size: 0.6875rem;
    color: #94a3b8;
    transition: color 0.15s ease;
}

.project-item.active .project-time {
    color: rgba(255, 255, 255, 0.7);
}

.project-chevron {
    opacity: 0;
    color: #cbd5e1;
    font-size: 0.75rem;
    transition: all 0.15s ease;
    flex-shrink: 0;
}

.project-item:hover .project-chevron {
    opacity: 0.5;
}

.project-item.active .project-chevron {
    opacity: 1;
    color: white;
}

/* ==================== 删除按钮 ==================== */
.delete-btn {
    opacity: 0;
    flex-shrink: 0;
    width: 1.75rem !important;
    height: 1.75rem !important;
    padding: 0 !important;
    border-radius: 6px !important;
    transition: all 0.15s ease !important;
}

.delete-btn :deep(.p-button-icon) {
    font-size: 0.75rem;
    color: #94a3b8;
}

.project-item:hover .delete-btn {
    opacity: 1;
}

.delete-btn:hover {
    background: #fef2f2 !important;
}

.delete-btn:hover :deep(.p-button-icon) {
    color: #ef4444 !important;
}

.project-item.active .delete-btn :deep(.p-button-icon) {
    color: rgba(255, 255, 255, 0.7);
}

.project-item.active .delete-btn:hover {
    background: rgba(255, 255, 255, 0.2) !important;
}

.project-item.active .delete-btn:hover :deep(.p-button-icon) {
    color: white !important;
}

/* ==================== 删除确认对话框 ==================== */
.delete-confirm-content {
    text-align: center;
    padding: 1rem 0;
}

.delete-confirm-content .warning-icon {
    font-size: 3rem;
    color: #f59e0b;
    margin-bottom: 1rem;
}

.delete-confirm-content p {
    margin: 0.5rem 0;
    color: #334155;
}

.delete-confirm-content .warning-text {
    font-size: 0.875rem;
    color: #64748b;
}

/* ==================== 空状态 ==================== */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
}

.empty-icon {
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border-radius: 50%;
    margin-bottom: 1rem;
}

.empty-icon i {
    font-size: 2rem;
    color: #94a3b8;
}

.empty-state h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
}

.empty-state p {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
    color: #64748b;
}

.empty-create-btn :deep(.p-button) {
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

.empty-create-btn :deep(.p-button::before) {
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

.empty-create-btn :deep(.p-button:hover) {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow:
        0 4px 8px rgba(59, 130, 246, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.06);
}

.empty-create-btn :deep(.p-button:hover::before) {
    opacity: 1;
}

.empty-create-btn :deep(.p-button:active) {
    transform: translateY(0);
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.04),
        0 2px 5px rgba(59, 130, 246, 0.2);
}

.empty-create-btn :deep(.p-button .p-button-icon) {
    font-size: 0.9375rem;
    margin-right: 0.5rem;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.empty-create-btn :deep(.p-button:hover .p-button-icon) {
    transform: rotate(90deg);
}

.empty-create-btn :deep(.p-button .p-button-label) {
    font-weight: 600;
    position: relative;
    z-index: 1;
}

/* ==================== 底部统计 ==================== */
.sidebar-footer {
    padding: 0.75rem 1.25rem 1rem;
    border-top: 1px solid #f1f5f9;
}

.stats {
    display: flex;
    gap: 1rem;
}

.stats-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: #94a3b8;
}

.stats-item i {
    font-size: 0.875rem;
}

/* ==================== 对话框 ==================== */
.form-content {
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

.form-field label .optional {
    font-weight: 400;
    color: #94a3b8;
    font-size: 0.75rem;
}

.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
    margin-top: 0.5rem;
}

.form-footer :deep(.p-button) {
    min-width: 5rem;
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
