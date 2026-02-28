/**
 * 仓库业务逻辑 Composable
 * 封装仓库相关的业务逻辑
 */

import { ref } from 'vue'
import { useToast } from './useToast'
import { useVcs } from './useVcs'
import { eventBus, Events } from '@/utils/eventBus'
import { MESSAGES } from '@/constants/messages'
import type { Repository, GitStatus, SvnStatus } from '@/types'
import type { DatabaseInstance } from './useDatabase'

let dbCache: DatabaseInstance | null = null

/**
 * 获取数据库实例（缓存）
 */
async function getDb(): Promise<DatabaseInstance> {
  if (!dbCache) {
    const { useDatabase } = await import('./useDatabase')
    dbCache = await useDatabase()
  }
  return dbCache
}

/**
 * 仓库业务逻辑 Composable
 */
export function useRepository() {
  const toast = useToast()
  const vcs = useVcs()

  const repositories = ref<Repository[]>([])
  const loading = ref(false)

  /**
   * 加载项目的所有仓库
   */
  const loadRepositories = async (projectId: number) => {
    loading.value = true
    try {
      const db = await getDb()
      repositories.value = await db.repository.findByProjectId(projectId)
    } catch (error) {
      toast.operationFailed('加载仓库', error as string)
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加仓库（本地路径）
   */
  const addRepository = async (data: {
    name: string
    path: string
    vcs: 'git' | 'svn' | ''
    project_id: number
  }): Promise<boolean> => {
    try {
      const db = await getDb()
      // 检查路径是否存在
      const exists = await db.repository.pathExists(data.path)
      if (exists) {
        toast.showWarning('添加失败', MESSAGES.REPOSITORY.PATH_EXISTS)
        return false
      }

      const repository = await db.repository.create(data)
      if (repository) {
        toast.showSuccess(MESSAGES.SUCCESS.CREATE, MESSAGES.REPOSITORY.ADDED)
        eventBus.emit(Events.REPOSITORY_ADDED, repository)
        await loadRepositories(data.project_id)
        return true
      }
      return false
    } catch (error) {
      toast.operationFailed('添加仓库', error as string)
      return false
    }
  }

  /**
   * 克隆仓库
   */
  const cloneRepository = async (data: {
    name: string
    url: string
    path: string
    vcs: 'git' | 'svn' | ''
    project_id: number
  }): Promise<boolean> => {
    try {
      toast.showInfo('提示', MESSAGES.REPOSITORY.CLONING)

      const result = await vcs.clone(data.vcs, data.url, data.path)

      // 克隆成功后添加到数据库
      const db = await getDb()
      const repository = await db.repository.create(data)
      if (repository) {
        toast.showSuccess(MESSAGES.REPOSITORY.CLONE_SUCCESS, result)
        eventBus.emit(Events.REPOSITORY_ADDED, repository)
        await loadRepositories(data.project_id)
        return true
      }
      return false
    } catch (error) {
      toast.operationFailed(MESSAGES.REPOSITORY.CLONE_FAILED, error as string)
      return false
    }
  }

  /**
   * 删除仓库
   */
  const deleteRepository = async (repository: Repository): Promise<boolean> => {
    try {
      const db = await getDb()
      const success = await db.repository.delete(repository.id)
      if (success) {
        toast.showSuccess(MESSAGES.SUCCESS.DELETE, MESSAGES.REPOSITORY.DELETED)
        eventBus.emit(Events.REPOSITORY_DELETED, repository)
        await loadRepositories(repository.project_id)
        return true
      }
      return false
    } catch (error) {
      toast.operationFailed('删除仓库', error as string)
      return false
    }
  }

  /**
   * 更新仓库名称
   */
  const updateRepositoryName = async (id: number, name: string): Promise<boolean> => {
    try {
      const db = await getDb()
      const success = await db.repository.updateName(id, name)
      if (success) {
        toast.showSuccess(MESSAGES.SUCCESS.UPDATE, MESSAGES.REPOSITORY.UPDATED)
        eventBus.emit(Events.REPOSITORY_UPDATED, { id, name })
        return true
      }
      return false
    } catch (error) {
      toast.operationFailed('更新仓库名称', error as string)
      return false
    }
  }

  /**
   * 批量拉取
   */
  const batchPull = async (repos: Repository[]): Promise<Array<{ name: string; success: boolean; message?: string }>> => {
    const results: Array<{ name: string; success: boolean; message?: string }> = []

    for (const repo of repos) {
      try {
        const message = await vcs.pull(repo.vcs, repo.path)
        results.push({ name: repo.name, success: true, message })

        // 通知刷新状态
        eventBus.emit(Events.REFRESH_REPOSITORY_STATUS, repo.id)
      } catch (error) {
        results.push({ name: repo.name, success: false, message: error as string })
      }
    }

    return results
  }

  /**
   * 批量推送（仅 Git）
   */
  const batchPush = async (repos: Repository[]): Promise<Array<{ name: string; success: boolean; message?: string }>> => {
    const gitRepos = repos.filter(r => r.vcs === 'git')
    const results: Array<{ name: string; success: boolean; message?: string }> = []

    for (const repo of gitRepos) {
      try {
        const message = await vcs.push(repo.vcs, repo.path)
        results.push({ name: repo.name, success: true, message })

        // 通知刷新状态
        eventBus.emit(Events.REFRESH_REPOSITORY_STATUS, repo.id)
      } catch (error) {
        results.push({ name: repo.name, success: false, message: error as string })
      }
    }

    return results
  }

  /**
   * 获取仓库状态
   */
  const getRepositoryStatus = async (repository: Repository): Promise<GitStatus | SvnStatus | null> => {
    return vcs.getStatus(repository.vcs, repository.path)
  }

  return {
    repositories,
    loading,
    loadRepositories,
    addRepository,
    cloneRepository,
    deleteRepository,
    updateRepositoryName,
    batchPull,
    batchPush,
    getRepositoryStatus
  }
}
