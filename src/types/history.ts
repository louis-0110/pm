/**
 * 操作历史类型
 */
export type OperationType =
    | 'git_pull'
    | 'git_push'
    | 'git_commit'
    | 'git_diff'
    | 'svn_update'
    | 'svn_commit'
    | 'svn_diff'
    | 'batch_pull'
    | 'batch_push'

export type OperationStatus = 'success' | 'error' | 'pending'

export interface OperationHistory {
    id: string
    type: OperationType
    status: OperationStatus
    repositoryName: string
    repositoryPath: string
    message: string
    timestamp: number
    duration?: number // 操作耗时（毫秒）
}

/**
 * 操作历史管理类
 */
class OperationHistoryManager {
    private histories: OperationHistory[] = []
    private maxHistories = 100 // 最大保存历史数量

    /**
     * 添加操作记录
     */
    add(operation: Omit<OperationHistory, 'id' | 'timestamp'>): OperationHistory {
        const history: OperationHistory = {
            ...operation,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        }

        this.histories.unshift(history)

        // 限制历史记录数量
        if (this.histories.length > this.maxHistories) {
            this.histories = this.histories.slice(0, this.maxHistories)
        }

        return history
    }

    /**
     * 获取所有历史记录
     */
    getAll(): OperationHistory[] {
        return [...this.histories]
    }

    /**
     * 获取最近的 N 条记录
     */
    getRecent(count: number = 10): OperationHistory[] {
        return this.histories.slice(0, count)
    }

    /**
     * 按仓库筛选
     */
    getByRepository(path: string): OperationHistory[] {
        return this.histories.filter(h => h.repositoryPath === path)
    }

    /**
     * 清空所有记录
     */
    clear(): void {
        this.histories = []
    }

    /**
     * 删除指定记录
     */
    remove(id: string): void {
        this.histories = this.histories.filter(h => h.id !== id)
    }
}

export const operationHistory = new OperationHistoryManager()
