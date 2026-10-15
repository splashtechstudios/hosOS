import { NextResponse, NextRequest } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'No active session found' },
        { status: 401 }
      );
    }

    try {
      await connectToDatabase();
      const user = await User.findById(session.userId);
      if (user && user.isActive) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          user: {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            pinCodeHash: user.pinCode || '1234',
            isActive: user.isActive,
            createdAt: user.createdAt,
          },
        });
      }
    } catch (e) {
      console.warn('DB check failed in /api/auth/me, using token session:', e);
    }

    // Token is valid
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        department: session.department,
        pinCodeHash: '1234',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}
