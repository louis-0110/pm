/**
 * 简单的事件总线，用于跨组件通信
 */
type EventCallback = (...args: any[]) => void

class EventBus {
    private events: Map<string, EventCallback[]> = new Map()

    /**
     * 监听事件
     */
    on(event: string, callback: EventCallback) {
        const callbacks = this.events.get(event) || []
        callbacks.push(callback)
        this.events.set(event, callbacks)
    }

    /**
     * 监听事件（只执行一次）
     */
    once(event: string, callback: EventCallback) {
        const onceCallback = (...args: any[]) => {
            callback(...args)
            this.off(event, onceCallback)
        }
        this.on(event, onceCallback)
    }

    /**
     * 取消监听
     */
    off(event: string, callback?: EventCallback) {
        if (!callback) {
            this.events.delete(event)
            return
        }
        const callbacks = this.events.get(event) || []
        const index = callbacks.indexOf(callback)
        if (index > -1) {
            callbacks.splice(index, 1)
        }
    }

    /**
     * 触发事件
     */
    emit(event: string, ...args: any[]) {
        const callbacks = this.events.get(event) || []
        callbacks.forEach(callback => callback(...args))
    }

    /**
     * 清空所有事件
     */
    clear() {
        this.events.clear()
    }
}

export const eventBus = new EventBus()

/**
 * 定义的事件类型
 */
export const Events = {
    // 项目相关
    PROJECT_CREATED: 'project:created',
    PROJECT_UPDATED: 'project:updated',
    PROJECT_DELETED: 'project:deleted',

    // 仓库相关
    REPOSITORY_ADDED: 'repository:added',
    REPOSITORY_UPDATED: 'repository:updated',
    REPOSITORY_DELETED: 'repository:deleted',

    // 数据刷新请求
    REFRESH_PROJECTS: 'refresh:projects',
    REFRESH_REPOSITORIES: 'refresh:repositories',
    REFRESH_REPOSITORY_STATUS: 'refresh:repository_status',
    REFRESH_DASHBOARD: 'refresh:dashboard',
} as const
