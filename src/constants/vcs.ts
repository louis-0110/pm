/**
 * VCS (版本控制系统) 常量定义
 * 统一管理 Git/SVN 相关的常量，避免硬编码
 */

/**
 * VCS 类型常量
 */
export const VCS_TYPES = {
  GIT: 'git',
  SVN: 'svn',
  NONE: ''
} as const

export type VcsType = typeof VCS_TYPES[keyof typeof VCS_TYPES]

/**
 * VCS 类型显示名称
 */
export const VCS_LABELS: Record<VcsType, string> = {
  [VCS_TYPES.GIT]: 'Git',
  [VCS_TYPES.SVN]: 'SVN',
  [VCS_TYPES.NONE]: '未知'
}

/**
 * VCS 类型图标 (PrimeIcons 类名)
 */
export const VCS_ICONS: Record<VcsType, string> = {
  [VCS_TYPES.GIT]: 'pi-github',
  [VCS_TYPES.SVN]: 'pi-code-branch',
  [VCS_TYPES.NONE]: 'pi-question'
}

/**
 * VCS 类型颜色 (PrimeVue Tag severity)
 */
export const VCS_COLORS: Record<VcsType, string> = {
  [VCS_TYPES.GIT]: 'info',
  [VCS_TYPES.SVN]: 'warning',
  [VCS_TYPES.NONE]: 'secondary'
}

/**
 * VCS 类型检测规则
 */
export const VCS_PATTERNS = {
  GIT: ['.git', 'git@', 'github.com', 'gitlab.com', 'bitbucket.org'],
  SVN: ['svn://', '.svn', '/svn/']
} as const

/**
 * 检测 URL 的 VCS 类型
 */
export function detectVcsFromUrl(url: string): VcsType {
  if (!url) return VCS_TYPES.NONE

  const lowerUrl = url.toLowerCase()

  if (VCS_PATTERNS.GIT.some(pattern => lowerUrl.includes(pattern))) {
    return VCS_TYPES.GIT
  }

  if (VCS_PATTERNS.SVN.some(pattern => lowerUrl.includes(pattern))) {
    return VCS_TYPES.SVN
  }

  return VCS_TYPES.NONE
}

/**
 * 判断是否为 Git 仓库
 */
export function isGit(vcs: VcsType): boolean {
  return vcs === VCS_TYPES.GIT
}

/**
 * 判断是否为 SVN 仓库
 */
export function isSvn(vcs: VcsType): boolean {
  return vcs === VCS_TYPES.SVN
}

/**
 * 获取 VCS 类型显示名称
 */
export function getVcsLabel(vcs: VcsType): string {
  return VCS_LABELS[vcs] || VCS_LABELS[VCS_TYPES.NONE]
}

/**
 * 获取 VCS 类型图标
 */
export function getVcsIcon(vcs: VcsType): string {
  return VCS_ICONS[vcs] || VCS_ICONS[VCS_TYPES.NONE]
}

/**
 * 获取 VCS 类型颜色
 */
export function getVcsColor(vcs: VcsType): string {
  return VCS_COLORS[vcs] || VCS_COLORS[VCS_TYPES.NONE]
}
