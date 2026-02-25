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
    </main>
</template>

<script setup lang="ts">
import PL from './components/PL.vue'
import WindowBar from './components/WindowBar.vue'
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
</style>
