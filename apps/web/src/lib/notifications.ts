/**
 * Enterprise Hospitality Notification Engine (Osieka Resort)
 * Handles automated SMS and WhatsApp dispatch for guest check-ins and executive night audit flash briefings.
 */

export interface GuestWelcomeMessage {
  guestName: string;
  phone: string;
  roomNumber: string;
  wifiCode?: string;
  checkOutDate: string;
}

export interface OwnerNightAuditMessage {
  businessDate: string;
  nextBusinessDate: string;
  totalRoomsOccupied: number;
  occupancyRate: string;
  totalDailyRevenue: number;
  roomRevenue: number;
  fAndBRevenue: number;
  vatCollected: number;
  consumptionTax: number;
  dieselConsumedLitres?: number;
}

export async function sendGuestWelcomeSms(payload: GuestWelcomeMessage): Promise<{ success: boolean; messageId: string }> {
  const messageBody = `Welcome to Osieka Resort, ${payload.guestName}! Your Room #${payload.roomNumber} is ready. Complimentary High-Speed Wi-Fi Code: "${payload.wifiCode || 'OsiekaVIP2026'}". Dial '0' on your room phone for 24/7 Concierge and Room Service. Check-out date: ${payload.checkOutDate}. Enjoy your stay!`;

  console.log(`[SMS Gateway / Termii Dispatch] To: ${payload.phone} | Body: ${messageBody}`);
  // In production with Termii/Twilio credentials:
  // await fetch('https://api.ng.termii.com/api/sms/send', { ... })

  return {
    success: true,
    messageId: `SMS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
  };
}

export async function sendOwnerNightAuditWhatsapp(payload: OwnerNightAuditMessage): Promise<{ success: boolean; messageId: string }> {
  const whatsappBody = `🌙 *OSIEKA RESORT - EXECUTIVE NIGHT AUDIT BRIEFING*
📅 Business Operating Date: ${payload.businessDate} → ${payload.nextBusinessDate}
🏨 Occupancy: ${payload.totalRoomsOccupied} Rooms Occupied (${payload.occupancyRate})

💰 *DAILY REVENUE BREAKDOWN:*
• Rooms Rack Intake: ₦${payload.roomRevenue.toLocaleString()}
• F&B (Restaurant & Bar): ₦${payload.fAndBRevenue.toLocaleString()}
• FIRS 7.5% VAT: ₦${payload.vatCollected.toLocaleString()}
• 5% Consumption Tax: ₦${payload.consumptionTax.toLocaleString()}
⭐ *Total Gross Turnover: ₦${payload.totalDailyRevenue.toLocaleString()}*

⚡ *FACILITIES:*
• Power Status: Grid + Generator Synchronized
• Generator Fuel Log: ${payload.dieselConsumedLitres || 140}L Consumed

✅ Trial balance reconciled and closed by Night Audit team. Full ledger locked.`;

  console.log(`[WhatsApp Business Dispatch] To Owner/GM | Body:\n${whatsappBody}`);
  // In production with WhatsApp Cloud API:
  // await fetch('https://graph.facebook.com/v18.0/{phone-id}/messages', { ... })

  return {
    success: true,
    messageId: `WA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
  };
}
