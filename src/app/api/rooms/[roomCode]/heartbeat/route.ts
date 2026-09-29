import { NextRequest, NextResponse } from 'next/server';
import { sendPlayerHeartbeat } from '@/lib/multiplayer/realtimeService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const body = await req.json();
    const { playerId } = body;

    if (playerId) {
      await sendPlayerHeartbeat(roomCode, playerId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
