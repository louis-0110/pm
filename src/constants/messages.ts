/**
 * 通用消息文本常量
 * 统一管理 Toast 消息、错误提示等文本
 */

/**
 * Toast 生命周期配置 (毫秒)
 */
export const TOAST_LIFE = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000
} as const

/**
 * 通用消息文本
 */
export const MESSAGES = {
  // 成功消息
  SUCCESS: {
    CREATE: '创建成功',
    UPDATE: '更新成功',
    DELETE: '删除成功',
    SAVE: '保存成功',
    COPY: '复制成功',
    OPEN: '打开成功'
  },

  // 错误消息
  ERROR: {
    CREATE: '创建失败',
    UPDATE: '更新失败',
    DELETE: '删除失败',
    SAVE: '保存失败',
    COPY: '复制失败',
    OPEN: '打开失败',
    LOAD: '加载失败',
    NETWORK: '网络错误，请稍后重试',
    UNKNOWN: '未知错误'
  },

  // 项目相关
  PROJECT: {
    CREATED: (name: string) => `项目 "${name}" 已创建`,
    DELETED: (name: string) => `项目 "${name}" 已删除`,
    UPDATED: (name: string) => `项目 "${name}" 已更新`,
    NAME_EXISTS: '项目名称已存在',
    NOT_FOUND: '项目不存在',
    NAME_REQUIRED: '请输入项目名称'
  },

  // 仓库相关
  REPOSITORY: {
    ADDED: '仓库已添加',
    DELETED: '仓库已删除',
    UPDATED: '仓库已更新',
    NAME_REQUIRED: '请输入仓库名称',
    PATH_REQUIRED: '请选择仓库目录',
    PATH_EXISTS: '该路径已被添加',
    URL_REQUIRED: '请输入仓库 URL',
    PULL_SUCCESS: '拉取成功',
    PUSH_SUCCESS: '推送成功',
    COMMIT_SUCCESS: '提交成功',
    UPDATE_SUCCESS: '更新成功',
    DIFF_SUCCESS: '获取差异成功',
    SVN_NO_PUSH: 'SVN 仓库不支持推送操作',
    CLONING: '正在克隆仓库，请稍候...',
    CLONE_SUCCESS: '克隆成功',
    CLONE_FAILED: '克隆失败'
  },

  // 表单验证
  VALIDATION: {
    REQUIRED: '此字段为必填项',
    INVALID_FORMAT: '格式不正确',
    TOO_SHORT: '长度过短',
    TOO_LONG: '长度过长'
  },

  // 操作提示
  HINT: {
    CLONING: '正在克隆仓库，请稍候...',
    BATCH_PULL: '正在批量拉取...',
    BATCH_PUSH: '正在批量推送...',
    CONFIRM_DELETE: '确定要删除吗？此操作不可恢复',
    CONFIRM_DELETE_PROJECT: (name: string) =>
      `确定要删除项目 "${name}" 吗？这将同时删除该项目下的所有仓库记录，此操作不可撤销。`,
    CONFIRM_DELETE_REPOSITORY: (name: string) =>
      `确定要删除仓库 "${name}" 吗？此操作不可撤销。`
  },

  // 终端/编辑器
  TERMINAL: {
    OPEN_SUCCESS: '终端已启动',
    OPEN_FAILED: '打开终端失败'
  },

  VSCODE: {
    OPEN_SUCCESS: 'VSCode 已启动',
    OPEN_FAILED: '打开 VSCode 失败'
  },

  // 剪贴板
  CLIPBOARD: {
    COPY_SUCCESS: '路径已复制到剪贴板',
    COPY_FAILED: '复制失败'
  },

  // 加载状态
  LOADING: {
    PROJECTS: '加载项目列表...',
    REPOSITORIES: '加载仓库列表...',
    STATUS: '刷新状态...'
  }
} as const

/**
 * 获取项目创建成功消息
 */
export function getProjectCreatedMessage(name: string): string {
  return MESSAGES.PROJECT.CREATED(name)
}

/**
 * 获取项目删除成功消息
 */
export function getProjectDeletedMessage(name: string): string {
  return MESSAGES.PROJECT.DELETED(name)
}

/**
 * 获取项目更新成功消息
 */
export function getProjectUpdatedMessage(name: string): string {
  return MESSAGES.PROJECT.UPDATED(name)
}

/**
 * 获取确认删除项目消息
 */
export function getConfirmDeleteProjectMessage(name: string): string {
  return MESSAGES.HINT.CONFIRM_DELETE_PROJECT(name)
}

/**
 * 获取确认删除仓库消息
 */
export function getConfirmDeleteRepositoryMessage(name: string): string {
  return MESSAGES.HINT.CONFIRM_DELETE_REPOSITORY(name)
}
