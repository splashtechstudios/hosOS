"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ShieldCheck, CalendarDays, Utensils } from "lucide-react"
import Image from "next/image"

interface HeroSliderProps {
  onBookNow: () => void
  onSeeMenu: () => void
}

const heroSlides = [
  {
    id: 1,
    image: "/12.jpg",
    tag: "100% Off-Grid Solar Powered • Ogori, Kogi State",
    title: "Where Earth, Sun & Serenity Converge",
    subtitle: "An Organic Sanctuary of Warm Hospitality in the Heart of Ogori",
    description:
      "Immerse yourself in tranquil nature, 100% solar-powered luxury lodges, soulful African & Continental dining, and starlit evening lounges.",
  },
  {
    id: 2,
    image: "/10.jpg",
    tag: "Tranquil Escape & Scenic Hills • 100% Solar Eco-Resort",
    title: "Unwind in Pure Natural Harmony",
    subtitle: "Surrounded by Lush Gardens and Fresh Country Breeze",
    description:
      "Designed for couples, executives, and families seeking peace away from the noise—powered 24/7 by our clean, silent off-grid solar microgrid.",
  },
  {
    id: 3,
    image: "/4.jpg",
    tag: "24/7 100% Off-Grid Solar Power • Inverter AC",
    title: "Restful Lodges & VIP Suites",
    subtitle: "Thoughtful Comfort Crafted for Deep Relaxation",
    description:
      "Experience our sanitized, solar air-conditioned Standard Rooms and spacious VIP Suites with private en-suite baths and priority room service.",
  },
  {
    id: 4,
    image: "/22.jpeg",
    tag: "Fresh Daily • African & Continental Kitchen",
    title: "Soulful Culinary Craft",
    subtitle: "Charcoal-Grilled Delicacies & Signature Native Flavors",
    description:
      "Savor whole grilled croaker fish platters, fragrant coconut rice with spicy goat meat, and aromatic native pepper soup made fresh to order.",
  },
  {
    id: 5,
    image: "/13.jpg",
    tag: "Open-Air Lounge & Weekend Bonfire",
    title: "Golden Evenings Under the Stars",
    subtitle: "Chilled Drinks, Fine Spirits & Weekend Bonfire Nights",
    description:
      "Gather by the warmth of our weekend bonfire with chilled beers, fresh fruit smoothies, signature cocktails, and great company.",
  },
]

export function HeroSlider({ onBookNow, onSeeMenu }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section id="home" className="relative h-[94vh] min-h-[700px] overflow-hidden bg-[#23140B]">
      {/* Slides Container */}
      <div className="relative h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Warm Espresso & Sunset Terracotta Cinematic Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(35, 20, 11, 0.76) 0%, rgba(61, 37, 22, 0.50) 45%, rgba(35, 20, 11, 0.88) 100%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Content Overlay — Strict 90% Mobile / 80% Desktop Container */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pt-28 pb-28">
        <div className="osieka-container relative flex items-center justify-between">
          {/* Left Arrow aligned to 80% container edge */}
          <button
            onClick={goToPrevious}
            className="hidden lg:flex bg-[#F4EFE6]/15 hover:bg-[#D97736] text-[#F4EFE6] backdrop-blur-md border border-[#F4EFE6]/30 hover:border-[#D97736] rounded-full p-3.5 transition-all duration-300 group shadow-lg shrink-0"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="text-center text-[#FAF7F2] max-w-3xl mx-auto px-2 sm:px-6">
            {/* Eyebrow Tag in Lagoon Teal & Terracotta */}
            <div className="inline-flex items-center gap-2.5 bg-[#23140B]/70 backdrop-blur-md border border-[#D97736]/60 text-[#F4EFE6] px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase mb-6 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#D97736] animate-pulse shrink-0" />
              <span>{heroSlides[currentSlide].tag}</span>
            </div>

            <h1 className="font-osieka-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FAF7F2] mb-4 leading-[1.1] drop-shadow-md">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="text-base sm:text-xl font-semibold text-[#E8A574] mb-4 tracking-wide">
              {heroSlides[currentSlide].subtitle}
            </p>

            <p className="text-sm sm:text-base text-[#EAE0D0]/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              {heroSlides[currentSlide].description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold text-sm sm:text-base px-8 py-6 rounded-full shadow-xl shadow-black/30 transform hover:-translate-y-0.5 transition-all duration-200 gap-2.5 w-full sm:w-auto border border-[#E8955B]/40"
                onClick={onBookNow}
              >
                <CalendarDays className="w-5 h-5" />
                Reserve Your Stay
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-[#FAF7F2] border-[#F4EFE6]/45 hover:bg-[#F4EFE6] hover:text-[#3D2516] font-semibold text-sm sm:text-base px-8 py-6 rounded-full bg-[#23140B]/40 backdrop-blur-md transform hover:-translate-y-0.5 transition-all duration-200 gap-2.5 w-full sm:w-auto"
                onClick={onSeeMenu}
              >
                <Utensils className="w-5 h-5 text-[#D97736]" />
                Explore Dining &amp; Lounge
              </Button>
            </div>

            {/* Policy Pill */}
            <div className="mt-7 inline-flex items-center gap-2.5 text-xs text-[#F4EFE6]/90 bg-[#23140B]/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#437A6C]/60">
              <ShieldCheck className="w-4 h-4 text-[#68B09E] shrink-0" />
              <span>
                Reservations are officially honoured &amp; kept upon payment confirmation • Instant Concierge Follow-Up
              </span>
            </div>
          </div>

          {/* Right Arrow aligned to 80% container edge */}
          <button
            onClick={goToNext}
            className="hidden lg:flex bg-[#F4EFE6]/15 hover:bg-[#D97736] text-[#F4EFE6] backdrop-blur-md border border-[#F4EFE6]/30 hover:border-[#D97736] rounded-full p-3.5 transition-all duration-300 group shadow-lg shrink-0"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-10 bg-[#D97736]"
                : "w-2.5 bg-[#F4EFE6]/45 hover:bg-[#F4EFE6]/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#F4EFE6]/15 z-20">
        <div
          className="h-full bg-gradient-to-r from-[#437A6C] via-[#D97736] to-[#E8A574] transition-all duration-500 ease-out"
          style={{
            width: `${((currentSlide + 1) / heroSlides.length) * 100}%`,
          }}
        />
      </div>
    </section>
  )
}
