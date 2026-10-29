import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { EmailSubscriber, IEmailSubscriber } from "@/models/MessageBoard"
import { upsertSubscriberInFallbackStore } from "@/app/api/messages/route"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = (body.name || "Resort Subscriber").trim()
    const email = (body.email || "").trim()
    const phone = (body.phone || "").trim()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required" },
        { status: 400 }
      )
    }

    const nowIso = new Date().toISOString()
    const subscriberRecord: IEmailSubscriber = {
      subscriberId: `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone,
      source: "NEWSLETTER_FORM",
      status: "ACTIVE",
      tags: ["Osieka Dispatch", "Newsletter"],
      subscribedAt: nowIso,
      createdAt: nowIso,
    }

    const savedSub = upsertSubscriberInFallbackStore(subscriberRecord)

    try {
      await connectToDatabase()
      await EmailSubscriber.findOneAndUpdate(
        { email: { $regex: new RegExp(`^${email}$`, "i") } },
        {
          $set: {
            name,
            email,
            ...(phone ? { phone } : {}),
            status: "ACTIVE",
            subscribedAt: nowIso,
          },
          $setOnInsert: {
            subscriberId: subscriberRecord.subscriberId,
            source: "NEWSLETTER_FORM",
          },
          $addToSet: { tags: { $each: ["Osieka Dispatch", "Newsletter"] } },
        },
        { upsert: true, new: true }
      )
    } catch (dbErr: any) {
      console.warn("Newsletter subscriber saved to live fallback store:", dbErr.message)
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to Osieka Resort email list",
      subscriber: savedSub,
    })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json(
      { success: false, message: "Failed to subscribe to newsletter" },
      { status: 500 }
    )
  }
}
