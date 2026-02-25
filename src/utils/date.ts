/**
 * 格式化日期为相对时间
 * @param dateStr 日期字符串
 * @returns 格式化后的相对时间字符串
 */
export function formatDate(dateStr: string): string {
    if (!dateStr) return ''

    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60))
            return diffMinutes === 0 ? '刚刚' : `${diffMinutes}分钟前`
        }
        return `${diffHours}小时前`
    } else if (diffDays === 1) {
        return '昨天'
    } else if (diffDays < 7) {
        return `${diffDays}天前`
    }

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

/**
 * 格式化 SVN 日期
 * @param dateStr SVN 日期字符串 (格式: "2024-01-15 10:30:45 +0800")
 * @returns 格式化后的日期字符串
 */
export function formatSvnDate(dateStr: string): string {
    if (!dateStr) return ''

    const dateMatch = dateStr.match(/(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
        return dateMatch[1]
    }

    return dateStr.substring(0, 10)
}
