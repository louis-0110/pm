/**
 * Git/SVN 操作包装器 - 自动记录操作历史
 */
import { operationHistory, type OperationType } from '@/types'

export interface OperationOptions {
    type: OperationType
    repositoryName: string
    repositoryPath: string
    successMessage: string
    errorPrefix?: string
}

/**
 * 包装异步操作并记录历史
 */
export async function withOperationHistory<T>(
    operation: () => Promise<T>,
    options: OperationOptions
): Promise<T> {
    const startTime = Date.now()

    try {
        const result = await operation()
        const duration = Date.now() - startTime

        // 记录成功历史
        operationHistory.add({
            type: options.type,
            status: 'success',
            repositoryName: options.repositoryName,
            repositoryPath: options.repositoryPath,
            message: options.successMessage,
            duration
        })

        return result
    } catch (error) {
        const duration = Date.now() - startTime

        // 记录失败历史
        operationHistory.add({
            type: options.type,
            status: 'error',
            repositoryName: options.repositoryName,
            repositoryPath: options.repositoryPath,
            message: `${options.errorPrefix || '操作失败'}: ${error}`,
            duration
        })

        throw error
    }
}
