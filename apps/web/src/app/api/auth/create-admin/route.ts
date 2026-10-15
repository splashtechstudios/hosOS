import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password, pinCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An admin account with this email already exists' },
        { status: 409 }
      );
    }

    const newAdmin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'OWNER',
      department: 'EXECUTIVE',
      pinCode: pinCode || '1001',
      salaryTier: 'Executive Owner',
      bankName: 'Zenith Bank PLC',
      onboardedBy: 'Initial Setup Wizard',
      isActive: true,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Super Admin account created successfully in MongoDB Atlas!',
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        department: newAdmin.department,
        pinCode: newAdmin.pinCode,
      },
    });
  } catch (error: any) {
    console.error('Create Admin API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
