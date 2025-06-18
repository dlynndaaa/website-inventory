import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  bgColor?: string
  iconBgColor?: string
  iconColor?: string
  className?: string
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  bgColor = "bg-blue-100",
  iconBgColor = "bg-blue-200",
  iconColor = "text-blue-600",
  className = "",
}: ServiceCardProps) {
  return (
    <Card className={`${bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      <CardContent className="p-8 text-center">
        <div className={`w-16 h-16 ${iconBgColor} rounded-lg flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
