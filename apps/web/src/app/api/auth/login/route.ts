import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { SEEDED_ACCOUNTS } from '@/lib/seededAccounts';
import { comparePassword, signJwt, setAuthCookieResponse } from '@/lib/auth';

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

    // Fallback if DB is empty or user is among seeded accounts
    if (!user) {
      const seeded = SEEDED_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.toLowerCase().trim()
      );
      if (seeded) {
        const isMatch = await comparePassword(password, seeded.password);
        if (isMatch) {
          user = {
            _id: `seeded-${seeded.role.toLowerCase()}`,
            ...seeded,
          };
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Account not found. Please verify your email or click "Seed Demo Roles in Atlas".' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. No OTP is required for HosOS access.' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: String(user._id || user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };

    const token = signJwt(tokenPayload);

    const userProfile = {
      id: String(user._id || user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      pinCodeHash: user.pinCode || '1234',
      isActive: user.isActive !== false,
      createdAt: user.createdAt || new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: userProfile,
      token,
    });

    return setAuthCookieResponse(response, token);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server authentication error' },
      { status: 500 }
    );
  }
}
