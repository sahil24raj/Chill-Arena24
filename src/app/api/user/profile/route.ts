import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfileData, checkUsernameAvailability } from '@/lib/firebaseService';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, avatar, avatarType, displayName, username, bio, photoURL, customAvatar, privacySettings } = body;

    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }

    // Strictly whitelist and validate allowed editable profile fields
    const updates: Record<string, any> = {};

    if (username !== undefined) {
      if (typeof username !== 'string') {
        return NextResponse.json({ error: 'Username must be a string' }, { status: 400 });
      }
      const cleanUsername = username.trim();
      if (cleanUsername.length < 3 || cleanUsername.length > 20) {
        return NextResponse.json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
      }

      // Verify availability
      const avail = await checkUsernameAvailability(cleanUsername, uid);
      if (!avail.available) {
        return NextResponse.json({ error: avail.error || 'Username is already taken' }, { status: 409 });
      }
      updates.username = cleanUsername;
    }

    if (displayName !== undefined && typeof displayName === 'string') {
      // Strip any HTML/script injection tags
      const sanitized = displayName.replace(/[<>]/g, '').trim().slice(0, 40);
      updates.displayName = sanitized;
    }

    if (bio !== undefined && typeof bio === 'string') {
      // Strip any HTML/script tags
      const sanitized = bio.replace(/[<>]/g, '').trim().slice(0, 200);
      updates.bio = sanitized;
    }

    if (avatar !== undefined && typeof avatar === 'string') {
      // Cap avatar data/URL size at 1MB
      if (avatar.length > 1000000) {
        return NextResponse.json({ error: 'Avatar payload exceeds 1MB limit' }, { status: 400 });
      }
      updates.avatar = avatar;
    }

    if (avatarType && ['google', 'upload', 'preset'].includes(avatarType)) {
      updates.avatarType = avatarType;
    }

    if (photoURL !== undefined && typeof photoURL === 'string') {
      updates.photoURL = photoURL.slice(0, 2048);
    }

    if (customAvatar !== undefined && typeof customAvatar === 'string') {
      if (customAvatar.length <= 1000000) {
        updates.customAvatar = customAvatar;
      }
    }

    if (privacySettings && typeof privacySettings === 'object') {
      updates.privacySettings = {
        isPublic: Boolean(privacySettings.isPublic),
        showStats: Boolean(privacySettings.showStats),
        showGameHistory: Boolean(privacySettings.showGameHistory),
        showAchievements: Boolean(privacySettings.showAchievements)
      };
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
