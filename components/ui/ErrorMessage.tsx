// 错误提示组件
// 用于显示友好的错误信息，并提供重试功能
interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export default function ErrorMessage({ message, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                >
                  重试
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  关闭
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

