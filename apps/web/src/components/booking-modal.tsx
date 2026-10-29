"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Users,
  Mail,
  Phone,
  User,
  Home,
  ShieldAlert,
  CheckCircle2,
  MessageSquare,
  Building2,
  Copy,
  Check,
  Sparkles,
  Sun,
  Minus,
  Plus,
  Crown,
  BedDouble,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  initialRoomType?: string
  initialCheckIn?: string
  initialCheckOut?: string
}

interface BookingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  roomType: "standard" | "vip"
  numberOfRooms: number
  guests: number
  specialRequests: string
  paymentReference: string
}

const ROOM_TIERS = {
  standard: {
    id: "standard" as const,
    name: "Standard Room",
    price: 10000,
    badge: "Serene Comfort",
    image: "/14.jpg",
    description:
      "Ideal for solo travelers and business guests. Features a plush double bed, 100% solar-powered inverter air conditioning, flat-screen satellite TV, and a serene private bathroom.",
    features: [
      "100% Off-Grid Solar Power",
      "Solar Inverter AC",
      "Room Service",
      "En-Suite Bath",
    ],
  },
  vip: {
    id: "vip" as const,
    name: "Executive VIP Suite",
    price: 15000,
    badge: "Most Popular",
    image: "/16.jpg",
    description:
      "Our most spacious suite tailored for couples, VIP guests, and weekend retreats. Includes executive king bedding, priority dining & bar room service, 100% solar inverter AC, and tranquil views.",
    features: [
      "Spacious Executive Layout",
      "24/7 Off-Grid Solar AC & TV",
      "Priority VIP Concierge",
      "Luxury En-Suite",
    ],
  },
}

function getTodayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getNextDayIso(fromDateIso: string, daysToAdd = 1): string {
  const base = fromDateIso ? new Date(`${fromDateIso}T00:00:00`) : new Date()
  if (Number.isNaN(base.getTime())) {
    const fallback = new Date()
    fallback.setDate(fallback.getDate() + daysToAdd)
    return fallback.toISOString().split("T")[0]
  }
  base.setDate(base.getDate() + daysToAdd)
  const year = base.getFullYear()
  const month = String(base.getMonth() + 1).padStart(2, "0")
  const day = String(base.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function normalizeRoomKey(val?: string): "standard" | "vip" {
  if (!val) return "standard"
  const lower = val.toLowerCase()
  if (lower.includes("vip") || lower.includes("executive") || lower.includes("suite")) {
    return "vip"
  }
  return "standard"
}

export function BookingModal({
  isOpen,
  onClose,
  initialRoomType,
  initialCheckIn,
  initialCheckOut,
}: BookingModalProps) {
  const todayIso = useMemo(() => getTodayIso(), [])
  const tomorrowIso = useMemo(() => getNextDayIso(todayIso, 1), [todayIso])

  const [copiedAccount, setCopiedAccount] = useState(false)
  const [confirmedReservationNumber, setConfirmedReservationNumber] = useState<string | null>(null)

  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: initialCheckIn || todayIso,
    checkOut: initialCheckOut || tomorrowIso,
    roomType: normalizeRoomKey(initialRoomType),
    numberOfRooms: 1,
    guests: 2,
    specialRequests: "",
    paymentReference: "",
  })

  useEffect(() => {
    const resolvedCheckIn = initialCheckIn && initialCheckIn.trim() ? initialCheckIn : todayIso
    let resolvedCheckOut =
      initialCheckOut && initialCheckOut.trim() ? initialCheckOut : getNextDayIso(resolvedCheckIn, 1)

    if (new Date(resolvedCheckOut) <= new Date(resolvedCheckIn)) {
      resolvedCheckOut = getNextDayIso(resolvedCheckIn, 1)
    }

    setBookingData((prev) => ({
      ...prev,
      roomType: initialRoomType ? normalizeRoomKey(initialRoomType) : prev.roomType,
      checkIn: resolvedCheckIn,
      checkOut: resolvedCheckOut,
    }))
  }, [initialRoomType, initialCheckIn, initialCheckOut, todayIso, isOpen])

  const selectedTier = ROOM_TIERS[bookingData.roomType] || ROOM_TIERS.standard

  const nightsCount = useMemo(() => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 1
    const start = new Date(`${bookingData.checkIn}T00:00:00`)
    const end = new Date(`${bookingData.checkOut}T00:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }, [bookingData.checkIn, bookingData.checkOut])

  const ratePerNight = selectedTier.price
  const totalAmount = nightsCount * ratePerNight * bookingData.numberOfRooms

  const handleCheckInChange = (newCheckIn: string) => {
    let nextCheckOut = bookingData.checkOut
    if (!nextCheckOut || new Date(nextCheckOut) <= new Date(newCheckIn)) {
      nextCheckOut = getNextDayIso(newCheckIn, 1)
    }
    setBookingData((prev) => ({
      ...prev,
      checkIn: newCheckIn,
      checkOut: nextCheckOut,
    }))
  }

  const handleCheckOutChange = (newCheckOut: string) => {
    if (bookingData.checkIn && new Date(newCheckOut) <= new Date(bookingData.checkIn)) {
      const corrected = getNextDayIso(bookingData.checkIn, 1)
      setBookingData((prev) => ({ ...prev, checkOut: corrected }))
      return
    }
    setBookingData((prev) => ({ ...prev, checkOut: newCheckOut }))
  }

  const createReservationInCRM = useMutation({
    mutationFn: async (payload: BookingData & { openWhatsApp?: boolean }) => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          guestName: `${payload.firstName} ${payload.lastName}`.trim(),
          guestPhone: payload.phone.trim(),
          guestEmail: payload.email.trim(),
          checkInDate: payload.checkIn,
          checkOutDate: payload.checkOut,
          roomType: ROOM_TIERS[payload.roomType].name,
          ratePerNight: ROOM_TIERS[payload.roomType].price,
          numberOfRooms: payload.numberOfRooms,
          guestsCount: payload.guests,
          totalAmount: nightsCount * ROOM_TIERS[payload.roomType].price * payload.numberOfRooms,
          depositPaid: 0,
          paymentConfirmed: false,
          source: "WEBSITE_BOOKING",
          specialRequests: [
            payload.specialRequests.trim(),
            payload.paymentReference.trim() ? `Transfer/Payment Note: ${payload.paymentReference.trim()}` : "",
          ]
            .filter(Boolean)
            .join(" | "),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save reservation")
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      const resNo = data?.reservation?.reservationNumber || `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`
      setConfirmedReservationNumber(resNo)

      if (variables.openWhatsApp) {
        openWhatsAppConfirmation(resNo)
      }

      toast({
        title: "Reservation Logged in Osieka Resort System!",
        description: `Booking Ref: ${resNo}. Remember: Reservations are only honoured and kept after payment verification.`,
      })
    },
    onError: (err: any) => {
      toast({
        title: "Reservation Error",
        description: err?.message || "Could not submit reservation. Please try again.",
        variant: "destructive",
      })
    },
  })

  const openWhatsAppConfirmation = (resNumber?: string) => {
    const refCode = resNumber || confirmedReservationNumber || "PENDING"
    const message = `
*OSIEKA RESORT — RESERVATION & PAYMENT CONFIRMATION*
Booking Ref: *${refCode}*
Guest Name: ${bookingData.firstName} ${bookingData.lastName}
Phone: ${bookingData.phone}
${bookingData.email ? `Email: ${bookingData.email}` : ""}
Check-in: ${bookingData.checkIn}
Check-out: ${bookingData.checkOut} (${nightsCount} Night${nightsCount > 1 ? "s" : ""})
Accommodation: ${selectedTier.name} (${bookingData.numberOfRooms} Room${bookingData.numberOfRooms > 1 ? "s" : ""})
Guests: ${bookingData.guests}
Rate Breakdown: ₦${ratePerNight.toLocaleString()} × ${nightsCount} Night${nightsCount > 1 ? "s" : ""} × ${bookingData.numberOfRooms} Room${bookingData.numberOfRooms > 1 ? "s" : ""}
${bookingData.paymentReference ? `Payment Ref / Note: ${bookingData.paymentReference}` : ""}
${bookingData.specialRequests ? `Special Requests: ${bookingData.specialRequests}` : ""}
*Total Amount Due:* ₦${totalAmount.toLocaleString()}
---
_I understand that my reservation is only honoured and kept after payment confirmation. Please find my booking details above._
    `.trim()

    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = "2348074538555"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  const handleSubmitReservation = (openWhatsApp: boolean) => {
    if (!bookingData.firstName.trim() || !bookingData.lastName.trim() || !bookingData.phone.trim()) {
      toast({
        title: "Guest Contact Required",
        description: "Please enter your First Name, Last Name, and active WhatsApp/Phone Number so our concierge can confirm your room hold.",
        variant: "destructive",
      })
      return
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast({
        title: "Stay Dates Required",
        description: "Please select your check-in and check-out dates.",
        variant: "destructive",
      })
      return
    }

    createReservationInCRM.mutate({
      ...bookingData,
      openWhatsApp,
    })
  }

  const handleResetAndClose = () => {
    onClose()
    setTimeout(() => {
      setConfirmedReservationNumber(null)
    }, 200)
  }

  const copyReservationsLine = () => {
    navigator.clipboard?.writeText("08074538555")
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-[960px] w-[95vw] max-h-[92vh] overflow-y-auto p-0 border border-[#3D2516]/25 bg-[#FAF7F2] text-[#3D2516] shadow-2xl rounded-3xl">
        {/* Cohesive Osieka Resort Header */}
        <div
          className="text-[#FAF7F2] px-6 sm:px-8 py-5 rounded-t-3xl border-b border-[#D97736]/35"
          style={{
            background: "linear-gradient(135deg, #23140B 0%, #3D2516 60%, #2F594E 100%)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center justify-between gap-4 text-[#FAF7F2]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F4EFE6] p-0.5 shrink-0 border-2 border-[#D97736]/60 shadow-md">
                  <Image
                    src="/osieka-logo.jpg"
                    alt="Osieka Resort"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8A574]">
                    <Sun className="w-3.5 h-3.5 text-[#D97736]" /> 100% Off-Grid Solar Sanctuary • Ogori, Kogi State
                  </div>
                  <span className="font-osieka-serif text-xl sm:text-2xl font-bold tracking-tight block mt-0.5">
                    {confirmedReservationNumber ? "Reservation Logged in Hospitality Hub" : "Reserve Your Stay at Osieka Resort"}
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 bg-[#FAF7F2]/10 border border-[#D97736]/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#F4EFE6]">
                <ShieldAlert className="w-4 h-4 text-[#D97736]" />
                <span>Honoured &amp; Kept Upon Payment</span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Confirmed State */}
        {confirmedReservationNumber ? (
          <div className="p-6 sm:p-10 text-center space-y-6 bg-[#FAF7F2]">
            <div className="w-16 h-16 bg-[#437A6C]/15 text-[#437A6C] rounded-full flex items-center justify-center mx-auto border-2 border-[#437A6C]/30 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-xs font-extrabold uppercase tracking-[0.2em] text-[#2F594E] bg-[#437A6C]/15 border border-[#437A6C]/30 px-4 py-1.5 rounded-full">
                Booking Reference: {confirmedReservationNumber}
              </span>
              <h3 className="font-osieka-serif text-2xl sm:text-3xl font-bold text-[#23140B] pt-1">
                Your Stay Request Has Been Logged!
              </h3>
              <p className="text-sm text-[#5C402B] max-w-xl mx-auto leading-relaxed">
                We have registered your reservation for{" "}
                <strong className="text-[#23140B]">
                  {bookingData.numberOfRooms} × {selectedTier.name}
                </strong>{" "}
                ({bookingData.checkIn} to {bookingData.checkOut} • {nightsCount}{" "}
                {nightsCount === 1 ? "Night" : "Nights"}) in our <strong>Hospitality Hub</strong>.
              </p>
            </div>

            {/* Itemized Receipt Box */}
            <div className="max-w-lg mx-auto bg-[#F4EFE6] border border-[#3D2516]/15 rounded-2xl p-5 text-left space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-[#5C402B]">
                <span>Guest Name &amp; Contact:</span>
                <span className="font-bold text-[#23140B]">
                  {bookingData.firstName} {bookingData.lastName} ({bookingData.phone})
                </span>
              </div>
              <div className="flex justify-between text-[#5C402B]">
                <span>Accommodation Tier:</span>
                <span className="font-bold text-[#23140B]">{selectedTier.name}</span>
              </div>
              <div className="flex justify-between text-[#5C402B]">
                <span>Rate Calculation:</span>
                <span className="font-semibold text-[#23140B]">
                  ₦{ratePerNight.toLocaleString()} × {nightsCount} Night{nightsCount > 1 ? "s" : ""} ×{" "}
                  {bookingData.numberOfRooms} Room{bookingData.numberOfRooms > 1 ? "s" : ""}
                </span>
              </div>
              <div className="border-t border-[#3D2516]/15 pt-2.5 flex justify-between items-center">
                <span className="font-bold text-[#23140B]">Total Amount to Honour Stay:</span>
                <span className="text-xl font-extrabold text-[#D97736]">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="max-w-lg mx-auto bg-[#23140B] text-[#FAF7F2] border border-[#D97736]/40 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <div className="font-bold text-[#E8A574] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D97736]" /> Important Policy: Guaranteed After Payment
              </div>
              <p className="text-[#F4EFE6]/90 leading-relaxed">
                Please note that <strong>reservations are only honoured and kept after payment</strong>. Our concierge
                now holds your contact (<strong>{bookingData.phone}</strong>) and will call or WhatsApp you promptly to
                finalize your room lock.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={() => openWhatsAppConfirmation()}
                className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold gap-2 rounded-full px-7 py-6 shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                Send Payment / Confirm on WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleResetAndClose}
                className="border-[#3D2516]/30 text-[#3D2516] hover:bg-[#F4EFE6] rounded-full px-7 py-6 font-bold"
              >
                Return to Osieka Resort
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-7 space-y-6 bg-[#FAF7F2]">
            {/* Step 1: Choose Standard Room or Executive VIP Suite (Matches Landing Page Cards) */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#437A6C]">
                    1. Select Your Sanctuary Tier
                  </span>
                  <h3 className="font-osieka-serif text-lg sm:text-xl font-bold text-[#23140B]">
                    Standard Room or Executive VIP Suite
                  </h3>
                </div>
                <span className="text-xs text-[#6B4C35]">
                  Check-in from 2:00 PM • Check-out by 12:00 PM
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["standard", "vip"] as const).map((tierKey) => {
                  const tier = ROOM_TIERS[tierKey]
                  const isSelected = bookingData.roomType === tierKey
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setBookingData((prev) => ({ ...prev, roomType: tierKey }))}
                      className={`text-left rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? tierKey === "vip"
                            ? "border-[#D97736] bg-[#F4EFE6] shadow-lg ring-2 ring-[#D97736]/25"
                            : "border-[#437A6C] bg-[#F4EFE6] shadow-lg ring-2 ring-[#437A6C]/25"
                          : "border-[#3D2516]/15 bg-white hover:border-[#3D2516]/35"
                      }`}
                    >
                      <div>
                        {/* Compact Room Header with Real Photo */}
                        <div className="relative h-32 w-full overflow-hidden">
                          <Image src={tier.image} alt={tier.name} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#23140B]/85 via-[#23140B]/30 to-transparent" />
                          <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                tierKey === "vip"
                                  ? "bg-[#D97736] text-[#FAF7F2]"
                                  : "bg-[#437A6C] text-[#FAF7F2]"
                              }`}
                            >
                              {tier.badge}
                            </span>
                          </div>
                          <div className="absolute top-2.5 right-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                isSelected
                                  ? "bg-[#D97736] border-[#FAF7F2] text-[#FAF7F2]"
                                  : "bg-[#23140B]/50 border-[#FAF7F2]/50 text-transparent"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-[#FAF7F2]">
                            <div className="flex items-center gap-1.5">
                              {tierKey === "vip" ? (
                                <Crown className="w-4 h-4 text-[#E8A574]" />
                              ) : (
                                <BedDouble className="w-4 h-4 text-[#E8A574]" />
                              )}
                              <span className="font-osieka-serif text-lg font-bold">{tier.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-extrabold text-[#E8A574]">
                                ₦{tier.price.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-[#FAF7F2]/80 block">/ night</span>
                            </div>
                          </div>
                        </div>

                        {/* Exact Description & 4 Checkmarks */}
                        <div className="p-3.5 space-y-2.5">
                          <p className="text-xs text-[#5C402B] leading-relaxed">{tier.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tier.features.map((feat) => (
                              <span
                                key={feat}
                                className="text-[10px] font-semibold bg-[#FAF7F2] text-[#2F594E] border border-[#437A6C]/30 px-2.5 py-0.5 rounded-full"
                              >
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Two-Column Layout: Dates & Guest Form (Left) + Live Calculation & Payment Summary (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Columns: Dates, Room/Guest Steppers & Contact Info */}
              <div className="lg:col-span-7 space-y-5 bg-[#F4EFE6] p-5 rounded-2xl border border-[#3D2516]/12">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D97736]">
                    2. Stay Dates &amp; Guest Details
                  </span>
                  <h4 className="font-osieka-serif text-lg font-bold text-[#23140B]">
                    When Are You Visiting Osieka?
                  </h4>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="modalCheckIn" className="text-xs font-bold text-[#3D2516]">
                      Check-In Date *
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#D97736]" />
                      <Input
                        id="modalCheckIn"
                        type="date"
                        min={todayIso}
                        className="pl-9 h-10 bg-[#FAF7F2] border-[#3D2516]/20 text-[#23140B] font-semibold rounded-xl"
                        value={bookingData.checkIn}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="modalCheckOut" className="text-xs font-bold text-[#3D2516]">
                      Check-Out Date * ({nightsCount} {nightsCount === 1 ? "Night" : "Nights"})
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#437A6C]" />
                      <Input
                        id="modalCheckOut"
                        type="date"
                        min={getNextDayIso(bookingData.checkIn, 1)}
                        className="pl-9 h-10 bg-[#FAF7F2] border-[#3D2516]/20 text-[#23140B] font-semibold rounded-xl"
                        value={bookingData.checkOut}
                        onChange={(e) => handleCheckOutChange(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Tactile Steppers for Number of Rooms & Guests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#3D2516]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#D97736]" />
                      <div>
                        <div className="text-xs font-bold text-[#23140B]">Number of Rooms</div>
                        <div className="text-[10px] text-[#6B4C35]">Multiplies nightly rate</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setBookingData((prev) => ({
                            ...prev,
                            numberOfRooms: Math.max(1, prev.numberOfRooms - 1),
                          }))
                        }
                        className="w-7 h-7 rounded-full bg-[#F4EFE6] border border-[#3D2516]/20 flex items-center justify-center text-[#23140B] hover:bg-[#D97736] hover:text-white transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-sm text-[#23140B]">
                        {bookingData.numberOfRooms}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setBookingData((prev) => ({
                            ...prev,
                            numberOfRooms: Math.min(12, prev.numberOfRooms + 1),
                          }))
                        }
                        className="w-7 h-7 rounded-full bg-[#F4EFE6] border border-[#3D2516]/20 flex items-center justify-center text-[#23140B] hover:bg-[#D97736] hover:text-white transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#3D2516]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#437A6C]" />
                      <div>
                        <div className="text-xs font-bold text-[#23140B]">Total Guests</div>
                        <div className="text-[10px] text-[#6B4C35]">Adults &amp; companions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setBookingData((prev) => ({
                            ...prev,
                            guests: Math.max(1, prev.guests - 1),
                          }))
                        }
                        className="w-7 h-7 rounded-full bg-[#F4EFE6] border border-[#3D2516]/20 flex items-center justify-center text-[#23140B] hover:bg-[#437A6C] hover:text-white transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-sm text-[#23140B]">
                        {bookingData.guests}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setBookingData((prev) => ({
                            ...prev,
                            guests: Math.min(20, prev.guests + 1),
                          }))
                        }
                        className="w-7 h-7 rounded-full bg-[#F4EFE6] border border-[#3D2516]/20 flex items-center justify-center text-[#23140B] hover:bg-[#437A6C] hover:text-white transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Guest Contact Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-xs font-bold text-[#3D2516]">
                      First Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-[#6B4C35]" />
                      <Input
                        id="firstName"
                        placeholder="e.g. Adewale"
                        className="pl-9 h-10 bg-[#FAF7F2] border-[#3D2516]/20 text-[#23140B] rounded-xl"
                        value={bookingData.firstName}
                        onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-xs font-bold text-[#3D2516]">
                      Last Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-[#6B4C35]" />
                      <Input
                        id="lastName"
                        placeholder="e.g. Johnson"
                        className="pl-9 h-10 bg-[#FAF7F2] border-[#3D2516]/20 text-[#23140B] rounded-xl"
                        value={bookingData.lastName}
                        onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs font-bold text-[#3D2516]">
                      Active Phone / WhatsApp *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#437A6C]" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. 0803 123 4567"
                        className="pl-9 h-10 bg-[#FAF7F2] border-[#3D2516]/20 text-[#23140B] rounded-xl"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-bold text-[#3D2516]">
                      Email Address (Optional)
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#6B4C35]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-9 h-10 bg-[#FAF7F2] border-[#3D2516]/20 text-[#23140B] rounded-xl"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="specialRequests" className="text-xs font-bold text-[#3D2516]">
                    Special Requests / Arrival Notes (Optional)
                  </Label>
                  <Textarea
                    id="specialRequests"
                    rows={2}
                    className="bg-[#FAF7F2] border-[#3D2516]/20 text-[#23140B] rounded-xl text-xs"
                    placeholder="e.g. Late evening arrival, ground floor preference, dining table reservation..."
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  />
                </div>
              </div>

              {/* Right 5 Columns: Live Itemized Rate Math + Payment Guarantee Card */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className="rounded-2xl p-5 text-[#FAF7F2] shadow-xl border border-[#D97736]/40 space-y-4"
                  style={{
                    background: "linear-gradient(155deg, #23140B 0%, #3D2516 70%, #2F594E 100%)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#FAF7F2]/15 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A574] block">
                        Live Stay Summary
                      </span>
                      <h4 className="font-osieka-serif text-lg font-bold text-[#FAF7F2]">
                        {selectedTier.name}
                      </h4>
                    </div>
                    <span className="bg-[#D97736] text-[#FAF7F2] text-xs font-extrabold px-3 py-1 rounded-full">
                      ₦{ratePerNight.toLocaleString()}/night
                    </span>
                  </div>

                  {/* Transparent Math Breakdown */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-[#F4EFE6]/85">
                      <span>Check-In → Check-Out:</span>
                      <span className="font-bold text-[#FAF7F2]">
                        {bookingData.checkIn} → {bookingData.checkOut}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#F4EFE6]/85">
                      <span>Nightly Rate ({selectedTier.name}):</span>
                      <span className="font-semibold text-[#FAF7F2]">₦{ratePerNight.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#F4EFE6]/85">
                      <span>Duration of Stay:</span>
                      <span className="font-semibold text-[#FAF7F2]">
                        × {nightsCount} {nightsCount === 1 ? "Night" : "Nights"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#F4EFE6]/85">
                      <span>Rooms Reserved ({bookingData.guests} Guest{bookingData.guests > 1 ? "s" : ""}):</span>
                      <span className="font-semibold text-[#FAF7F2]">
                        × {bookingData.numberOfRooms} {bookingData.numberOfRooms === 1 ? "Room" : "Rooms"}
                      </span>
                    </div>

                    {/* Exact Formula Pill */}
                    <div className="bg-[#FAF7F2]/10 border border-[#E8A574]/30 rounded-xl p-3 flex items-center justify-between mt-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[#E8A574] font-bold">
                          Total Stay Calculation
                        </div>
                        <div className="text-[11px] text-[#F4EFE6]/90 font-mono mt-0.5">
                          ₦{ratePerNight.toLocaleString()} × {nightsCount}d × {bookingData.numberOfRooms}rm
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-[#E8A574]">
                        ₦{totalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Reservations & Payment Policy */}
                  <div className="bg-[#FAF7F2]/10 rounded-xl p-3.5 space-y-2.5 border border-[#FAF7F2]/15 text-xs">
                    <div className="flex items-center gap-1.5 text-[#E8A574] font-bold">
                      <Building2 className="w-4 h-4 text-[#D97736]" />
                      <span>Honoured &amp; Kept After Payment</span>
                    </div>
                    <p className="text-[11px] text-[#F4EFE6]/85 leading-relaxed">
                      Submitting logs your booking in our <strong>Hospitality Hub</strong>. Confirm payment via
                      WhatsApp now or let our concierge call/text you with account details.
                    </p>
                    <div className="flex items-center justify-between bg-[#23140B]/70 px-3 py-2 rounded-lg border border-[#FAF7F2]/10">
                      <div>
                        <div className="text-[10px] text-[#E8A574]">Reservations Desk Line</div>
                        <div className="font-mono text-xs font-bold text-[#FAF7F2]">+234 807 453 8555</div>
                      </div>
                      <button
                        type="button"
                        onClick={copyReservationsLine}
                        className="inline-flex items-center gap-1 bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] px-2.5 py-1 rounded-md text-[11px] font-bold transition"
                      >
                        {copiedAccount ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedAccount ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="pt-1">
                      <Input
                        placeholder="Optional: Transfer ref or payment note..."
                        className="h-8 bg-[#FAF7F2] text-[#23140B] text-xs border-0 rounded-lg placeholder:text-[#6B4C35]/70"
                        value={bookingData.paymentReference}
                        onChange={(e) => setBookingData({ ...bookingData, paymentReference: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Primary & Secondary Action Buttons */}
                  <div className="space-y-2.5 pt-1">
                    <Button
                      type="button"
                      onClick={() => handleSubmitReservation(true)}
                      disabled={createReservationInCRM.isPending}
                      className="w-full bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold py-6 rounded-full gap-2 shadow-lg text-xs sm:text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {createReservationInCRM.isPending
                        ? "Logging Reservation..."
                        : `Reserve & Confirm on WhatsApp (₦${totalAmount.toLocaleString()})`}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSubmitReservation(false)}
                      disabled={createReservationInCRM.isPending}
                      className="w-full bg-transparent border border-[#E8A574]/50 text-[#FAF7F2] hover:bg-[#FAF7F2]/10 font-bold py-5 rounded-full text-xs gap-1.5"
                    >
                      Log Booking in Hub (Call/Text Me to Pay) <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
