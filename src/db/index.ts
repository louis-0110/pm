import Database from '@tauri-apps/plugin-sql'

const db:any = await Database.load('sqlite:pm.db')

export default db
