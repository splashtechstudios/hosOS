"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  CalendarDays,
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
  roomType: string
  numberOfRooms: string
  guests: string
  specialRequests: string
  paymentReference: string
  totalAmount: number
}

export function BookingModal({
  isOpen,
  onClose,
  initialRoomType,
  initialCheckIn,
  initialCheckOut,
}: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [confirmedReservationNumber, setConfirmedReservationNumber] = useState<string | null>(null)

  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: initialCheckIn || "",
    checkOut: initialCheckOut || "",
    roomType: initialRoomType || "standard",
    numberOfRooms: "1",
    guests: "2",
    specialRequests: "",
    paymentReference: "",
    totalAmount: 0,
  })

  useEffect(() => {
    setBookingData((prev) => ({
      ...prev,
      roomType: initialRoomType || prev.roomType || "standard",
      checkIn: initialCheckIn !== undefined ? initialCheckIn : prev.checkIn,
      checkOut: initialCheckOut !== undefined ? initialCheckOut : prev.checkOut,
    }))
  }, [initialRoomType, initialCheckIn, initialCheckOut])

  const roomPrices = {
    standard: 10000,
    vip: 15000,
  }

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    return Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.roomType) return 0
    const nights = calculateNights()
    const roomPrice = roomPrices[bookingData.roomType as keyof typeof roomPrices] || 10000
    const numberOfRooms = Number.parseInt(bookingData.numberOfRooms) || 1
    return nights * roomPrice * numberOfRooms
  }

  const getRoomTypeDisplay = (roomType: string) => {
    switch (roomType) {
      case "standard":
        return "Standard Room"
      case "vip":
        return "VIP Suite"
      default:
        return roomType
    }
  }

  const createReservationInCRM = useMutation({
    mutationFn: async (payload: BookingData & { paymentConfirmed?: boolean; openWhatsApp?: boolean }) => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: payload.firstName,
          lastName: payload.lastName,
          guestName: `${payload.firstName} ${payload.lastName}`.trim(),
          guestPhone: payload.phone,
          guestEmail: payload.email,
          checkInDate: payload.checkIn,
          checkOutDate: payload.checkOut,
          roomType: getRoomTypeDisplay(payload.roomType),
          ratePerNight: roomPrices[payload.roomType as keyof typeof roomPrices] || 10000,
          numberOfRooms: Number(payload.numberOfRooms) || 1,
          guestsCount: Number(payload.guests) || 1,
          totalAmount: payload.totalAmount,
          depositPaid: payload.paymentConfirmed ? payload.totalAmount : 0,
          paymentConfirmed: Boolean(payload.paymentConfirmed),
          source: "WEBSITE_BOOKING",
          specialRequests: [
            payload.specialRequests,
            payload.paymentReference ? `Transfer/Payment Note: ${payload.paymentReference}` : "",
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
      setStep(4)

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
Email: ${bookingData.email}
Check-in: ${bookingData.checkIn}
Check-out: ${bookingData.checkOut} (${calculateNights()} Night(s))
Accommodation: ${getRoomTypeDisplay(bookingData.roomType)} (${bookingData.numberOfRooms} Room(s))
Guests: ${bookingData.guests}
${bookingData.paymentReference ? `Payment Ref / Note: ${bookingData.paymentReference}` : ""}
${bookingData.specialRequests ? `Special Requests: ${bookingData.specialRequests}` : ""}
*Total Amount:* ₦${calculateTotal().toLocaleString()}
---
_I understand that my reservation is only honoured and kept after payment confirmation. Please find my booking details above._
    `.trim()

    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = "2348074538555"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  const handleSubmitReservation = (openWhatsApp: boolean) => {
    const total = calculateTotal()
    createReservationInCRM.mutate({
      ...bookingData,
      totalAmount: total,
      paymentConfirmed: false,
      openWhatsApp,
    })
  }

  const handleResetAndClose = () => {
    onClose()
    setTimeout(() => {
      setStep(1)
      setConfirmedReservationNumber(null)
      setBookingData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        checkIn: initialCheckIn || "",
        checkOut: initialCheckOut || "",
        roomType: initialRoomType || "standard",
        numberOfRooms: "1",
        guests: "2",
        specialRequests: "",
        paymentReference: "",
        totalAmount: 0,
      })
    }, 200)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!bookingData.firstName.trim() || !bookingData.lastName.trim() || !bookingData.phone.trim()) {
        toast({
          title: "Missing Guest Details",
          description: "Please provide your First Name, Last Name, and active WhatsApp/Phone Number for follow-up.",
          variant: "destructive",
        })
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.roomType) {
        toast({
          title: "Missing Stay Details",
          description: "Please select your check-in date, check-out date, and preferred room type.",
          variant: "destructive",
        })
        return
      }

      const checkIn = new Date(bookingData.checkIn)
      const checkOut = new Date(bookingData.checkOut)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (checkIn < today) {
        toast({
          title: "Invalid Check-in Date",
          description: "Check-in date cannot be in the past.",
          variant: "destructive",
        })
        return
      }

      if (checkOut <= checkIn) {
        toast({
          title: "Invalid Check-out Date",
          description: "Check-out date must be after check-in date.",
          variant: "destructive",
        })
        return
      }
      setStep(3)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const copyBankDetails = () => {
    navigator.clipboard?.writeText("08074538555")
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-[580px] max-h-[92vh] overflow-y-auto p-0 border border-[#3D2516]/20 bg-[#FAF7F2] text-[#3D2516] shadow-2xl rounded-2xl">
        {/* Top Osieka Espresso & Sunset Terracotta Header */}
        <div
          className="text-[#FAF7F2] p-6 rounded-t-2xl border-b border-[#D97736]/30"
          style={{
            background: "linear-gradient(135deg, #23140B 0%, #3D2516 65%, #2F594E 100%)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-[#FAF7F2] text-xl font-bold">
              <span className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F4EFE6] p-0.5 shrink-0 border border-[#D97736]/50">
                  <Image
                    src="/osieka-logo.jpg"
                    alt="Osieka Resort"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="font-osieka-serif text-xl sm:text-2xl">
                  {step === 4 ? "Reservation Logged" : "Reserve Your Stay"}
                </span>
              </span>
              {step < 4 && (
                <span className="text-[11px] font-bold uppercase tracking-widest bg-[#D97736] px-3 py-1 rounded-full text-[#FAF7F2]">
                  Step {step} of 3
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Stepper Bar */}
          {step < 4 && (
            <div className="grid grid-cols-3 gap-2.5 mt-5">
              {[
                { num: 1, label: "1. Guest Contact" },
                { num: 2, label: "2. Dates & Suite" },
                { num: 3, label: "3. Payment Honour" },
              ].map((s) => (
                <div key={s.num} className="flex flex-col gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      step >= s.num ? "bg-[#D97736]" : "bg-[#FAF7F2]/20"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-semibold ${
                      step >= s.num ? "text-[#E8A574]" : "text-[#FAF7F2]/50"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5 bg-[#FAF7F2]">
          {/* Mandatory Reservation Policy Banner */}
          <div className="bg-[#F4EFE6] border border-[#D97736]/45 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#D97736] shrink-0 mt-0.5" />
            <div className="text-xs text-[#3D2516] leading-relaxed">
              <strong className="font-bold block text-[#23140B] mb-0.5">
                Important Policy: Reservations Are Only Honoured &amp; Kept After Payment
              </strong>
              Unpaid bookings are held provisionally in our Hospitality Hub for concierge follow-up and are officially
              guaranteed once payment is confirmed.
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-osieka-serif text-lg font-bold text-[#23140B]">Guest Contact Information</h3>
                <p className="text-xs text-[#6B4C35]">
                  Our Hospitality Hub concierge holds your WhatsApp &amp; phone number for immediate confirmation
                  follow-up.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-[#3D2516]">
                    First Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#6B4C35]" />
                    <Input
                      id="firstName"
                      placeholder="e.g. Adewale"
                      className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]"
                      value={bookingData.firstName}
                      onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-[#3D2516]">
                    Last Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#6B4C35]" />
                    <Input
                      id="lastName"
                      placeholder="e.g. Johnson"
                      className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]"
                      value={bookingData.lastName}
                      onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-[#3D2516]">
                  Active Phone / WhatsApp Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-[#437A6C]" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 0803 123 4567 or +234 803 123 4567"
                    className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-[#6B4C35]">
                  Used by our Front Desk to call or WhatsApp you to finalize your room hold.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-[#3D2516]">
                  Email Address (Optional)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6B4C35]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleNext}
                  className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] px-7 font-bold rounded-full"
                >
                  Continue to Stay Details
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-osieka-serif text-lg font-bold text-[#23140B]">Select Dates &amp; Room Preference</h3>
                <p className="text-xs text-[#6B4C35]">Check-in from 2:00 PM • Check-out by 12:00 PM</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="checkIn" className="text-xs font-semibold text-[#3D2516]">
                    Check-in Date *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#6B4C35]" />
                    <Input
                      id="checkIn"
                      type="date"
                      className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkOut" className="text-xs font-semibold text-[#3D2516]">
                    Check-out Date *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#6B4C35]" />
                    <Input
                      id="checkOut"
                      type="date"
                      className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roomType" className="text-xs font-semibold text-[#3D2516]">
                  Accommodation Category *
                </Label>
                <Select
                  value={bookingData.roomType}
                  onValueChange={(value) => setBookingData({ ...bookingData, roomType: value })}
                >
                  <SelectTrigger className="h-10 bg-white border-[#E6DEC8] text-[#3D2516]">
                    <SelectValue placeholder="Select room category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Room — ₦10,000 / night</SelectItem>
                    <SelectItem value="vip">VIP Suite — ₦15,000 / night</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="numberOfRooms" className="text-xs font-semibold text-[#3D2516]">
                    Number of Rooms
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-[#6B4C35] z-10" />
                    <Select
                      value={bookingData.numberOfRooms}
                      onValueChange={(value) => setBookingData({ ...bookingData, numberOfRooms: value })}
                    >
                      <SelectTrigger className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} {n === 1 ? "Room" : "Rooms"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guests" className="text-xs font-semibold text-[#3D2516]">
                    Number of Guests
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-[#6B4C35] z-10" />
                    <Select
                      value={bookingData.guests}
                      onValueChange={(value) => setBookingData({ ...bookingData, guests: value })}
                    >
                      <SelectTrigger className="pl-9 h-10 bg-white border-[#E6DEC8] text-[#3D2516]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                          <SelectItem key={g} value={String(g)}>
                            {g === 10 ? "10+ Guests" : `${g} ${g === 1 ? "Guest" : "Guests"}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specialRequests" className="text-xs font-semibold text-[#3D2516]">
                  Special Requests (Optional)
                </Label>
                <Textarea
                  id="specialRequests"
                  rows={2}
                  className="bg-white border-[#E6DEC8] text-[#3D2516]"
                  placeholder="e.g. Early check-in request, dietary preference, ground floor..."
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                />
              </div>

              {bookingData.roomType && bookingData.checkIn && bookingData.checkOut && calculateTotal() > 0 && (
                <div className="bg-[#F4EFE6] border border-[#437A6C]/40 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#437A6C] uppercase tracking-wider">
                      Estimated Total ({calculateNights()} {calculateNights() === 1 ? "Night" : "Nights"})
                    </div>
                    <div className="text-xs text-[#6B4C35]">
                      {bookingData.numberOfRooms} × {getRoomTypeDisplay(bookingData.roomType)}
                    </div>
                  </div>
                  <div className="text-xl font-extrabold text-[#23140B]">
                    ₦{calculateTotal().toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-[#3D2516]/30 text-[#3D2516] hover:bg-[#F4EFE6] rounded-full px-6"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] px-7 font-bold rounded-full"
                >
                  Review &amp; Payment Options
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-[#F4EFE6] border border-[#E6DEC8] p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B4C35]">Guest Name:</span>
                  <span className="font-bold text-[#23140B]">
                    {bookingData.firstName} {bookingData.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4C35]">Phone / WhatsApp:</span>
                  <span className="font-bold text-[#437A6C]">{bookingData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4C35]">Stay Dates:</span>
                  <span className="font-semibold text-[#23140B]">
                    {bookingData.checkIn} → {bookingData.checkOut} ({calculateNights()} Night
                    {calculateNights() > 1 ? "s" : ""})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B4C35]">Accommodation:</span>
                  <span className="font-semibold text-[#23140B]">
                    {bookingData.numberOfRooms} × {getRoomTypeDisplay(bookingData.roomType)} ({bookingData.guests}{" "}
                    Guest{Number(bookingData.guests) > 1 ? "s" : ""})
                  </span>
                </div>
                <div className="border-t border-[#E6DEC8] pt-2.5 mt-2 flex justify-between items-center">
                  <span className="font-bold text-[#23140B]">Total Amount Due:</span>
                  <span className="text-xl font-extrabold text-[#D97736]">
                    ₦{calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Instructions Box */}
              <div className="bg-[#23140B] text-[#FAF7F2] p-4 rounded-xl space-y-3 border border-[#D97736]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D97736]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E8A574]">
                      How to Honour &amp; Guarantee Your Reservation
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#F4EFE6]/90 leading-relaxed">
                  Because rooms are <strong>only honoured and kept after payment</strong>, submitting this booking
                  immediately alerts our <strong>Hospitality Hub Concierge</strong>. You can either send your payment
                  confirmation directly on WhatsApp now, or our team will call/WhatsApp you at{" "}
                  <strong className="text-[#E8A574]">{bookingData.phone}</strong> with instant payment details.
                </p>

                <div className="bg-[#FAF7F2]/10 rounded-lg p-3 flex items-center justify-between text-xs border border-[#FAF7F2]/15">
                  <div>
                    <div className="text-[#E8A574] font-semibold">Reservations &amp; Payment Desk Line</div>
                    <div className="font-mono text-sm font-bold text-[#FAF7F2] mt-0.5">+234 807 453 8555</div>
                  </div>
                  <button
                    type="button"
                    onClick={copyBankDetails}
                    className="inline-flex items-center gap-1.5 bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] px-3 py-1.5 rounded-md text-xs font-semibold transition"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAccount ? "Copied" : "Copy Line"}
                  </button>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="paymentRef" className="text-[11px] text-[#E8A574]">
                    Optional: Transfer Reference or Payment Note (if already paid)
                  </Label>
                  <Input
                    id="paymentRef"
                    placeholder="e.g. Transferred via GTBank / Requesting account details on WhatsApp"
                    className="h-9 bg-[#FAF7F2] text-[#23140B] text-xs border-[#E6DEC8]"
                    value={bookingData.paymentReference}
                    onChange={(e) => setBookingData({ ...bookingData, paymentReference: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={createReservationInCRM.isPending}
                  className="border-[#3D2516]/30 text-[#3D2516] hover:bg-[#F4EFE6] rounded-full"
                >
                  Back
                </Button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmitReservation(false)}
                    disabled={createReservationInCRM.isPending}
                    className="border-[#437A6C] text-[#2F594E] hover:bg-[#437A6C]/10 text-xs font-bold rounded-full"
                  >
                    Log Booking (Call/Text Me to Pay)
                  </Button>
                  <Button
                    onClick={() => handleSubmitReservation(true)}
                    className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] text-xs font-bold gap-1.5 rounded-full"
                    disabled={createReservationInCRM.isPending}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {createReservationInCRM.isPending ? "Saving..." : "Submit & Confirm via WhatsApp"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 bg-[#437A6C]/15 text-[#437A6C] rounded-full flex items-center justify-center mx-auto border border-[#437A6C]/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2F594E] bg-[#437A6C]/15 border border-[#437A6C]/30 px-3.5 py-1 rounded-full">
                  Booking Reference: {confirmedReservationNumber}
                </span>
                <h3 className="font-osieka-serif text-2xl font-bold text-[#23140B] mt-3">
                  Reservation Logged for Payment Verification!
                </h3>
                <p className="text-sm text-[#6B4C35] mt-1 max-w-md mx-auto">
                  Your booking request for <strong>{getRoomTypeDisplay(bookingData.roomType)}</strong> (
                  {bookingData.checkIn} to {bookingData.checkOut}) has been received by our{" "}
                  <strong>Hospitality Hub</strong>.
                </p>
              </div>

              <div className="bg-[#F4EFE6] border border-[#D97736]/40 rounded-xl p-4 text-left text-xs text-[#3D2516] space-y-1.5">
                <div className="font-bold text-[#23140B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D97736]" /> Next Step to Lock &amp; Keep Your Room:
                </div>
                <p>
                  Remember that <strong>reservations are only honoured and kept after payment</strong>. Our concierge
                  now holds your contact (<strong>{bookingData.phone}</strong>) and will reach out via WhatsApp or call
                  to verify your payment of <strong>₦{calculateTotal().toLocaleString()}</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  onClick={() => openWhatsAppConfirmation()}
                  className="bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold gap-2 rounded-full px-6"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Payment / Chat on WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetAndClose}
                  className="border-[#3D2516]/30 text-[#3D2516] rounded-full px-6"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
