import Database from '@tauri-apps/plugin-sql'

const INIT_SQL = `
-- 项目表
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 仓库表
CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    url TEXT,
    vcs TEXT NOT NULL DEFAULT 'git',
    project_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_repositories_project_id ON repositories(project_id);
`

async function initDatabase(db: Database) {
    await db.execute(INIT_SQL)

    // 数据库迁移：检查并添加缺失的 url 列
    try {
        const columns = await db.select<Array<{ name: string }>>(
            "SELECT name FROM pragma_table_info('repositories') WHERE name = 'url'"
        )
        if (columns.length === 0) {
            console.log('migrating: adding url column to repositories table')
            await db.execute('ALTER TABLE repositories ADD COLUMN url TEXT')
        }
    } catch (error) {
        console.error('Migration error:', error)
    }
}

const dbPromise = Database.load('sqlite:pm.db').then(async (db) => {
    await initDatabase(db)
    return db
})

export default dbPromise
