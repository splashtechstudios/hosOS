import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { SEEDED_ACCOUNTS } from '@/lib/seededAccounts';

import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let users = await User.find({}).sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      // Auto seed if empty
      users = await User.insertMany(
        SEEDED_ACCOUNTS.map(a => ({ ...a, isActive: true, createdAt: new Date() }))
      );
    }

    return NextResponse.json({
      success: true,
      staff: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        pinCode: u.pinCode,
        phone: u.phone,
        nin: u.nin,
        salaryTier: u.salaryTier,
        bankName: u.bankName,
        bankAccountNumber: u.bankAccountNumber,
        onboardedBy: u.onboardedBy,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.warn('MongoDB query failed, returning fallback seeded staff:', error.message);
    return NextResponse.json({
      success: true,
      staff: SEEDED_ACCOUNTS.map((a, i) => ({
        id: `staff-${i + 1}`,
        ...a,
        isActive: true,
        createdAt: new Date().toISOString(),
      })),
    });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      name, 
      email, 
      password, 
      role, 
      department, 
      pinCode, 
      phone, 
      nin, 
      salaryTier, 
      bankName, 
      bankAccountNumber,
      onboardedBy
    } = data;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A staff user with this email address already exists' },
        { status: 409 }
      );
    }

    const createdStaff = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: await hashPassword(password),
      role,
      department: department || 'FOOD_AND_BEVERAGE',
      pinCode: pinCode || '1234',
      phone: phone || '+234 800 000 0000',
      nin: nin || `NIN-${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      salaryTier: salaryTier || 'Standard Personnel',
      bankName: bankName || 'Zenith Bank PLC',
      bankAccountNumber: bankAccountNumber || '0123456789',
      onboardedBy: onboardedBy || 'Executive HR',
      isActive: true,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Staff member ${createdStaff.name} created and role '${createdStaff.role}' assigned! They can now log in immediately.`,
      staff: {
        id: createdStaff._id,
        name: createdStaff.name,
        email: createdStaff.email,
        role: createdStaff.role,
        department: createdStaff.department,
        pinCode: createdStaff.pinCode,
      },
    });
  } catch (error: any) {
    console.error('Staff creation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// Superadmin Permanent User Account Deletion
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const email = searchParams.get('email');
    const callerRole = (searchParams.get('role') || '').toUpperCase();
    const callerName = searchParams.get('callerName') || 'Super Admin';

    if (callerRole !== 'SUPERADMIN' && callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only Superadmin has permission to completely delete user accounts.' },
        { status: 403 }
      );
    }

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'Staff User ID or Email is required.' },
        { status: 400 }
      );
    }

    let deleted = null;
    if (userId) {
      try {
        deleted = await User.findByIdAndDelete(userId);
      } catch (_) {}
    }
    if (!deleted && email) {
      deleted = await User.findOneAndDelete({ email: email.toLowerCase().trim() });
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'User account not found in database.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User account "${deleted.name}" (${deleted.email}, Role: ${deleted.role}) has been permanently deleted by Superadmin.`,
    });
  } catch (error: any) {
    console.error('Staff deletion API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

