/**
 * 仓库数据仓库
 * 封装所有仓库相关的数据库操作
 */

import { BaseRepository } from './BaseRepository'
import { TABLES } from '../schema'
import type { Repository } from '@/types'

/**
 * 仓库数据仓库
 * 提供仓库 CRUD 操作和统计功能
 */
export class RepositoryRepository extends BaseRepository {
  /**
   * 根据项目ID获取所有仓库
   */
  async findByProjectId(projectId: number | string): Promise<Repository[]> {
    return this.select<Repository>(
      `SELECT * FROM ${TABLES.REPOSITORIES} WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId]
    )
  }

  /**
   * 根据ID查找仓库
   */
  async findById(id: number | string): Promise<Repository | null> {
    return this.findOne<Repository>(
      `SELECT * FROM ${TABLES.REPOSITORIES} WHERE id = $1`,
      [id]
    )
  }

  /**
   * 根据路径查找仓库
   */
  async findByPath(path: string): Promise<Repository | null> {
    return this.findOne<Repository>(
      `SELECT * FROM ${TABLES.REPOSITORIES} WHERE path = $1`,
      [path]
    )
  }

  /**
   * 创建仓库
   */
  async create(data: {
    name: string
    path: string
    url?: string
    vcs: 'git' | 'svn' | ''
    project_id: number
  }): Promise<Repository | null> {
    const result = await this.insert(TABLES.REPOSITORIES, data)

    if (result.rowsAffected > 0) {
      return this.findById(result.lastInsertId)
    }
    return null
  }

  /**
   * 更新仓库名称
   */
  async updateName(id: number, name: string): Promise<boolean> {
    const result = await this.update(TABLES.REPOSITORIES, id, { name })
    return result.rowsAffected > 0
  }

  /**
   * 更新仓库路径
   */
  async updatePath(id: number, path: string): Promise<boolean> {
    const result = await this.update(TABLES.REPOSITORIES, id, { path })
    return result.rowsAffected > 0
  }

  /**
   * 更新仓库 URL
   */
  async updateUrl(id: number, url: string): Promise<boolean> {
    const result = await this.update(TABLES.REPOSITORIES, id, { url })
    return result.rowsAffected > 0
  }

  /**
   * 更新仓库 VCS 类型
   */
  async updateVcs(id: number, vcs: 'git' | 'svn' | ''): Promise<boolean> {
    const result = await this.update(TABLES.REPOSITORIES, id, { vcs })
    return result.rowsAffected > 0
  }

  /**
   * 删除仓库
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.delete(TABLES.REPOSITORIES, id)
    return result.rowsAffected > 0
  }

  /**
   * 批量删除项目下的所有仓库
   */
  async deleteByProjectId(projectId: number): Promise<number> {
    const result = await this.execute(
      `DELETE FROM ${TABLES.REPOSITORIES} WHERE project_id = $1`,
      [projectId]
    )
    return result.rowsAffected
  }

  /**
   * 获取项目下的仓库数量
   */
  async countByProjectId(projectId: number): Promise<number> {
    return this.count(TABLES.REPOSITORIES, 'project_id = $1', [projectId])
  }

  /**
   * 获取所有项目的仓库数量统计
   */
  async getGroupedCount(): Promise<Array<{ project_id: number; count: number }>> {
    return this.select(
      `SELECT project_id, COUNT(*) as count
       FROM ${TABLES.REPOSITORIES}
       GROUP BY project_id`
    )
  }

  /**
   * 检查路径是否存在
   */
  async pathExists(path: string, excludeId?: number): Promise<boolean> {
    if (excludeId) {
      const result = await this.select<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${TABLES.REPOSITORIES}
         WHERE path = $1 AND id != $2`,
        [path, excludeId]
      )
      return (result[0]?.count || 0) > 0
    }
    return this.exists(TABLES.REPOSITORIES, 'path', path)
  }
}
