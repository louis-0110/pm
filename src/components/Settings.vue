<template>
    <div class="settings-page">
        <!-- 头部 -->
        <div class="settings-header">
            <div class="header-content">
                <Button
                    icon="pi pi-arrow-left"
                    text
                    severity="secondary"
                    @click="goBack"
                    class="back-button"
                />
                <div class="header-title">
                    <h1>设置</h1>
                    <p>配置应用偏好和 Git 选项</p>
                </div>
            </div>
            <Button
                label="保存"
                icon="pi pi-check"
                severity="primary"
                @click="saveSettings"
                :loading="saving"
                class="save-button"
            />
        </div>

        <!-- Git 设置 -->
        <div class="settings-section">
            <div class="section-header">
                <div class="section-icon">
                    <i class="pi pi-code-branch"></i>
                </div>
                <div class="section-info">
                    <h2>Git 设置</h2>
                    <p>配置 Git 相关选项</p>
                </div>
            </div>

            <div class="settings-grid">
                <Card class="setting-card">
                    <template #content>
                        <div class="setting-item">
                            <div class="setting-label">
                                <i class="pi pi-globe"></i>
                                <div>
                                    <div class="label-text">默认远程名称</div>
                                    <div class="label-desc">Git 操作的默认远程仓库</div>
                                </div>
                            </div>
                            <InputText
                                v-model="config.git.default_remote"
                                placeholder="origin"
                                class="setting-input"
                            />
                        </div>
                    </template>
                </Card>

                <Card class="setting-card">
                    <template #content>
                        <div class="setting-item">
                            <div class="setting-label">
                                <i class="pi pi-key"></i>
                                <div>
                                    <div class="label-text">SSH 密钥路径</div>
                                    <div class="label-desc">可选，留空使用 SSH Agent</div>
                                </div>
                            </div>
                            <InputText
                                v-model="config.git.ssh_key_path"
                                placeholder="~/.ssh/id_rsa"
                                class="setting-input"
                            />
                        </div>
                    </template>
                </Card>

                <Card class="setting-card">
                    <template #content>
                        <div class="setting-item">
                            <div class="setting-label">
                                <i class="pi pi-refresh"></i>
                                <div>
                                    <div class="label-text">自动拉取</div>
                                    <div class="label-desc">打开项目时自动拉取</div>
                                </div>
                            </div>
                            <InputSwitch v-model="config.git.auto_fetch" />
                        </div>
                    </template>
                </Card>

                <Card class="setting-card">
                    <template #content>
                        <div class="setting-item">
                            <div class="setting-label">
                                <i class="pi pi-upload"></i>
                                <div>
                                    <div class="label-text">自动推送</div>
                                    <div class="label-desc">提交后自动推送</div>
                                </div>
                            </div>
                            <InputSwitch v-model="config.git.auto_push" />
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- 编辑器设置 -->
        <div class="settings-section">
            <div class="section-header">
                <div class="section-icon editor">
                    <i class="pi pi-file-edit"></i>
                </div>
                <div class="section-info">
                    <h2>编辑器设置</h2>
                    <p>配置外部编辑器路径</p>
                </div>
            </div>

            <div class="settings-grid">
                <Card class="setting-card">
                    <template #content>
                        <div class="setting-item">
                            <div class="setting-label">
                                <i class="pi pi-code"></i>
                                <div>
                                    <div class="label-text">VSCode 路径</div>
                                    <div class="label-desc">可选，留空使用系统默认</div>
                                </div>
                            </div>
                            <div class="path-input-group">
                                <InputText
                                    v-model="config.editor.vscode_path"
                                    placeholder="C:\\Program Files\\Microsoft VS Code\\Code.exe"
                                    class="setting-input"
                                />
                                <Button
                                    icon="pi pi-folder-open"
                                    text
                                    severity="secondary"
                                    @click="selectVscodePath"
                                    v-tooltip.top="'选择文件'"
                                />
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="setting-card">
                    <template #content>
                        <div class="setting-item">
                            <div class="setting-label">
                                <i class="pi pi-pencil"></i>
                                <div>
                                    <div class="label-text">默认编辑器</div>
                                    <div class="label-desc">命令行编辑器名称</div>
                                </div>
                            </div>
                            <InputText
                                v-model="config.editor.default_editor"
                                placeholder="code"
                                class="setting-input"
                            />
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- 配置文件位置 -->
        <div class="config-info">
            <Card>
                <template #content>
                    <div class="info-content">
                        <i class="pi pi-info-circle"></i>
                        <div class="info-text">
                            <div class="info-title">配置文件位置</div>
                            <div class="info-desc">{{ configPath }}</div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { open } from '@tauri-apps/plugin-dialog'
import { configApi } from '@/api'
import type { GitConfig, EditorConfig } from '@/types'

const router = useRouter()
const toast = useToast()

// 使用部分配置（仅显示 Git 和 Editor）
interface SettingsConfig {
    git: GitConfig
    editor: EditorConfig
}

const config = ref<SettingsConfig>({
    git: {
        default_remote: 'origin',
        ssh_key_path: null,
        auto_fetch: false,
        auto_push: false
    },
    editor: {
        vscode_path: null,
        default_editor: 'code'
    }
})

const saving = ref(false)
const configPath = ref('')

// 加载配置
async function loadConfig() {
    try {
        const loadedConfig = await configApi.get()
        config.value = {
            git: loadedConfig.git,
            editor: loadedConfig.editor
        }

        // 获取配置文件路径
        const homeDir = await configApi.getHomeDir()
        configPath.value = `${homeDir}/.pm/config.json`
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('配置加载失败:', errorMessage)
        console.error('错误详情:', error)

        toast.add({
            severity: 'error',
            summary: '加载失败',
            detail: errorMessage,
            life: 5000
        })
    }
}

// 保存配置
async function saveSettings() {
    saving.value = true
    try {
        // 获取完整配置并更新
        const fullConfig = await configApi.get()
        fullConfig.git = config.value.git
        fullConfig.editor = config.value.editor

        await configApi.save(fullConfig)
        toast.add({
            severity: 'success',
            summary: '保存成功',
            detail: '配置已保存',
            life: 3000
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('配置保存失败:', errorMessage)
        console.error('错误详情:', error)

        toast.add({
            severity: 'error',
            summary: '保存失败',
            detail: errorMessage,
            life: 5000
        })
    } finally {
        saving.value = false
    }
}

// 选择 VSCode 路径
async function selectVscodePath() {
    try {
        const result = await open({
            multiple: false,
            filters: [{
                name: 'Executable',
                extensions: ['exe']
            }]
        })

        if (result) {
            config.value.editor.vscode_path = result
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: '选择失败',
            detail: error as string,
            life: 3000
        })
    }
}

// 返回
function goBack() {
    router.back()
}

onMounted(() => {
    loadConfig()
})
</script>

<style scoped>
.settings-page {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: #f8fafc;
    box-sizing: border-box;
}

/* ==================== 头部 ==================== */
.settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.back-button :deep(.p-button-icon) {
    font-size: 1.25rem;
}

.header-title h1 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
}

.header-title p {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
}

/* ==================== 设置区域 ==================== */
.settings-section {
    margin-bottom: 2rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.section-icon {
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

.section-icon.editor {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #d97706;
}

.section-info h2 {
    margin: 0 0 0.25rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
}

.section-info p {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
}

/* ==================== 设置网格 ==================== */
.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
}

.setting-card {
    border: 1px solid #f1f5f9;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.setting-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.setting-label i {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border-radius: 8px;
    color: #64748b;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.label-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 0.125rem;
}

.label-desc {
    font-size: 0.75rem;
    color: #64748b;
}

.setting-input {
    width: 200px;
}

.path-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    max-width: 400px;
}

.path-input-group :deep(.p-inputtext) {
    flex: 1;
}

/* ==================== 配置信息 ==================== */
.config-info {
    margin-top: 2rem;
}

.info-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.info-content i {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dbeafe;
    border-radius: 10px;
    color: #2563eb;
    font-size: 1.25rem;
}

.info-text {
    flex: 1;
}

.info-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 0.25rem;
}

.info-desc {
    font-size: 0.8125rem;
    color: #64748b;
    font-family: 'Consolas', 'Monaco', monospace;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
    .settings-header {
        flex-wrap: wrap;
        gap: 1rem;
    }

    .header-title h1 {
        font-size: 1.25rem;
    }

    .settings-grid {
        grid-template-columns: 1fr;
    }

    .setting-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
    }

    .setting-input {
        width: 100%;
    }

    .path-input-group {
        max-width: 100%;
    }
}

/* 添加焦点可见性增强 */
.setting-input :deep(.p-inputtext:focus) {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* 开关样式优化 */
.setting-item :deep(.p-inputswitch) {
    width: 2.75rem;
    height: 1.5rem;
}

.setting-item :deep(.p-inputswitch-slider) {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
