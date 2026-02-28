/**
 * 项目数据仓库
 * 封装所有项目相关的数据库操作
 */

import { BaseRepository } from './BaseRepository'
import { TABLES } from '../schema'
import type { Project } from '@/types'

/**
 * 项目数据仓库
 * 提供项目 CRUD 操作和统计功能
 */
export class ProjectRepository extends BaseRepository {
  /**
   * 获取所有项目
   */
  async findAll(): Promise<Project[]> {
    return this.select<Project>(`SELECT * FROM ${TABLES.PROJECTS} ORDER BY updated_at DESC`)
  }

  /**
   * 根据ID查找项目
   */
  async findById(id: number | string): Promise<Project | null> {
    return this.findOne<Project>(
      `SELECT * FROM ${TABLES.PROJECTS} WHERE id = $1`,
      [id]
    )
  }

  /**
   * 根据名称查找项目
   */
  async findByName(name: string): Promise<Project | null> {
    return this.findOne<Project>(
      `SELECT * FROM ${TABLES.PROJECTS} WHERE name = $1`,
      [name]
    )
  }

  /**
   * 搜索项目（按名称模糊匹配）
   */
  async search(keyword: string): Promise<Project[]> {
    return this.select<Project>(
      `SELECT * FROM ${TABLES.PROJECTS} WHERE name LIKE $1 ORDER BY updated_at DESC`,
      [`%${keyword}%`]
    )
  }

  /**
   * 创建项目
   */
  async create(name: string, description: string = ''): Promise<Project | null> {
    const result = await this.insert(TABLES.PROJECTS, { name, description })

    if (result.rowsAffected > 0) {
      return this.findById(result.lastInsertId)
    }
    return null
  }

  /**
   * 更新项目
   */
  async update(id: number, data: { name?: string; description?: string }): Promise<boolean> {
    const result = await this.update(TABLES.PROJECTS, id, data)
    return result.rowsAffected > 0
  }

  /**
   * 删除项目（级联删除关联仓库）
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.delete(TABLES.PROJECTS, id)
    return result.rowsAffected > 0
  }

  /**
   * 获取项目统计信息
   */
  async getStats(): Promise<{ total: number }> {
    const count = await this.count(TABLES.PROJECTS)
    return { total: count }
  }

  /**
   * 检查项目名称是否存在
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    if (excludeId) {
      const result = await this.select<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${TABLES.PROJECTS}
         WHERE name = $1 AND id != $2`,
        [name, excludeId]
      )
      return (result[0]?.count || 0) > 0
    }
    return this.exists(TABLES.PROJECTS, 'name', name)
  }

  /**
   * 更新项目时间戳
   */
  async touch(id: number): Promise<boolean> {
    const result = await this.execute(
      `UPDATE ${TABLES.PROJECTS} SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime') WHERE id = $1`,
      [id]
    )
    return result.rowsAffected > 0
  }
}
