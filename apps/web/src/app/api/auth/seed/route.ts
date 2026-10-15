import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { SEEDED_ACCOUNTS } from '@/lib/seededAccounts';

export async function POST() {
  try {
    await connectToDatabase();

    const seededResults = [];
    for (const acc of SEEDED_ACCOUNTS) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        const created = await User.create({
          ...acc,
          isActive: true,
          createdAt: new Date(),
        });
        seededResults.push(created);
      } else {
        // Update password & details to ensure demo accounts match
        await User.updateOne({ email: acc.email }, { $set: acc });
        seededResults.push(existing);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seededResults.length} staff roles into MongoDB Atlas successfully!`,
      users: seededResults.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        pinCode: u.pinCode,
      })),
    });
  } catch (error: any) {
    console.error('Seed API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
