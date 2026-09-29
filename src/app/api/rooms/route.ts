import { NextRequest, NextResponse } from 'next/server';
import { createRoomOnServer } from '@/lib/multiplayer/realtimeService';

// In-memory rate limiting map: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    const now = Date.now();

    // Rate limit: 20 room creations per minute per IP
    const currentRate = rateLimitMap.get(ip);
    if (currentRate && currentRate.resetAt > now) {
      if (currentRate.count >= 20) {
        return NextResponse.json(
          { success: false, error: 'Too many room creation requests. Please wait a moment.', code: 'RATE_LIMITED' },
          { status: 429 }
        );
      }
      currentRate.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    }

    const body = await req.json();
    const { gameId, user, settings } = body;

    if (!gameId || !user) {
      return NextResponse.json(
        { success: false, error: 'Missing required gameId or user payload.' },
        { status: 400 }
      );
    }

    const result = await createRoomOnServer(gameId, user, settings);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
