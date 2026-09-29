import { NextRequest, NextResponse } from 'next/server';
import { submitPlayerActionOnServer } from '@/lib/multiplayer/realtimeService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const body = await req.json();
    const { payload } = body;

    if (!payload || !payload.playerId || !payload.actionType) {
      return NextResponse.json(
        { success: false, error: 'Invalid action payload' },
        { status: 400 }
      );
    }

    const result = await submitPlayerActionOnServer(roomCode, payload);

    if (!result.success) {
      const status = result.code === 'NOT_YOUR_TURN' ? 403 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
