import { invoke } from '@tauri-apps/api/core'

export const systemApi = {
    /**
     * 打开文件夹
     */
    async openFolder(path: string): Promise<void> {
        return invoke('open_folder', { path })
    },

    /**
     * 打开终端
     */
    async openTerminal(path: string): Promise<void> {
        return invoke('open_terminal', { path })
    },
}
