import Database from '@tauri-apps/plugin-sql'

const db = await Database.load('sqlite:pm.db')

export default db
