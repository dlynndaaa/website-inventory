interface AuthDividerProps {
  text?: string
  className?: string
}

export function AuthDivider({ text = "Or", className }: AuthDividerProps) {
  return (
    <div className={`relative flex items-center justify-center my-6 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative bg-white px-4">
        <span className="text-sm text-gray-500">{text}</span>
      </div>
    </div>
  )
}
