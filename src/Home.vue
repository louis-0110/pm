<template>
    <Toast></Toast>
    <main class="main-container">
        <WindowBar></WindowBar>
        <Splitter
            class="app-splitter"
            direction="horizontal"
            :default-size="25"
            :max="50"
            :min-size="20"
            :resize-trigger-size="3"
        >
            <SplitterPanel :size="25" :min-size="20">
                <PL></PL>
            </SplitterPanel>
            <SplitterPanel :size="75">
                <section class="right-container">
                    <div class="content-area">
                        <router-view v-slot="{ Component }">
                            <component :is="Component" />
                        </router-view>
                    </div>
                </section>
            </SplitterPanel>
        </Splitter>

        <!-- 操作历史浮动按钮和面板 -->
        <div class="history-float">
            <OverlayPanel ref="historyPanel" appendTo="body">
                <OperationHistory ref="historyComponent" @close="historyPanel?.hide()" />
            </OverlayPanel>
            <Button
                icon="pi pi-history"
                severity="secondary"
                rounded
                class="history-toggle-btn"
                @click="toggleHistory"
                v-tooltip.right="'操作历史'"
            />
        </div>
    </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PL from './components/PL.vue'
import WindowBar from './components/WindowBar.vue'
import OperationHistory from './components/OperationHistory.vue'

const historyPanel = ref()
const historyComponent = ref()

function toggleHistory(event: Event) {
    historyPanel.value?.toggle(event)
    if (historyComponent.value) {
        historyComponent.value.refreshHistory()
    }
}
</script>

<style scoped>
.main-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
}

.app-splitter {
    flex: 1;
    overflow: hidden;
}

.app-splitter :deep(.p-splitter-panel) {
    background: transparent;
    height: 100%;
    overflow: hidden;
}

.app-splitter :deep(.p-splitter-panel-container) {
    height: 100%;
}

.app-splitter :deep(.p-splitter-gutter) {
    background: #e2e8f0;
    transition: background 0.2s ease;
}

.app-splitter :deep(.p-splitter-gutter:hover) {
    background: #3b82f6;
}

.app-splitter :deep(.p-splitter-gutter-handle) {
    background: transparent;
}

.right-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.content-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.content-area > * {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}

/* ==================== 操作历史浮动按钮 ==================== */
.history-float {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
}

.history-toggle-btn {
    width: 3rem;
    height: 3rem;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
}

.history-toggle-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
</style>
