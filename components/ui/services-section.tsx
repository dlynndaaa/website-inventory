import { ServiceCard } from "./service-card"
import type { LucideIcon } from "lucide-react"

interface Service {
  title: string
  description: string
  icon: LucideIcon
  bgColor?: string
  iconBgColor?: string
  iconColor?: string
}

interface ServicesSectionProps {
  title: string
  description: string
  services: Service[]
  className?: string
}

export function ServicesSection({ title, description, services, className = "" }: ServicesSectionProps) {
  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              bgColor={service.bgColor}
              iconBgColor={service.iconBgColor}
              iconColor={service.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
