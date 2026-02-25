<template>
    <div data-tauri-drag-region class="titlebar">
        <div class="titlebar-left">
            <Button
                icon="pi pi-cog"
                text
                severity="secondary"
                @click="openSettings"
                class="settings-button"
                v-tooltip.right="'设置'"
            />
        </div>
        <div v-if="isCompatibility" class="titlebar-right">
            <div class="titlebar-button" @click="appWindow.minimize">
                <i class="pi pi-minus"></i>
            </div>
            <div class="titlebar-button" @click="appWindow.toggleMaximize">
                <i class="pi pi-window-maximize"></i>
            </div>
            <div class="titlebar-button close" @click="appWindow.close">
                <i class="pi pi-times"></i>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import { type } from '@tauri-apps/plugin-os'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const isCompatibility = computed(() => type() === 'windows' || type() === 'linux')

const appWindow = getCurrentWindow();

function openSettings() {
    router.push('/settings')
}
</script>

<style scoped>
.titlebar {
    flex:none;
    height: 32px;
    background: #ffffff;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding: 0 0.5rem;
}

.titlebar-left {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.titlebar-right {
    height: 100%;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.settings-button {
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-button :deep(.p-button-icon) {
    font-size: 1.125rem;
    color: #64748b;
    transition: color 0.2s ease;
}

.settings-button:hover {
    background: #f8fafc;
}

.settings-button:hover :deep(.p-button-icon) {
    color: #3b82f6;
}

.settings-button:active {
    transform: scale(0.95);
}

.titlebar-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 46px;
    height: 100%;
    user-select: none;
    -webkit-user-select: none;
    transition: all 0.1s ease;
    cursor: pointer;
}

.titlebar-button i {
    font-size: 0.75rem;
    color: #64748b;
}

.titlebar-button:hover {
    background: #f8fafc;
}

.titlebar-button:hover i {
    color: #0f172a;
}

.titlebar-button.close:hover {
    background: #ef4444;
}

.titlebar-button.close:hover i {
    color: white;
}
</style>
