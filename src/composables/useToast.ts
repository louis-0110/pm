/**
 * Toast 消息管理 Composable
 * 统一管理 Toast 消息显示
 */

import { useToast as usePrimeToast } from 'primevue/usetoast'
import type { ToastMessageOptions } from 'primevue/usetoast'
import { MESSAGES, TOAST_LIFE, getProjectCreatedMessage, getProjectDeletedMessage, getProjectUpdatedMessage } from '@/constants/messages'

export interface ToastOptions extends Partial<ToastMessageOptions> {
  // 可以添加自定义选项
}

/**
 * Toast 消息管理 Composable
 * 提供统一的 Toast 消息显示接口
 */
export function useToast() {
  const toast = usePrimeToast()

  /**
   * 显示成功消息
   */
  const showSuccess = (summary: string, detail?: string, life: number = TOAST_LIFE.SHORT) => {
    toast.add({
      severity: 'success',
      summary,
      detail,
      life
    })
  }

  /**
   * 显示错误消息
   */
  const showError = (summary: string, detail?: string, life: number = TOAST_LIFE.MEDIUM) => {
    toast.add({
      severity: 'error',
      summary,
      detail,
      life
    })
  }

  /**
   * 显示警告消息
   */
  const showWarning = (summary: string, detail?: string, life: number = TOAST_LIFE.SHORT) => {
    toast.add({
      severity: 'warn',
      summary,
      detail,
      life
    })
  }

  /**
   * 显示信息消息
   */
  const showInfo = (summary: string, detail?: string, life: number = TOAST_LIFE.SHORT) => {
    toast.add({
      severity: 'info',
      summary,
      detail,
      life
    })
  }

  /**
   * 创建成功 - 预设消息
   */
  const createSuccess = (name: string) => {
    showSuccess(MESSAGES.SUCCESS.CREATE, getProjectCreatedMessage(name))
  }

  /**
   * 删除成功 - 预设消息
   */
  const deleteSuccess = (name: string) => {
    showSuccess(MESSAGES.SUCCESS.DELETE, getProjectDeletedMessage(name))
  }

  /**
   * 更新成功 - 预设消息
   */
  const updateSuccess = (name: string) => {
    showSuccess(MESSAGES.SUCCESS.UPDATE, getProjectUpdatedMessage(name))
  }

  /**
   * 操作失败
   */
  const operationFailed = (action: string, error?: string) => {
    showError(`${action}失败`, error || MESSAGES.ERROR.UNKNOWN)
  }

  /**
   * 验证错误
   */
  const validationError = (field: string) => {
    showWarning(MESSAGES.VALIDATION.REQUIRED, `${field}不能为空`)
  }

  /**
   * 复制成功
   */
  const copySuccess = () => {
    showSuccess(MESSAGES.SUCCESS.COPY, MESSAGES.CLIPBOARD.COPY_SUCCESS)
  }

  /**
   * 打开成功
   */
  const openSuccess = (target: string) => {
    showSuccess(MESSAGES.SUCCESS.OPEN, `${target}已启动`)
  }

  /**
   * 网络错误
   */
  const networkError = () => {
    showError(MESSAGES.ERROR.NETWORK)
  }

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    createSuccess,
    deleteSuccess,
    updateSuccess,
    operationFailed,
    validationError,
    copySuccess,
    openSuccess,
    networkError
  }
}
