<template>
    <Toolbar class="app-toolbar">
        <template #start>
            <div class="toolbar-section">
                <Button
                    icon="pi pi-refresh"
                    label="刷新"
                    severity="secondary"
                    text
                    @click="handleRefresh"
                />
                <Button
                    icon="pi pi-sort-amount-down"
                    label="排序"
                    severity="secondary"
                    text
                    @click="handleSort"
                />
            </div>
        </template>

        <template #end>
            <div class="toolbar-section">
                <Button
                    icon="pi pi-cog"
                    label="设置"
                    severity="secondary"
                    text
                    @click="handleSettings"
                />
            </div>
        </template>
    </Toolbar>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  refresh: []
  sort: []
  settings: []
}>()

const handleRefresh = () => {
    emit('refresh')
}

const handleSort = () => {
    emit('sort')
}

const handleSettings = () => {
    emit('settings')
}
</script>

<style scoped>
.app-toolbar {
    padding: 0.75rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    min-height: 3rem;
}

.app-toolbar :deep(.p-toolbar-group-start),
.app-toolbar :deep(.p-toolbar-group-end) {
    gap: 0.5rem;
}

.toolbar-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* ==================== 工具栏按钮统一样式 ==================== */
.toolbar-section :deep(.p-button) {
    height: 2.25rem;
    padding: 0 0.75rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-section :deep(.p-button:hover) {
    background: #f8fafc;
}

.toolbar-section :deep(.p-button .p-button-icon) {
    font-size: 0.875rem;
    margin-right: 0.375rem;
}

.toolbar-section :deep(.p-button .p-button-label) {
    font-size: 0.8125rem;
    font-weight: 500;
}
</style>
