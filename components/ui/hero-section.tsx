"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  title: string
  subtitle?: string
  description: string
  buttonText: string
  buttonAction?: () => void
  imageSrc: string
  imageAlt: string
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  buttonText,
  buttonAction,
  imageSrc,
  imageAlt,
  className = "",
}: HeroSectionProps) {
  return (
    <section className={`bg-gradient-to-br from-blue-50 to-white py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {title}
              {subtitle && <span className="text-blue-600 block mt-2">{subtitle}</span>}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg" onClick={buttonAction}>
              {buttonText}
            </Button>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-80 h-80">
              <Image src={imageSrc || "/placeholder.svg"} alt={imageAlt} fill className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
