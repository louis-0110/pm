/**
 * 数据库表结构定义
 * 统一管理所有表的结构，避免重复定义
 */

/**
 * 表名常量
 */
export const TABLES = {
  PROJECTS: 'projects',
  REPOSITORIES: 'repositories'
} as const

/**
 * 项目表结构
 */
export const PROJECTS_SCHEMA = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT NOT NULL UNIQUE',
  description: 'TEXT',
  created_at: "TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))",
  updated_at: "TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))"
} as const

/**
 * 仓库表结构
 */
export const REPOSITORIES_SCHEMA = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT NOT NULL CHECK(name <> \'\')',
  path: 'TEXT UNIQUE NOT NULL CHECK(path <> \'\')',
  url: 'TEXT',
  project_id: 'INTEGER NOT NULL',
  vcs: "TEXT CHECK(vcs IN ('git', 'svn', ''))",
  created_at: "TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))",
  updated_at: "TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))",
  FOREIGN_KEY: 'FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE'
} as const

/**
 * 创建项目表的 SQL 语句
 */
export const CREATE_PROJECTS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.PROJECTS} (
    ${Object.entries(PROJECTS_SCHEMA).map(([k, v]) => `${k} ${v}`).join(',\n    ')}
  )
`

/**
 * 创建仓库表的 SQL 语句
 */
export const CREATE_REPOSITORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.REPOSITORIES} (
    ${Object.entries(REPOSITORIES_SCHEMA)
        .filter(([k]) => k !== 'FOREIGN_KEY')
        .map(([k, v]) => `${k} ${v}`)
        .join(',\n    ')},
    ${REPOSITORIES_SCHEMA.FOREIGN_KEY}
  )
`

/**
 * 创建仓库表索引
 */
export const CREATE_REPOSITORIES_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_repositories_project_id
  ON ${TABLES.REPOSITORIES}(project_id)
`

/**
 * 创建仓库表自动更新时间戳的触发器
 */
export const CREATE_REPOSITORIES_TRIGGER = `
  CREATE TRIGGER IF NOT EXISTS update_repositories_timestamp
  AFTER UPDATE ON ${TABLES.REPOSITORIES}
  BEGIN
    UPDATE ${TABLES.REPOSITORIES}
    SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
    WHERE id = OLD.id;
  END;
`

/**
 * 初始化数据库的 SQL 语句集合
 */
export const INIT_SQL = [
  CREATE_PROJECTS_TABLE,
  CREATE_REPOSITORIES_TABLE,
  CREATE_REPOSITORIES_INDEX,
  CREATE_REPOSITORIES_TRIGGER
].join('\n')
