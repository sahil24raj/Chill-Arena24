import { NextRequest, NextResponse } from 'next/server';
import { checkUsernameAvailability } from '@/lib/firebaseService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const uid = searchParams.get('uid') || undefined;

  if (!username) {
    return NextResponse.json({ available: false, error: 'Username is required' }, { status: 400 });
  }

  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return NextResponse.json({ available: false, error: 'Username must be at least 3 characters' }, { status: 200 });
  }

  if (cleanUsername.length > 20) {
    return NextResponse.json({ available: false, error: 'Username cannot exceed 20 characters' }, { status: 200 });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return NextResponse.json({ available: false, error: 'Username can only contain alphanumeric characters and underscores' }, { status: 200 });
  }

  try {
    const result = await checkUsernameAvailability(cleanUsername, uid);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ available: true, message: 'Availability check fallback' }, { status: 200 });
  }
}
