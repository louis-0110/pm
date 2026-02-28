/**
 * 数据库操作 Composable
 * 提供统一的数据访问接口
 */

import { getRepositories } from '@/db'
import type { Project, Repository } from '@/types'

/**
 * 数据库操作 Composable
 * 封装数据访问层，提供类型安全的操作接口
 */
export async function useDatabase() {
  const repos = await getRepositories()

  return {
    /**
     * 项目相关操作
     */
    project: {
      /** 获取所有项目 */
      findAll: () => repos.project.findAll(),

      /** 根据 ID 查找项目 */
      findById: (id: number | string) => repos.project.findById(id),

      /** 根据名称查找项目 */
      findByName: (name: string) => repos.project.findByName(name),

      /** 搜索项目 */
      search: (keyword: string) => repos.project.search(keyword),

      /** 创建项目 */
      create: (name: string, description?: string) =>
        repos.project.create(name, description || ''),

      /** 更新项目 */
      update: (id: number, data: { name?: string; description?: string }) =>
        repos.project.update(id, data),

      /** 删除项目 */
      delete: (id: number) => repos.project.delete(id),

      /** 获取项目统计 */
      getStats: () => repos.project.getStats(),

      /** 检查项目名称是否存在 */
      nameExists: (name: string, excludeId?: number) =>
        repos.project.nameExists(name, excludeId),

      /** 更新项目时间戳 */
      touch: (id: number) => repos.project.touch(id)
    },

    /**
     * 仓库相关操作
     */
    repository: {
      /** 根据项目 ID 获取所有仓库 */
      findByProjectId: (projectId: number | string) =>
        repos.repository.findByProjectId(projectId),

      /** 根据 ID 查找仓库 */
      findById: (id: number | string) => repos.repository.findById(id),

      /** 根据路径查找仓库 */
      findByPath: (path: string) => repos.repository.findByPath(path),

      /** 创建仓库 */
      create: (data: {
        name: string
        path: string
        url?: string
        vcs: 'git' | 'svn' | ''
        project_id: number
      }) => repos.repository.create(data),

      /** 更新仓库名称 */
      updateName: (id: number, name: string) =>
        repos.repository.updateName(id, name),

      /** 更新仓库路径 */
      updatePath: (id: number, path: string) =>
        repos.repository.updatePath(id, path),

      /** 更新仓库 URL */
      updateUrl: (id: number, url: string) =>
        repos.repository.updateUrl(id, url),

      /** 更新仓库 VCS 类型 */
      updateVcs: (id: number, vcs: 'git' | 'svn' | '') =>
        repos.repository.updateVcs(id, vcs),

      /** 删除仓库 */
      delete: (id: number) => repos.repository.delete(id),

      /** 批量删除项目下的所有仓库 */
      deleteByProjectId: (projectId: number) =>
        repos.repository.deleteByProjectId(projectId),

      /** 获取项目下的仓库数量 */
      countByProjectId: (projectId: number) =>
        repos.repository.countByProjectId(projectId),

      /** 获取所有项目的仓库数量统计 */
      getGroupedCount: () => repos.repository.getGroupedCount(),

      /** 检查路径是否存在 */
      pathExists: (path: string, excludeId?: number) =>
        repos.repository.pathExists(path, excludeId)
    }
  }
}

/**
 * 数据库操作实例的类型
 */
export type DatabaseInstance = Awaited<ReturnType<typeof useDatabase>>
