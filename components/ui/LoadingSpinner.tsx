// 加载动画组件
// 用于显示加载状态，提供更好的视觉反馈
export default function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* 旋转的加载动画 */}
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      {/* 加载文字 */}
      <p className="text-gray-600 text-lg">{text}</p>
    </div>
  )
}

