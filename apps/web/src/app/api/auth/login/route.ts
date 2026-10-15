import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { SEEDED_ACCOUNTS } from '@/lib/seededAccounts';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user: any = null;

    try {
      await connectToDatabase();
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } catch (dbErr) {
      console.warn('MongoDB query failed, falling back to local registry:', dbErr);
    }

    // Fallback if DB is booting or user is among seeded accounts
    if (!user) {
      const seeded = SEEDED_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.toLowerCase().trim()
      );
      if (seeded && seeded.password === password) {
        user = {
          _id: `seeded-${seeded.role.toLowerCase()}`,
          ...seeded,
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Account not found. Please verify your credentials or seed demo users.' },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. No OTP is required for HosOS access.' },
        { status: 401 }
      );
    }

    // Return authenticated user profile
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        pinCode: user.pinCode,
        phone: user.phone,
        nin: user.nin,
        onboardedBy: user.onboardedBy,
      },
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
