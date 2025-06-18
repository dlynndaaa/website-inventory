interface SectionHeaderProps {
  title: string
  subtitle?: string
  description?: string
  className?: string
  titleClassName?: string
  subtitleClassName?: string
  descriptionClassName?: string
}

export function SectionHeader({
  title,
  subtitle,
  description,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  descriptionClassName = "",
}: SectionHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className={`text-3xl font-bold text-gray-900 ${titleClassName}`}>{title}</h2>
      {subtitle && <p className={`text-gray-600 mt-2 ${subtitleClassName}`}>{subtitle}</p>}
      {description && <p className={`text-gray-600 max-w-2xl mx-auto mt-4 ${descriptionClassName}`}>{description}</p>}
    </div>
  )
}
