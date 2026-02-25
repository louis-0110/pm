<template>
    <div class="operation-history">
        <div class="history-header">
            <div class="history-title">
                <i class="pi pi-history"></i>
                <span>操作历史</span>
                <Tag v-if="histories.length > 0" :value="histories.length" severity="secondary" />
            </div>
            <div class="header-actions">
                <Button
                    v-if="histories.length > 0"
                    icon="pi pi-trash"
                    text
                    severity="secondary"
                    size="small"
                    @click="clearHistory"
                    v-tooltip.right="'清空历史'"
                />
                <Button
                    icon="pi pi-times"
                    text
                    severity="secondary"
                    @click="$emit('close')"
                    v-tooltip.right="'关闭'"
                />
            </div>
        </div>

        <div v-if="histories.length === 0" class="history-empty">
            <i class="pi pi-inbox"></i>
            <p>暂无操作记录</p>
        </div>

        <div v-else class="history-list">
            <div
                v-for="item in histories"
                :key="item.id"
                class="history-item"
                :class="item.status"
            >
                <div class="history-icon">
                    <i :class="getOperationIcon(item.type)" />
                </div>
                <div class="history-content">
                    <div class="history-header-row">
                        <span class="history-repo">{{ item.repositoryName }}</span>
                        <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                    </div>
                    <div class="history-message">{{ item.message }}</div>
                    <div v-if="item.duration" class="history-duration">
                        <i class="pi pi-clock"></i>
                        <span>{{ item.duration }}ms</span>
                    </div>
                </div>
                <div class="history-status">
                    <i :class="[
                        item.status === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle',
                        item.status
                    ]" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { operationHistory, type OperationHistory } from '@/types'

defineEmits<{
    close: []
}>()

const histories = ref<OperationHistory[]>([])

// 刷新历史记录
function refreshHistory() {
    histories.value = operationHistory.getRecent(20)
}

// 清空历史
function clearHistory() {
    operationHistory.clear()
    histories.value = []
}

// 格式化时间
function formatTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`

    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 获取操作图标
function getOperationIcon(type: string): string {
    const iconMap: Record<string, string> = {
        git_pull: 'pi pi-download',
        git_push: 'pi pi-upload',
        git_commit: 'pi pi-check',
        git_diff: 'pi pi-file-edit',      // 使用 file-edit 替代 file-text
        svn_update: 'pi pi-download',
        svn_commit: 'pi pi-check',
        svn_diff: 'pi pi-file-edit',      // 使用 file-edit 替代 file-text
        batch_pull: 'pi pi-cloud-download',
        batch_push: 'pi pi-cloud-upload'
    }
    return iconMap[type] || 'pi pi-cog'
}

// 定时刷新
let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    refreshHistory()
    // 每秒刷新一次时间显示
    refreshTimer = setInterval(refreshHistory, 10000)
})

onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }
})

// 暴露刷新方法供外部调用
defineExpose({
    refreshHistory
})
</script>

<style scoped>
.operation-history {
    width: 320px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    background: #f8fafc;
}

.history-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #0f172a;
}

.history-title i {
    color: #3b82f6;
}

.header-actions {
    display: flex;
    gap: 0.25rem;
}

.history-empty {
    padding: 3rem 1.5rem;
    text-align: center;
    color: #94a3b8;
}

.history-empty i {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
}

.history-empty p {
    margin: 0;
    font-size: 0.875rem;
}

.history-list {
    max-height: 400px;
    overflow-y: auto;
}

.history-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s ease;
}

.history-item:last-child {
    border-bottom: none;
}

.history-item:hover {
    background: #f8fafc;
}

.history-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-radius: 8px;
    color: #2563eb;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.history-content {
    flex: 1;
    min-width: 0;
}

.history-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.history-repo {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #0f172a;
}

.history-time {
    font-size: 0.6875rem;
    color: #94a3b8;
}

.history-message {
    font-size: 0.75rem;
    color: #64748b;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.history-duration {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: #94a3b8;
    margin-top: 0.25rem;
}

.history-duration i {
    font-size: 0.625rem;
}

.history-status {
    flex-shrink: 0;
}

.history-status i {
    font-size: 1rem;
}

.history-status i.success {
    color: #16a34a;
}

.history-status i.error {
    color: #dc2626;
}

.history-item.pending .history-icon {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #d97706;
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar {
    width: 4px;
}

.history-list::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.history-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
