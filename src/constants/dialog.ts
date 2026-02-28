/**
 * 对话框配置常量
 * 统一管理对话框的尺寸、属性等配置
 */

/**
 * 对话框尺寸配置
 */
export const DIALOG_SIZES = {
  SMALL: '450px',
  MEDIUM: '550px',
  LARGE: '800px',
  EXTRA_LARGE: '1000px'
} as const

export type DialogSize = typeof DIALOG_SIZES[keyof typeof DIALOG_SIZES]

/**
 * 对话框通用属性
 */
export const DIALOG_PROPS = {
  dismissableMask: true,
  closeOnEscape: true,
  modal: true
} as const

/**
 * 表单对话框配置
 */
export const FORM_DIALOG_CONFIG = {
  width: DIALOG_SIZES.MEDIUM,
  ...DIALOG_PROPS
} as const

/**
 * 确认对话框配置
 */
export const CONFIRM_DIALOG_CONFIG = {
  width: DIALOG_SIZES.SMALL,
  ...DIALOG_PROPS
} as const

/**
 * 大型对话框配置 (用于 Diff 等)
 */
export const LARGE_DIALOG_CONFIG = {
  width: DIALOG_SIZES.LARGE,
  ...DIALOG_PROPS
} as const
