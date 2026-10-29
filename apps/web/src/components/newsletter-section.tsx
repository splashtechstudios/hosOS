"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, User, Sparkles } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const subscribeToNewsletter = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await fetch("/api/newsletter-subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to subscribe to newsletter")
      }

      return response.json()
    },
    onSuccess: () => {
      const message = `
Newsletter Subscription — Osieka Resort:
Name: ${name}
Email: ${email}
---
Please add me to Osieka Resort's exclusive offers and weekend event updates.
      `.trim()

      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = "2348074538555"
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      window.open(whatsappUrl, "_blank")

      toast({
        title: "Welcome to the Osieka Circle!",
        description: "Thank you for subscribing to our resort updates and seasonal offers.",
      })
      setEmail("")
      setName("")
    },
    onError: () => {
      toast({
        title: "Subscription Notice",
        description: "Please try again or reach us directly on WhatsApp.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) {
      toast({
        title: "Missing Information",
        description: "Please enter both your name and email address.",
        variant: "destructive",
      })
      return
    }

    subscribeToNewsletter.mutate({ name, email })
  }

  return (
    <section
      className="py-20 relative overflow-hidden border-y border-[#3D2516]/15"
      style={{
        background: "linear-gradient(135deg, #2F594E 0%, #437A6C 55%, #23140B 100%)",
      }}
    >
      <div className="osieka-container relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F4EFE6] bg-[#23140B]/30 border border-[#F4EFE6]/20 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#D97736]" />
              The Osieka Dispatch
            </div>
            <h2 className="font-osieka-serif text-3xl sm:text-4xl font-bold text-[#FAF7F2] leading-tight">
              Stay Connected With Osieka Resort
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE6]/85 leading-relaxed">
              Receive invitations to weekend bonfire nights, seasonal dining specials, and privileged suite rates in
              Ogori.
            </p>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-[#FAF7F2]/10 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-[#FAF7F2]/20"
            >
              <div className="grid sm:grid-cols-12 gap-3.5 items-center">
                <div className="relative sm:col-span-4">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B4C35]" />
                  <Input
                    type="text"
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 bg-[#FAF7F2] text-[#3D2516] border-[#E6DEC8] placeholder:text-[#6B4C35]/60 rounded-xl"
                    required
                  />
                </div>
                <div className="relative sm:col-span-5">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B4C35]" />
                  <Input
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-[#FAF7F2] text-[#3D2516] border-[#E6DEC8] placeholder:text-[#6B4C35]/60 rounded-xl"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 bg-[#D97736] hover:bg-[#C06225] text-[#FAF7F2] font-bold rounded-xl shadow-md whitespace-nowrap"
                    disabled={subscribeToNewsletter.isPending}
                  >
                    {subscribeToNewsletter.isPending ? "Joining..." : "Join List"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
