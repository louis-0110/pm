import { message } from '@tauri-apps/plugin-dialog'
import dbFn from './index'

export default async () => {
    try {
        const db = await dbFn
        //  db.execute(`DROP TABLE IF EXISTS projects;`)
        db.execute(
            `CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL  CHECK(name <> ''), description TEXT, created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')), updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')))`
        )

        // db.execute(`DROP TABLE IF EXISTS repositories;`)
        db.execute(
            `CREATE TABLE IF NOT EXISTS repositories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 自增主键
            name TEXT NOT NULL CHECK(name <> ''),                    -- 名称
            path TEXT UNIQUE NOT NULL CHECK(path <> ''),              -- 唯一path约束
            url TEXT,
            project_id INTEGER NOT NULL,           -- 外键约束
            vcs TEXT CHECK(vcs IN ('git', 'svn', '')), -- 增加枚举检查
            created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
            updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );`
        )

        db.execute(
            `CREATE TRIGGER IF NOT EXISTS update_repositories_timestamp
            AFTER UPDATE ON repositories
            BEGIN
                UPDATE repositories 
                SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
                WHERE id = OLD.id;
            END;`
        )
    } catch (error) {
        console.log(error)
        message('Error creating table', { title: 'Error' })
    }
}
