<script setup lang="ts">
import Home from './Home.vue'
</script>

<template>
    <Suspense>
        <Home />
    </Suspense>
</template>

<style>
/* ==================== 基础重置 ==================== */
*, *::before, *::after {
    box-sizing: border-box;
}

:root {
    font-size: 16px;
    line-height: 1.5;
    font-weight: 400;
    color: #0f172a;
    background-color: #f8fafc;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    overflow: hidden;
}

:root,
body,
#app {
    margin: 0;
    height: 100%;
    width: 100%;
    user-select: none;
    -moz-user-select: -moz-none;
    -webkit-user-select: none;
}

/* ==================== 滚动条样式 ==================== */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
}

/* Firefox */
* {
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

/* ==================== PrimeVue 组件优化 ==================== */

/* Dialog */
:deep(.p-dialog) {
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

:deep(.p-dialog-header) {
    border-bottom: 1px solid #e2e8f0;
    padding: 1.5rem;
    background: #ffffff;
}

:deep(.p-dialog-title) {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
}

:deep(.p-dialog-content) {
    padding: 1.5rem;
    background: #ffffff;
}

:deep(.p-dialog-footer) {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

/* Button */
:deep(.p-button) {
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.p-button:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.p-button:active) {
    transform: translateY(0);
}

:deep(.p-button.p-button-text) {
    box-shadow: none;
}

:deep(.p-button.p-button-text:hover) {
    background: rgba(59, 130, 246, 0.08);
}

:deep(.p-button.p-button-outlined) {
    background: transparent;
    box-shadow: none;
}

:deep(.p-button-raised) {
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

/* Input */
:deep(.p-inputtext) {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    transition: all 0.15s ease;
    font-size: 0.9375rem;
}

:deep(.p-inputtext:enabled:hover) {
    border-color: #cbd5e1;
}

:deep(.p-inputtext:enabled:focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    outline: none;
}

:deep(.p-inputtext.p-invalid) {
    border-color: #ef4444;
}

:deep(.p-inputtext.p-invalid:focus) {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Textarea */
:deep(.p-textarea) {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    resize: vertical;
}

/* IconField */
:deep(.p-icon-field) {
    border-radius: 10px;
}

:deep(.p-inputicon) {
    color: #94a3b8;
}

/* Panel */
:deep(.p-panel) {
    border-radius: 16px;
    overflow: hidden;
}

:deep(.p-panel-header) {
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem 1.25rem;
}

:deep(.p-panel-title) {
    font-weight: 600;
}

:deep(.p-panel-content) {
    padding: 0;
}

/* Card */
:deep(.p-card) {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #f1f5f9;
}

:deep(.p-card:hover) {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

:deep(.p-card-content) {
    padding: 1.25rem;
}

/* Toolbar */
:deep(.p-toolbar) {
    border-radius: 0;
    background: #ffffff;
}

/* Splitter */
:deep(.p-splitter) {
    border: none;
    height: 100%;
    display: flex;
}

:deep(.p-splitter-gutter) {
    background: #e2e8f0;
    transition: background 0.2s ease;
}

:deep(.p-splitter-gutter:hover) {
    background: #3b82f6;
}

:deep(.p-splitter-gutter-handle) {
    background: transparent;
}

:deep(.p-splitter-panel) {
    background: transparent;
    height: 100% !important;
    overflow: hidden;
}

:deep(.p-splitter-panel-container) {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Badge */
:deep(.p-badge) {
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.025em;
}

/* Tag */
:deep(.p-tag) {
    border-radius: 8px;
    font-weight: 500;
}

/* Toast */
:deep(.p-toast) {
    max-width: 400px;
}

:deep(.p-toast-message) {
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

:deep(.p-toast-message-content) {
    padding: 1rem;
}

:deep(.p-toast-summary) {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

:deep(.p-toast-detail) {
    font-size: 0.875rem;
    line-height: 1.5;
}

/* Menu (Popup) */
:deep(.p-menu) {
    border-radius: 12px;
    border: none;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    padding: 0.5rem;
}

:deep(.p-menu-item) {
    border-radius: 8px;
    margin: 0.125rem 0;
}

:deep(.p-menu-item-link) {
    padding: 0.625rem 0.875rem;
}

:deep(.p-menu-item:hover) {
    background: #f1f5f9;
}

/* ScrollPanel */
:deep(.p-scrollpanel) {
    border: none;
}

:deep(.p-scrollpanel-bar) {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 3px;
}

:deep(.p-scrollpanel-bar:hover) {
    background: rgba(148, 163, 184, 0.5);
}

/* ==================== 通用工具类 ==================== */
.cursor-pointer {
    cursor: pointer;
}

/* 无障碍优化 */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

/* Focus visible for keyboard navigation */
:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
</style>
