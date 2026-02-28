/**
 * 项目业务逻辑 Composable
 * 封装项目相关的业务逻辑
 */

import { ref, computed } from 'vue'
import { useToast } from './useToast'
import { eventBus, Events } from '@/utils/eventBus'
import { debounce } from '@/utils'
import { MESSAGES } from '@/constants/messages'
import type { Project } from '@/types'
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
 * 项目业务逻辑 Composable
 */
export function useProject() {
  const toast = useToast()

  const projects = ref<Project[]>([])
  const loading = ref(false)
  const repositoryCounts = ref<Record<number, number>>({})

  /**
   * 计算属性：项目总数
   */
  const totalProjects = computed(() => projects.value.length)

  /**
   * 加载所有项目
   */
  const loadProjects = async () => {
    loading.value = true
    try {
      const db = await getDb()
      projects.value = await db.project.findAll()

      // 加载仓库数量统计
      const counts = await db.repository.getGroupedCount()
      repositoryCounts.value = {}
      counts.forEach(c => {
        repositoryCounts.value[c.project_id] = c.count
      })
    } catch (error) {
      toast.operationFailed('加载项目', error as string)
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索项目（使用防抖）
   */
  const searchProjects = debounce(async (keyword: string) => {
    if (!keyword.trim()) {
      await loadProjects()
      return
    }

    loading.value = true
    try {
      const db = await getDb()
      projects.value = await db.project.search(keyword)

      // 重新加载仓库数量
      const counts = await db.repository.getGroupedCount()
      repositoryCounts.value = {}
      counts.forEach(c => {
        repositoryCounts.value[c.project_id] = c.count
      })
    } catch (error) {
      toast.operationFailed('搜索项目', error as string)
    } finally {
      loading.value = false
    }
  }, 300)

  /**
   * 创建项目
   */
  const createProject = async (name: string, description: string): Promise<boolean> => {
    try {
      const db = await getDb()
      // 检查名称是否已存在
      const exists = await db.project.nameExists(name)
      if (exists) {
        toast.showWarning('创建失败', MESSAGES.PROJECT.NAME_EXISTS)
        return false
      }

      const project = await db.project.create(name, description)
      if (project) {
        toast.createSuccess(name)
        eventBus.emit(Events.PROJECT_CREATED, project)
        await loadProjects()
        return true
      }
      return false
    } catch (error) {
      toast.operationFailed('创建项目', error as string)
      return false
    }
  }

  /**
   * 删除项目
   */
  const deleteProject = async (project: Project): Promise<boolean> => {
    try {
      const db = await getDb()
      // 先删除关联的仓库记录
      await db.repository.deleteByProjectId(project.id)
      // 再删除项目
      const success = await db.project.delete(project.id)

      if (success) {
        toast.deleteSuccess(project.name)
        eventBus.emit(Events.PROJECT_DELETED, project)
        await loadProjects()
        return true
      }
      return false
    } catch (error) {
      toast.operationFailed('删除项目', error as string)
      return false
    }
  }

  /**
   * 获取项目的仓库数量
   */
  const getRepositoryCount = (projectId: number): number => {
    return repositoryCounts.value[projectId] || 0
  }

  return {
    projects,
    loading,
    repositoryCounts,
    totalProjects,
    loadProjects,
    searchProjects,
    createProject,
    deleteProject,
    getRepositoryCount
  }
}
