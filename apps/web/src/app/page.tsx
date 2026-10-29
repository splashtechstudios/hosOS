"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Coffee,
  Utensils,
  Star,
  Quote,
  Lightbulb,
  Home,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Wine,
  Tv,
  Wind,
  Bath,
  Menu,
  X,
  ArrowRight,
  Compass,
  Sun,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { BookingModal } from "@/components/booking-modal"
import { NewsletterSection } from "@/components/newsletter-section"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HeroSlider } from "@/components/hero-slider"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

const queryClient = new QueryClient()

function OsiekaResortContent() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<string>("standard")
  const [quickCheckIn, setQuickCheckIn] = useState<string>("")
  const [quickCheckOut, setQuickCheckOut] = useState<string>("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Contact Form State (Connected to CRM Message Board & Email List)
  const [contactFirstName, setContactFirstName] = useState("")
  const [contactLastName, setContactLastName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactSubject, setContactSubject] = useState("Room & Suite Inquiry")
  const [contactMessage, setContactMessage] = useState("")
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactSuccessId, setContactSuccessId] = useState<string | null>(null)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactFirstName.trim() || (!contactPhone.trim() && !contactEmail.trim()) || !contactMessage.trim()) {
      toast({
        title: "Missing Details",
        description: "Please provide your name, phone/WhatsApp or email, and your message.",
        variant: "destructive",
      })
      return
    }
    setIsSubmittingContact(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MESSAGE",
          firstName: contactFirstName,
          lastName: contactLastName,
          email: contactEmail,
          phone: contactPhone,
          subject: contactSubject,
          message: contactMessage,
          source: "CONTACT_FORM",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setContactSuccessId(data.contactMessage?.messageId || "MSG-NEW")
        toast({
          title: "Message Delivered to Osieka Concierge",
          description: "Your inquiry has been logged on our live Message Board. Our team will reach out shortly.",
        })
        setContactFirstName("")
        setContactLastName("")
        setContactEmail("")
        setContactPhone("")
        setContactMessage("")
      } else {
        toast({
          title: "Submission Error",
          description: data.error || "Unable to send message right now.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Connection Error",
        description: "Could not submit message. Please try again or reach us on WhatsApp.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const handleOpenBooking = (roomType: string = "standard") => {
    setSelectedRoomType(roomType)
    setIsBookingModalOpen(true)
  }

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3D2516] selection:bg-[#D97736] selection:text-[#FAF7F2]">
      {/* Seamless Parchment Navigation Bar — Strict 90% Mobile / 80% Desktop Width */}
      <nav className="fixed top-0 w-full bg-[#F4EFE6]/95 backdrop-blur-md z-50 border-b border-[#3D2516]/12 shadow-sm">
        <div className="osieka-container py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Authentic Osieka Resort Logo Lockup */}
            <Link href="#home" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-[#F4EFE6] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/osieka-logo.jpg"
                  alt="Osieka Resort Logo"
                  width={60}
                  height={60}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-osieka-serif text-xl sm:text-2xl font-bold tracking-wider text-[#3D2516] leading-none">
                  OSIEKA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#437A6C] mt-1">
                  RESORT • OGORI
                </span>
              </div>
            </Link>

            {/* Navigation Links — Single-line non-wrapping */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-semibold text-[#3D2516]/90 whitespace-nowrap">
              <Link href="#rooms" className="hover:text-[#D97736] transition-colors">
                Rooms
              </Link>
              <Link href="#restaurant" className="hover:text-[#D97736] transition-colors">
                Restaurant
              </Link>
              <Link href="#drinks" className="hover:text-[#D97736] transition-colors">
                Bar
              </Link>
              <Link href="#gallery" className="hover:text-[#D97736] transition-colors">
                Gallery
              </Link>
              <Link href="#contact" className="hover:text-[#D97736] transition-colors">
                Contact
              </Link>
            </div>

            {/* Right CTA & Concierge Line */}
            <div className="hidden sm:flex items-center gap-2.5 shrink-0">
              <a
                href="tel:08074538555"
                className="hidden xl:inline-flex items-center gap-2 text-xs font-bold text-[#3D2516] bg-[#FAF7F2] border border-[#3D2516]/20 px-4 py-2.5 rounded-full hover:border-[#437A6C] hover:text-[#437A6C] transition whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-[#D97736] shrink-0" />
                <span>0807 453 8555</span>
              </a>
              <Button
                className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold px-5 py-2.5 rounded-full shadow-md shadow-[#3D2516]/15 transition-all hover:-translate-y-0.5 whitespace-nowrap text-xs sm:text-sm"
                onClick={() => handleOpenBooking("standard")}
              >
                Reserve Your Stay
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-[#3D2516] hover:bg-[#E6DEC8]/60"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden pt-4 pb-4 border-t border-[#3D2516]/10 mt-3 space-y-1.5 bg-[#F4EFE6]">
              {[
                { label: "Home", id: "home" },
                { label: "Rooms", id: "rooms" },
                { label: "Restaurant", id: "restaurant" },
                { label: "Bar", id: "drinks" },
                { label: "Gallery", id: "gallery" },
                { label: "Contact", id: "contact" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#3D2516] hover:bg-[#E6DEC8]/60 hover:text-[#D97736]"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Button
                  className="w-full bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold rounded-full py-5"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleOpenBooking("standard")
                  }}
                >
                  Reserve Your Stay
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Full-Bleed Hero Slider */}
      <HeroSlider
        onBookNow={() => handleOpenBooking("standard")}
        onSeeMenu={() => scrollToSection("restaurant")}
      />

      {/* Seamless Interactive Quick-Reservation & Policy Bar — Strict 90% / 80% Width */}
      <div className="relative z-30 -mt-16 osieka-container">
        <div className="bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#3D2516]/15 p-6 sm:p-8">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-4 space-y-2">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#437A6C] bg-[#437A6C]/12 px-3.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#437A6C]" />
                Direct Resort Booking
              </div>
              <h2 className="font-osieka-serif text-2xl sm:text-3xl font-bold text-[#23140B] leading-tight">
                Plan Your Escape to Osieka
              </h2>
              <p className="text-xs sm:text-sm text-[#6B4C35] leading-relaxed">
                <strong className="text-[#3D2516]">Reservation Policy:</strong> Rooms are officially honoured and kept
                upon payment confirmation. Our concierge holds your WhatsApp &amp; phone for instant follow-up.
              </p>
            </div>

            {/* Interactive Date & Suite Selector */}
            <div className="lg:col-span-8 grid sm:grid-cols-4 gap-3.5 bg-[#F4EFE6] p-4 rounded-2xl border border-[#E6DEC8]">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4C35] mb-1.5">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={quickCheckIn}
                  onChange={(e) => setQuickCheckIn(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF7F2] border border-[#3D2516]/20 text-xs font-semibold text-[#23140B] focus:outline-none focus:border-[#D97736]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4C35] mb-1.5">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  value={quickCheckOut}
                  onChange={(e) => setQuickCheckOut(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF7F2] border border-[#3D2516]/20 text-xs font-semibold text-[#23140B] focus:outline-none focus:border-[#D97736]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4C35] mb-1.5">
                  Preferred Suite
                </label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF7F2] border border-[#3D2516]/20 text-xs font-semibold text-[#23140B] focus:outline-none focus:border-[#D97736]"
                >
                  <option value="standard">Standard Room (₦10,000)</option>
                  <option value="vip">VIP Suite (₦15,000)</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full h-11 bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md gap-1.5"
                >
                  <CalendarDays className="w-4 h-4" />
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About / Sanctuary Section — Strict 90% / 80% Width */}
      <section id="about" className="py-24 sm:py-28 bg-[#F4EFE6]">
        <div className="osieka-container">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#437A6C] bg-[#FAF7F2] border border-[#437A6C]/30 px-4 py-1.5 rounded-full">
                <Compass className="w-3.5 h-3.5 text-[#D97736]" />
                The Osieka Sanctuary
              </div>
              <h2 className="font-osieka-serif text-3xl sm:text-5xl font-bold text-[#23140B] leading-[1.15]">
                A 100% Solar-Powered Off-Grid Paradise in Kogi State
              </h2>
              <p className="text-base sm:text-lg text-[#5C402B] leading-relaxed">
                Nestled in the peaceful heart of Ayeromi, Ogori, <strong>Osieka Resort</strong> is a completely
                off-grid eco-luxury retreat where lush hills, warm golden sunsets, and genuine Nigerian hospitality come
                together. Whether you are visiting for a romantic getaway, an executive retreat, or a restorative
                weekend, every corner is crafted for calm.
              </p>
              <p className="text-base text-[#6B4C35] leading-relaxed">
                Powered <strong>100% off-grid by our dedicated solar PV and battery inverter microgrid</strong>, our
                air-conditioned lodges, open-air lounge, and kitchen deliver silent, uninterrupted comfort day and
                night.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    title: "Serene Natural Landscape",
                    desc: "Surrounded by quiet hills & lush greenery in Ogori",
                  },
                  {
                    title: "100% Off-Grid Solar Power",
                    desc: "Clean, silent 24/7 solar electricity powering all room ACs",
                  },
                  {
                    title: "Soulful Fresh Dining",
                    desc: "Made-to-order African & Continental specialties",
                  },
                  {
                    title: "Attentive Concierge Care",
                    desc: "Personal WhatsApp & phone support from booking to checkout",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start space-x-3.5 bg-[#FAF7F2] p-4 rounded-2xl border border-[#3D2516]/10 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#437A6C]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#437A6C]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#23140B]">{feature.title}</div>
                      <div className="text-xs text-[#6B4C35] mt-0.5">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative h-[480px] sm:h-[540px] w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-[#FAF7F2]">
                <Image src="/8.jpg" alt="Osieka Resort Grounds" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23140B]/50 via-transparent to-transparent" />
              </div>

              {/* Floating Brand Crest Card */}
              <div className="hidden sm:flex absolute -bottom-6 left-6 bg-[#23140B] text-[#FAF7F2] p-5 rounded-2xl shadow-2xl items-center gap-4 border border-[#D97736]/40 max-w-xs">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F4EFE6] p-1 shrink-0">
                  <Image
                    src="/osieka-logo.jpg"
                    alt="Osieka Crest"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div className="text-xs leading-snug">
                  <div className="text-[#D97736] font-extrabold uppercase tracking-wider text-[11px]">
                    100% Off-Grid Solar Microgrid
                  </div>
                  <div className="font-osieka-serif text-base font-bold text-[#FAF7F2] mt-0.5">
                    24/7 Clean Solar Power &amp; Security
                  </div>
                  <div className="text-[#F4EFE6]/70 text-[11px] mt-0.5">Ayeromi, Ogori • Kogi State</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms & Suites Section — Strict 90% / 80% Width */}
      <section id="rooms" className="py-24 sm:py-28 bg-[#FAF7F2] border-y border-[#3D2516]/10">
        <div className="osieka-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D97736] bg-[#F4EFE6] border border-[#D97736]/30 px-4 py-1.5 rounded-full mb-4">
                <Sun className="w-3.5 h-3.5 text-[#D97736]" />
                Restful Accommodations
              </div>
              <h2 className="font-osieka-serif text-3xl sm:text-5xl font-bold text-[#23140B]">
                Sanctuaries of Rest &amp; Warmth
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#6B4C35] max-w-md">
              Every lodge at Osieka Resort is powered 100% by off-grid solar energy, featuring inverter air
              conditioning, crisp linens, satellite television, and private en-suite bathrooms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 mb-14">
            {/* Standard Room Card */}
            <Card className="overflow-hidden rounded-3xl border border-[#3D2516]/15 bg-[#F4EFE6] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative h-80 sm:h-96 w-full overflow-hidden">
                <Image
                  src="/14.jpg"
                  alt="Standard Room"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23140B]/65 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#437A6C] hover:bg-[#2F594E] text-[#FAF7F2] font-bold px-3.5 py-1 text-xs uppercase tracking-wider">
                    Solo &amp; Business Retreat
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="bg-[#23140B]/90 backdrop-blur-md text-[#FAF7F2] border border-[#D97736]/50 px-4 py-2 rounded-full">
                    <span className="font-osieka-serif text-xl font-bold text-[#E8A574]">₦10,000</span>
                    <span className="text-xs text-[#F4EFE6]/80"> / night</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-osieka-serif text-2xl sm:text-3xl font-bold text-[#23140B] mb-2">
                    Standard Room
                  </h3>
                  <p className="text-[#5C402B] text-sm sm:text-base leading-relaxed mb-5">
                    Ideal for solo travelers and business guests. Features a plush double bed, 100% solar-powered
                    inverter air conditioning, flat-screen satellite TV, and a serene private bathroom.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["100% Off-Grid Solar Power", "Solar Inverter AC", "Room Service", "En-Suite Bath"].map((pill) => (
                      <span
                        key={pill}
                        className="bg-[#FAF7F2] text-[#3D2516] border border-[#3D2516]/15 px-3 py-1 rounded-full font-semibold"
                      >
                        ✓ {pill}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenBooking("standard")}
                  className="w-full bg-[#3D2516] hover:bg-[#23140B] text-[#FAF7F2] font-bold py-6 rounded-full gap-2 shadow-md"
                >
                  Reserve Standard Room <ArrowRight className="w-4 h-4 text-[#D97736]" />
                </Button>
              </CardContent>
            </Card>

            {/* VIP Suite Card */}
            <Card className="overflow-hidden rounded-3xl border-2 border-[#D97736]/60 bg-[#F4EFE6] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col relative">
              <div className="relative h-80 sm:h-96 w-full overflow-hidden">
                <Image
                  src="/13.jpg"
                  alt="VIP Suite"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23140B]/65 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-extrabold px-3.5 py-1 text-xs uppercase tracking-wider shadow">
                    ★ Signature VIP Suite
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="bg-[#23140B]/90 backdrop-blur-md text-[#FAF7F2] border border-[#D97736] px-4 py-2 rounded-full">
                    <span className="font-osieka-serif text-xl font-bold text-[#D97736]">₦15,000</span>
                    <span className="text-xs text-[#F4EFE6]/80"> / night</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-osieka-serif text-2xl sm:text-3xl font-bold text-[#23140B] mb-2">
                    Executive VIP Suite
                  </h3>
                  <p className="text-[#5C402B] text-sm sm:text-base leading-relaxed mb-5">
                    Our most spacious suite tailored for couples, VIP guests, and weekend retreats. Includes executive
                    king bedding, priority dining &amp; bar room service, 100% solar inverter AC, and tranquil views.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      "Spacious Executive Layout",
                      "24/7 Off-Grid Solar AC & TV",
                      "Priority VIP Concierge",
                      "Luxury En-Suite",
                    ].map((pill) => (
                      <span
                        key={pill}
                        className="bg-[#FAF7F2] text-[#2F594E] border border-[#437A6C]/30 px-3 py-1 rounded-full font-semibold"
                      >
                        ✓ {pill}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenBooking("vip")}
                  className="w-full bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold py-6 rounded-full gap-2 shadow-lg"
                >
                  Reserve VIP Suite <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Deep Espresso Amenities Banner — Full 80% Container Width */}
          <div
            className="text-[#FAF7F2] rounded-3xl p-8 sm:p-11 shadow-2xl border border-[#D97736]/30"
            style={{
              background: "linear-gradient(135deg, #23140B 0%, #3D2516 60%, #2F594E 100%)",
            }}
          >
            <h3 className="font-osieka-serif text-xl sm:text-2xl font-bold text-center text-[#E8A574] mb-8 tracking-wide">
              Every Lodge at Osieka Resort Includes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {[
                { icon: Lightbulb, title: "100% Solar Power", sub: "24/7 Off-Grid Microgrid" },
                { icon: Wind, title: "Air Conditioning", sub: "Solar-Powered Inverter AC" },
                { icon: Tv, title: "Flat-Screen TV", sub: "Satellite Channels" },
                { icon: Coffee, title: "In-Room Dining", sub: "Kitchen & Bar Delivery" },
                { icon: Bath, title: "Private Bathroom", sub: "Sanitized En-Suite" },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  className={`flex flex-col items-center gap-2.5 ${idx === 4 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2]/10 border border-[#D97736]/30 flex items-center justify-center text-[#D97736]">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-[#FAF7F2]">{item.title}</span>
                  <span className="text-xs text-[#F4EFE6]/70">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Culinary / Restaurant Section — Strict 90% / 80% Width */}
      <section id="restaurant" className="py-24 sm:py-28 bg-[#F4EFE6]">
        <div className="osieka-container">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative h-[480px] sm:h-[520px] rounded-3xl overflow-hidden shadow-2xl border-8 border-[#FAF7F2]">
              <Image src="/22.jpeg" alt="Osieka Resort Restaurant" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23140B]/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-[#23140B]/85 backdrop-blur-md p-4 rounded-2xl border border-[#D97736]/40 text-[#FAF7F2]">
                <div className="text-xs font-bold uppercase tracking-widest text-[#D97736]">
                  Open Daily • 7:00 AM – 10:00 PM
                </div>
                <div className="font-osieka-serif text-lg font-bold mt-0.5">
                  Prepared Fresh to Order from Local Harvests
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D97736] bg-[#FAF7F2] border border-[#D97736]/30 px-4 py-1.5 rounded-full">
                <Utensils className="w-3.5 h-3.5" /> African &amp; Continental Kitchen
              </div>
              <h2 className="font-osieka-serif text-3xl sm:text-5xl font-bold text-[#23140B] leading-tight">
                Fresh, Local &amp; Soulful — Flavors of Osieka
              </h2>
              <p className="text-base sm:text-lg text-[#5C402B] leading-relaxed">
                Our culinary team celebrates authentic Nigerian heritage alongside classic continental favorites—each
                dish prepared fresh upon order with aromatic native spices.
              </p>

              <div className="space-y-3.5">
                <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#437A6C]">
                  Chef&apos;s Signature Specialties
                </h4>
                <div className="grid gap-3.5">
                  {[
                    {
                      name: "Osieka Charcoal-Grilled Fish Platter",
                      desc: "Whole marinated croaker or catfish with golden plantains & peppered sauce",
                      tag: "Guest Favorite",
                    },
                    {
                      name: "Fragrant Coconut Rice & Spicy Goat Meat",
                      desc: "Rich coconut-infused rice paired with tender flame-seared goat meat",
                      tag: "Chef's Special",
                    },
                    {
                      name: "Native Assorted & Catfish Pepper Soup",
                      desc: "Simmered with traditional scent leaf, uda, and fresh local herbs",
                      tag: "Prepared Fresh",
                    },
                  ].map((dish) => (
                    <div
                      key={dish.name}
                      className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#3D2516]/12 shadow-sm flex items-center justify-between gap-4 hover:border-[#D97736]/50 transition"
                    >
                      <div>
                        <h5 className="font-osieka-serif text-lg font-bold text-[#23140B]">{dish.name}</h5>
                        <p className="text-xs text-[#6B4C35] mt-0.5">{dish.desc}</p>
                      </div>
                      <Badge className="bg-[#437A6C]/15 text-[#2F594E] border border-[#437A6C]/30 shrink-0 font-bold">
                        {dish.tag}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold px-8 py-6 rounded-full shadow-md"
                  onClick={() => handleOpenBooking("standard")}
                >
                  Reserve a Stay &amp; Dining Table
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bar, Lounge & Weekend Bonfire Section — Strict 90% / 80% Width */}
      <section id="drinks" className="py-24 sm:py-28 bg-[#FAF7F2] border-t border-[#3D2516]/10">
        <div className="osieka-container">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#437A6C] bg-[#F4EFE6] border border-[#437A6C]/30 px-4 py-1.5 rounded-full">
                <Wine className="w-3.5 h-3.5 text-[#D97736]" /> Outdoor Bar &amp; Bonfire Lounge
              </div>
              <h2 className="font-osieka-serif text-3xl sm:text-5xl font-bold text-[#23140B] leading-tight">
                Sip &amp; Unwind Under the Evening Sky
              </h2>
              <p className="text-base sm:text-lg text-[#5C402B] leading-relaxed">
                As the sun dips behind the hills of Ogori, our open-air bar and lounge come alive. Enjoy ice-cold beers,
                fine wines, freshly pressed fruit smoothies, or signature cocktails around our weekend bonfire.
              </p>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {[
                  "Ice-cold local & international beers",
                  "Freshly blended tropical smoothies",
                  "Signature cocktails, wines & spirits",
                  "Weekend nighttime bonfire gatherings",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-4 bg-[#F4EFE6] rounded-2xl border border-[#3D2516]/12"
                  >
                    <div className="w-2.5 h-2.5 bg-[#D97736] rounded-full shrink-0" />
                    <span className="text-sm font-bold text-[#23140B]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative h-[460px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-8 border-[#F4EFE6]">
              <Image src="/drinks.jpg" alt="Osieka Resort Bar & Lounge" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Dispatch Section */}
      <NewsletterSection />

      {/* Visual Gallery Section — Strict 90% / 80% Width */}
      <section id="gallery" className="py-24 sm:py-28 bg-[#F4EFE6]">
        <div className="osieka-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#437A6C] bg-[#FAF7F2] border border-[#437A6C]/30 px-4 py-1.5 rounded-full mb-3">
                Visual Journey
              </div>
              <h2 className="font-osieka-serif text-3xl sm:text-5xl font-bold text-[#23140B]">
                Glimpses of Osieka Resort
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#6B4C35] max-w-md">
              Explore our 100% solar-powered lodges, serene grounds, and culinary moments in Ogori.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              { src: "/4.jpg", label: "Resort Exterior & Lodges", tag: "Architecture" },
              { src: "/5.jpg", label: "Signature Gourmet Cuisine", tag: "Kitchen" },
              { src: "/14.jpg", label: "Restful Room Interior", tag: "Accommodations" },
              { src: "/12.jpg", label: "Serene Outdoor Ambience", tag: "Sanctuary" },
              { src: "/15.jpg", label: "Lounge & Bar Experience", tag: "Nightlife" },
              { src: "/10.jpg", label: "Lush Nature & Gardens", tag: "Grounds" },
            ].map((img) => (
              <div
                key={img.src}
                className="group relative h-80 overflow-hidden rounded-3xl shadow-lg border-4 border-[#FAF7F2]"
              >
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23140B]/85 via-[#23140B]/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D97736]">{img.tag}</span>
                  <span className="font-osieka-serif text-xl font-bold text-[#FAF7F2] mt-0.5">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Testimonials Section — Strict 90% / 80% Width */}
      <section className="py-24 bg-[#FAF7F2] border-t border-[#3D2516]/10">
        <div className="osieka-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D97736] bg-[#F4EFE6] border border-[#D97736]/30 px-4 py-1.5 rounded-full mb-3">
                Guest Impressions
              </div>
              <h2 className="font-osieka-serif text-3xl sm:text-5xl font-bold text-[#23140B]">
                Words From Our Guests
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#6B4C35] max-w-md">
              Verified experiences shared by guests who stayed and dined at Osieka Resort.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 sm:p-10 rounded-3xl border border-[#3D2516]/15 bg-[#F4EFE6] shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <Quote className="w-9 h-9 text-[#D97736]" />
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D97736] text-[#D97736]" />
                    ))}
                  </div>
                </div>
                <p className="text-[#3D2516] mb-6 italic leading-relaxed text-base sm:text-lg">
                  &ldquo;Always a place to revisit—the rooms are spacious, the environment is serene, the kitchen serves
                  both Continental and African delicacies, and the entire resort is 100% solar powered running all the
                  A/Cs seamlessly. You will always want to come back again.&rdquo;
                </p>
              </div>
              <div className="border-t border-[#3D2516]/12 pt-4 flex items-center justify-between">
                <p className="font-osieka-serif font-bold text-lg text-[#23140B]">adamadamosi alao</p>
                <span className="text-xs font-bold text-[#437A6C]">Verified Google Review</span>
              </div>
            </Card>

            <Card className="p-8 sm:p-10 rounded-3xl border border-[#3D2516]/15 bg-[#F4EFE6] shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <Quote className="w-9 h-9 text-[#D97736]" />
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D97736] text-[#D97736]" />
                    ))}
                  </div>
                </div>
                <p className="text-[#3D2516] mb-6 italic leading-relaxed text-base sm:text-lg">
                  &ldquo;Peaceful atmosphere, cool breeze, and reliable 24/7 solar-powered comfort in Ogori. Great spot
                  to relax and unwind with friends and family.&rdquo;
                </p>
              </div>
              <div className="border-t border-[#3D2516]/12 pt-4 flex items-center justify-between">
                <p className="font-osieka-serif font-bold text-lg text-[#23140B]">andrawus ezekiel (Eazy1)</p>
                <span className="text-xs font-bold text-[#437A6C]">Local Guide • Google Review</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact & Concierge Section — Strict 90% / 80% Width */}
      <section id="contact" className="py-24 sm:py-28 bg-[#E6DEC8]/55 border-t border-[#3D2516]/12">
        <div className="osieka-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#437A6C] bg-[#FAF7F2] border border-[#437A6C]/30 px-4 py-1.5 rounded-full mb-3">
                Concierge &amp; Directions
              </div>
              <h2 className="font-osieka-serif text-3xl sm:text-5xl font-bold text-[#23140B]">
                Visit Osieka Resort
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#5C402B] max-w-md">
              Located in a peaceful enclave of Ayeromi, Ogori with smooth road access. Open 7 days a week.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6 bg-[#FAF7F2] p-8 sm:p-10 rounded-3xl shadow-lg border border-[#3D2516]/12 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D97736]/15 flex items-center justify-center text-[#D97736] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-osieka-serif text-lg font-bold text-[#23140B]">Resort Address</h3>
                    <p className="text-[#5C402B] text-sm mt-0.5">Ayeromi, Ogori 263103, Kogi State, Nigeria</p>
                    <Link
                      href="https://maps.app.goo.gl/uQTAcPXbbTwtY9929"
                      target="_blank"
                      className="text-[#D97736] hover:text-[#C06225] text-xs font-bold inline-block mt-1.5"
                    >
                      Open in Google Maps →
                    </Link>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#437A6C]/15 flex items-center justify-center text-[#437A6C] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-osieka-serif text-lg font-bold text-[#23140B]">
                      Direct Concierge &amp; WhatsApp
                    </h3>
                    <p className="text-[#5C402B] text-sm mt-0.5 font-semibold">0807 453 8555</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D97736]/15 flex items-center justify-center text-[#D97736] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-osieka-serif text-lg font-bold text-[#23140B]">Electronic Mail</h3>
                    <p className="text-[#5C402B] text-sm mt-0.5">osiekaresort@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#437A6C]/15 flex items-center justify-center text-[#437A6C] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-osieka-serif text-lg font-bold text-[#23140B]">Resort Hours</h3>
                    <div className="text-[#5C402B] text-sm space-y-0.5 mt-0.5">
                      <p>Restaurant: 7:00 AM – 10:00 PM</p>
                      <p>Bar &amp; Lounge: 12:00 PM – 12:00 AM</p>
                      <p>Check-In: 2:00 PM • Check-Out: 12:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Button
                  className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold rounded-full px-7"
                  onClick={() => handleOpenBooking("standard")}
                >
                  Reserve a Room Now
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3D2516]/30 text-[#3D2516] hover:bg-[#F4EFE6] rounded-full px-6"
                  onClick={() => window.open("https://maps.app.goo.gl/uQTAcPXbbTwtY9929", "_blank")}
                >
                  Get Directions
                </Button>
              </div>
            </div>

            <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-10 shadow-lg border border-[#3D2516]/12">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-osieka-serif text-2xl sm:text-3xl font-bold text-[#23140B]">
                  Send a Message to Concierge
                </h3>
                <Badge className="bg-[#437A6C]/15 text-[#437A6C] border border-[#437A6C]/30 text-[10px]">
                  Live Message Board
                </Badge>
              </div>
              <p className="text-xs text-[#6B4C35] mb-6 leading-relaxed">
                Submit a direct message or inquiry below. Your message and contact details are delivered straight to our
                Concierge Message Board &amp; Email Dispatch for prompt follow-up.
              </p>

              {contactSuccessId ? (
                <div className="p-6 rounded-2xl bg-[#F4EFE6] border border-[#437A6C]/35 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#437A6C]/15 text-[#437A6C] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#437A6C]">
                      Reference #{contactSuccessId}
                    </div>
                    <h4 className="font-osieka-serif text-xl font-bold text-[#23140B]">
                      Message Received on Our Concierge Board
                    </h4>
                    <p className="text-xs text-[#5C402B] leading-relaxed">
                      Thank you for reaching out to Osieka Resort. Our hospitality desk has received your message and
                      added your email to our dispatch list.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setContactSuccessId(null)}
                      className="border-[#3D2516]/25 text-[#3D2516] rounded-full text-xs"
                    >
                      Send Another Message
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleOpenBooking("standard")}
                      className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] rounded-full text-xs font-bold"
                    >
                      Open Room Reservation Desk
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3D2516] mb-1.5">First Name *</label>
                      <input
                        type="text"
                        required
                        value={contactFirstName}
                        onChange={(e) => setContactFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#3D2516]/20 rounded-xl text-sm text-[#23140B] focus:outline-none focus:border-[#D97736]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3D2516] mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={contactLastName}
                        onChange={(e) => setContactLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#3D2516]/20 rounded-xl text-sm text-[#23140B] focus:outline-none focus:border-[#D97736]"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3D2516] mb-1.5">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="0803 000 0000"
                        className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#3D2516]/20 rounded-xl text-sm text-[#23140B] focus:outline-none focus:border-[#D97736]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3D2516] mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#3D2516]/20 rounded-xl text-sm text-[#23140B] focus:outline-none focus:border-[#D97736]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3D2516] mb-1.5">Inquiry Topic</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#3D2516]/20 rounded-xl text-sm text-[#23140B] focus:outline-none focus:border-[#D97736]"
                    >
                      <option value="Room & Suite Inquiry">Room &amp; Suite Inquiry</option>
                      <option value="Event, Retreat & Banqueting">Event, Retreat &amp; Banqueting</option>
                      <option value="Restaurant & Weekend Bonfire">Restaurant &amp; Weekend Bonfire</option>
                      <option value="General Concierge Question">General Concierge Question</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3D2516] mb-1.5">Your Message *</label>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us about your preferred dates, suite requirements, or questions..."
                      className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#3D2516]/20 rounded-xl text-sm text-[#23140B] focus:outline-none focus:border-[#D97736]"
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full bg-[#3D2516] hover:bg-[#23140B] text-[#FAF7F2] font-bold py-6 rounded-full shadow-md"
                  >
                    {isSubmittingContact ? "Sending to Message Board..." : "Submit Message to Concierge"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Deep Espresso Brand Footer — Strict 90% / 80% Width */}
      <footer className="bg-[#23140B] text-[#F4EFE6] py-16 border-t border-[#D97736]/30">
        <div className="osieka-container">
          <div className="grid md:grid-cols-12 gap-10 pb-12 border-b border-[#FAF7F2]/12">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F4EFE6] p-1 shrink-0 border-2 border-[#D97736]">
                  <Image
                    src="/osieka-logo.jpg"
                    alt="Osieka Resort Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <div className="font-osieka-serif text-2xl font-bold tracking-wider text-[#FAF7F2]">
                    OSIEKA RESORT
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#E8A574]">
                    100% Solar Eco-Resort • Ogori
                  </div>
                </div>
              </div>
              <p className="text-[#F4EFE6]/75 text-sm leading-relaxed max-w-md">
                An organic, 100% off-grid solar-powered sanctuary of restful lodges, soulful African &amp; Continental
                cuisine, and warm evening gatherings under the stars.
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-[#E8A574] bg-[#3D2516]/70 border border-[#D97736]/30 px-3.5 py-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-[#D97736] shrink-0" />
                <span>Policy: Reservations are honoured and kept upon payment confirmation.</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-bold mb-4 text-xs uppercase tracking-[0.2em] text-[#E8A574]">Explore</h4>
              <ul className="space-y-2.5 text-sm text-[#F4EFE6]/75">
                <li>
                  <Link href="#home" className="hover:text-[#D97736] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-[#D97736] transition-colors">
                    The Sanctuary
                  </Link>
                </li>
                <li>
                  <Link href="#rooms" className="hover:text-[#D97736] transition-colors">
                    Rooms &amp; Suites
                  </Link>
                </li>
                <li>
                  <Link href="#restaurant" className="hover:text-[#D97736] transition-colors">
                    Culinary
                  </Link>
                </li>
                <li>
                  <Link href="#gallery" className="hover:text-[#D97736] transition-colors">
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-bold mb-4 text-xs uppercase tracking-[0.2em] text-[#E8A574]">Experiences</h4>
              <ul className="space-y-2.5 text-sm text-[#F4EFE6]/75">
                <li>100% Solar-Powered Suites</li>
                <li>African &amp; Continental Dining</li>
                <li>Outdoor Bar &amp; Weekend Bonfire</li>
                <li>Private Retreats &amp; Banqueting</li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-bold mb-4 text-xs uppercase tracking-[0.2em] text-[#E8A574]">Concierge</h4>
              <div className="space-y-2 text-sm text-[#F4EFE6]/75">
                <p className="font-semibold text-[#FAF7F2]">0807 453 8555</p>
                <p>osiekaresort@gmail.com</p>
                <p>Ayeromi, Ogori 263103, Kogi State</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between text-[#F4EFE6]/55 text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} Osieka Resort. All rights reserved.</p>
            <Link
              href="/crm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("hosos_active_user")
                }
                fetch("/api/auth/logout", { method: "POST" }).catch(() => { })
              }}
              aria-label="CRM Auth"
              title="Staff Portal"
              className="text-[#F4EFE6]/50 hover:text-[#D97736] transition-colors p-2.5 rounded-full hover:bg-[#3D2516] inline-flex items-center justify-center"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialRoomType={selectedRoomType}
        initialCheckIn={quickCheckIn}
        initialCheckOut={quickCheckOut}
      />
      <Toaster />
    </div>
  )
}

export default function OsiekaResort() {
  return (
    <QueryClientProvider client={queryClient}>
      <OsiekaResortContent />
    </QueryClientProvider>
  )
}
