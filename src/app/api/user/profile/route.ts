import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfileData } from '@/lib/firebaseService';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, avatar, displayName, bio } = body;

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Strictly whitelist allowed editable fields
    const updates: { avatar?: string; displayName?: string; bio?: string } = {};

    if (avatar && typeof avatar === 'string') {
      updates.avatar = avatar.slice(0, 32);
    }
    if (displayName && typeof displayName === 'string') {
      updates.displayName = displayName.trim().slice(0, 40);
    }
    if (typeof bio === 'string') {
      updates.bio = bio.trim().slice(0, 200);
    }

    const result = await updateUserProfileData(uid, updates);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update profile' }, { status: 400 });
    }

    return NextResponse.json({ success: true, updates });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error updating profile' }, { status: 500 });
  }
}
