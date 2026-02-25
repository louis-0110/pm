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
}

const dbPromise = Database.load('sqlite:pm.db').then(async (db) => {
    await initDatabase(db)
    return db
})

export default dbPromise
