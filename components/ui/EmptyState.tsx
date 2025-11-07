// 空状态组件
// 用于显示没有数据时的友好提示
interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ 
  icon = '📭', 
  title, 
  description, 
  actionLabel,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

