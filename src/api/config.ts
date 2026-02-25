import { invoke } from '@tauri-apps/api/core'
import type { AppConfig } from '@/types'

export interface SystemInfo {
    os: 'windows' | 'macos' | 'linux' | string
    arch: string
    homeDir: string
    configDir: string
    vscodeDefaultPath: string
    sshDefaultPath: string
}

export const configApi = {
    /**
     * 获取配置
     */
    async get(): Promise<AppConfig> {
        return invoke<AppConfig>('get_config')
    },

    /**
     * 保存配置
     */
    async save(config: AppConfig): Promise<void> {
        return invoke('save_config', { config })
    },

    /**
     * 获取用户目录
     */
    async getHomeDir(): Promise<string> {
        return invoke<string>('get_home_dir')
    },

    /**
     * 获取系统信息
     */
    async getSystemInfo(): Promise<SystemInfo> {
        return invoke<SystemInfo>('get_system_info')
    },
}
