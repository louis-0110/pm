<template>
    <div class="dashboard-page">
        <div class="dashboard-hero">
            <div class="hero-content">
                <h1>欢迎使用 PM</h1>
                <p>项目管理工具，高效管理你的代码仓库</p>
            </div>
            <div class="hero-icon">
                <img src="/src/assets/app-icon-large.png" alt="PM" class="hero-icon-img" />
            </div>
        </div>

        <div class="dashboard-stats">
            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #2563eb;">
                            <i class="pi pi-folder"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ projectCount }}</div>
                            <div class="stat-label">项目数量</div>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706;">
                            <i class="pi pi-code-branch"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ repositoryCount }}</div>
                            <div class="stat-label">代码仓库</div>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #059669;">
                            <i class="pi pi-clock"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">{{ recentActivityCount }}</div>
                            <div class="stat-label">最近活动</div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="dashboard-empty">
            <p>选择左侧项目开始管理你的代码仓库</p>
            <div class="dashboard-empty-hint">
                <i class="pi pi-info-circle"></i>
                <span>提示：点击左下角 + 号创建新项目</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import dbFn from '@/db'
import { eventBus, Events } from '@/utils/eventBus'

interface CountResult {
    count: number
}

const db = await dbFn

const projectCount = ref(0)
const repositoryCount = ref(0)
const recentActivityCount = ref(0)

async function loadStats() {
    try {
        // 获取统计数据
        const projects = await db.select<CountResult[]>('SELECT COUNT(*) as count FROM projects')
        projectCount.value = projects[0]?.count || 0

        const repos = await db.select<CountResult[]>('SELECT COUNT(*) as count FROM repositories')
        repositoryCount.value = repos[0]?.count || 0

        // 最近活动统计（暂未实现）
        recentActivityCount.value = 0
    } catch (error) {
        console.error('Failed to load stats:', error)
    }
}

onMounted(async () => {
    await loadStats()

    // 监听数据变化事件
    eventBus.on(Events.REFRESH_DASHBOARD, loadStats)
    eventBus.on(Events.PROJECT_CREATED, loadStats)
    eventBus.on(Events.PROJECT_DELETED, loadStats)
    eventBus.on(Events.REPOSITORY_ADDED, loadStats)
    eventBus.on(Events.REPOSITORY_DELETED, loadStats)
})

onUnmounted(() => {
    // 清理事件监听
    eventBus.off(Events.REFRESH_DASHBOARD, loadStats)
    eventBus.off(Events.PROJECT_CREATED, loadStats)
    eventBus.off(Events.PROJECT_DELETED, loadStats)
    eventBus.off(Events.REPOSITORY_ADDED, loadStats)
    eventBus.off(Events.REPOSITORY_DELETED, loadStats)
})
</script>

<style scoped>
.dashboard-page {
    padding: 2rem;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: #f8fafc;
    box-sizing: border-box;
}

/* ==================== Hero Section ==================== */
.dashboard-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
}

.hero-content h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.875rem;
    font-weight: 700;
    color: #0f172a;
}

.hero-content p {
    margin: 0;
    font-size: 1rem;
    color: #64748b;
}

.hero-icon {
    width: 5rem;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-icon-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* ==================== Stats Grid ==================== */
.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    border: 1px solid #f1f5f9;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-card :deep(.p-card-content) {
    padding: 1.5rem;
}

.stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.stat-info {
    flex: 1;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
}

.stat-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
}

/* ==================== Empty State ==================== */
.dashboard-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    text-align: center;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dashboard-empty p {
    margin: 0;
    font-size: 1.125rem;
    color: #64748b;
    font-weight: 500;
}

/* 添加一个提示卡片 */
.dashboard-empty-hint {
    margin-top: 1.5rem;
    padding: 1rem 1.5rem;
    background: #dbeafe;
    border-radius: 10px;
    color: #1e40af;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.dashboard-empty-hint i {
    font-size: 1.125rem;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
    .dashboard-hero {
        flex-direction: column-reverse;
        text-align: center;
        gap: 1rem;
    }

    .hero-icon {
        width: 4rem;
        height: 4rem;
        font-size: 2rem;
    }

    .dashboard-stats {
        grid-template-columns: 1fr;
    }
}
</style>
