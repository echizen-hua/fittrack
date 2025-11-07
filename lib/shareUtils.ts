// 社交分享功能工具函数
// 用于分享训练记录和成就

// 生成分享文本
export function generateShareText(workout: {
  exercise_name: string
  weight: number
  reps: number
  sets: number
}): string {
  return `💪 今天完成了 ${workout.exercise_name}：${workout.weight}kg × ${workout.reps}次 × ${workout.sets}组！\n\n使用FitTrack记录我的健身进步 📊`
}

// 生成分享链接（可以用于分享到微信、微博等）
export function generateShareLink(workout: {
  exercise_name: string
  weight: number
  reps: number
  sets: number
}): string {
  const text = encodeURIComponent(generateShareText(workout))
  // 这里可以替换为实际的分享URL
  return `https://twitter.com/intent/tweet?text=${text}`
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (err) {
        document.body.removeChild(textArea)
        return false
      }
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

