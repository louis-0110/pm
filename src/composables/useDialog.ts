/**
 * 对话框管理 Composable
 * 统一管理对话框的打开/关闭状态，防止重复打开
 */

import { ref, nextTick, type Ref } from 'vue'

export interface DialogOptions {
  title?: string
  width?: string
  closable?: boolean
  dismissableMask?: boolean
  closeOnEscape?: boolean
}

export interface UseDialogReturn {
  visible: Ref<boolean>
  isOpening: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * 对话框管理 Composable
 * 解决对话框重复打开的问题
 */
export function useDialog(options: DialogOptions = {}): UseDialogReturn {
  const visible = ref(false)
  let isOpening = false

  /**
   * 打开对话框
   * 使用标志位防止重复打开
   */
  const open = () => {
    // 防止重复打开
    if (isOpening) return

    isOpening = true

    // 使用 nextTick 确保数据更新后再打开
    nextTick(() => {
      visible.value = true
      isOpening = false
    })
  }

  /**
   * 关闭对话框
   */
  const close = () => {
    visible.value = false
  }

  /**
   * 切换对话框状态
   */
  const toggle = () => {
    if (visible.value) {
      close()
    } else {
      open()
    }
  }

  return {
    visible,
    isOpening,
    open,
    close,
    toggle
  }
}

/**
 * 表单对话框 Composable
 * 扩展 useDialog，添加表单相关功能
 */
export function useFormDialog<T = any>(options: DialogOptions = {}) {
  const dialog = useDialog(options)
  const formData = ref<T>({} as T)
  const submitted = ref(false)

  /**
   * 打开对话框并设置表单数据
   */
  const openWithData = (data: T) => {
    formData.value = { ...data }
    submitted.value = false
    dialog.open()
  }

  /**
   * 打开对话框并重置表单
   */
  const openWithReset = (defaultData: T) => {
    formData.value = { ...defaultData }
    submitted.value = false
    dialog.open()
  }

  /**
   * 关闭对话框并重置表单
   */
  const closeAndReset = () => {
    dialog.close()
    nextTick(() => {
      formData.value = {} as T
      submitted.value = false
    })
  }

  /**
   * 标记表单已提交
   */
  const markSubmitted = () => {
    submitted.value = true
  }

  /**
   * 重置提交状态
   */
  const resetSubmitted = () => {
    submitted.value = false
  }

  return {
    ...dialog,
    formData,
    submitted,
    openWithData,
    openWithReset,
    closeAndReset,
    markSubmitted,
    resetSubmitted
  }
}
