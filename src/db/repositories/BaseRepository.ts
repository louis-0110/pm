/**
 * 基础数据仓库类
 * 提供通用的数据库操作方法
 */

import type { Database } from '@tauri-apps/plugin-sql'
import type { DbResult } from '@/types'

/**
 * 基础数据仓库类
 * 封装通用的数据库操作，供子类继承使用
 */
export class BaseRepository {
  constructor(protected db: Database) {}

  /**
   * 执行查询
   */
  protected async select<T>(sql: string, params?: any[]): Promise<T[]> {
    return this.db.select<T>(sql, params || [])
  }

  /**
   * 执行命令
   */
  protected async execute(sql: string, params?: any[]): Promise<DbResult> {
    return this.db.execute(sql, params || [])
  }

  /**
   * 查询单条记录
   */
  protected async findOne<T>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.select<T>(sql, params)
    return results[0] || null
  }

  /**
   * 查询记录数量
   */
  protected async count(table: string, where?: string, params?: any[]): Promise<number> {
    const sql = where
      ? `SELECT COUNT(*) as count FROM ${table} WHERE ${where}`
      : `SELECT COUNT(*) as count FROM ${table}`

    const result = await this.findOne<{ count: number }>(sql, params)
    return result?.count || 0
  }

  /**
   * 检查记录是否存在
   */
  protected async exists(table: string, column: string, value: any): Promise<boolean> {
    const sql = `SELECT 1 FROM ${table} WHERE ${column} = $1 LIMIT 1`
    const result = await this.findOne(sql, [value])
    return result !== null
  }

  /**
   * 通用插入方法
   */
  protected async insert(table: string, data: Record<string, any>): Promise<DbResult> {
    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

    const sql = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
    `

    return this.execute(sql, values)
  }

  /**
   * 通用更新方法
   */
  protected async update(
    table: string,
    id: number,
    data: Record<string, any>
  ): Promise<DbResult> {
    const columns = Object.keys(data)
    const values = Object.values(data)
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ')

    const sql = `
      UPDATE ${table}
      SET ${setClause}, updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
      WHERE id = $1
    `

    return this.execute(sql, [id, ...values])
  }

  /**
   * 通用删除方法
   */
  protected async delete(table: string, id: number): Promise<DbResult> {
    const sql = `DELETE FROM ${table} WHERE id = $1`
    return this.execute(sql, [id])
  }
}
