/**
 * 防抖函数类型
 */
type DebounceFunction<T extends unknown[], R> = (...args: T) => R

/**
 * 创建防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends unknown[], R>(
    fn: DebounceFunction<T, R>,
    delay: number
): DebounceFunction<T, void> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    return function (this: unknown, ...args: T) {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            fn.apply(this, args)
            timeoutId = null
        }, delay)
    }
}

/**
 * 创建节流函数
 * @param fn 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends unknown[], R>(
    fn: DebounceFunction<T, R>,
    delay: number
): DebounceFunction<T, void> {
    let lastCall = 0

    return function (this: unknown, ...args: T) {
        const now = Date.now()

        if (now - lastCall >= delay) {
            lastCall = now
            fn.apply(this, args)
        }
    }
}
