/**
 * 数据库连接和数据仓库导出
 */

import Database from '@tauri-apps/plugin-sql'
import {
  TABLES,
  PROJECTS_SCHEMA,
  REPOSITORIES_SCHEMA
} from './schema'
import { ProjectRepository } from './repositories/ProjectRepository'
import { RepositoryRepository } from './repositories/RepositoryRepository'

/**
 * 初始化数据库
 */
async function initDatabase(db: Database) {
  // 分别执行每个 SQL 语句，避免批量执行的语法错误
  const statements = [
    // 创建项目表
    `CREATE TABLE IF NOT EXISTS ${TABLES.PROJECTS} (
    ${Object.entries(PROJECTS_SCHEMA).map(([k, v]) => `${k} ${v}`).join(',\n    ')}
  )`,
    // 创建仓库表
    `CREATE TABLE IF NOT EXISTS ${TABLES.REPOSITORIES} (
    ${Object.entries(REPOSITORIES_SCHEMA)
        .filter(([k]) => k !== 'FOREIGN_KEY')
        .map(([k, v]) => `${k} ${v}`)
        .join(',\n    ')},
    ${REPOSITORIES_SCHEMA.FOREIGN_KEY}
  )`,
    // 创建索引
    `CREATE INDEX IF NOT EXISTS idx_repositories_project_id
  ON ${TABLES.REPOSITORIES}(project_id)`,
    // 创建触发器
    `CREATE TRIGGER IF NOT EXISTS update_repositories_timestamp
  AFTER UPDATE ON ${TABLES.REPOSITORIES}
  BEGIN
    UPDATE ${TABLES.REPOSITORIES}
    SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
    WHERE id = OLD.id;
  END;`
  ]

  for (const statement of statements) {
    try {
      await db.execute(statement)
    } catch (error) {
      console.error('Failed to execute statement:', statement, error)
      throw error
    }
  }
}

/**
 * 数据库连接 Promise
 */
const dbPromise = Database.load('sqlite:pm.db').then(async (db) => {
  await initDatabase(db)
  return db
})

/**
 * 默认导出：数据库连接 Promise
 */
export default dbPromise

/**
 * 获取数据仓库实例
 * 使用统一的接口访问数据库，避免组件直接操作 SQL
 */
export async function getRepositories() {
  const db = await dbPromise
  return {
    project: new ProjectRepository(db),
    repository: new RepositoryRepository(db)
  }
}

/**
 * 重新导出数据仓库类型
 */
export { ProjectRepository } from './repositories/ProjectRepository'
export { RepositoryRepository } from './repositories/RepositoryRepository'
