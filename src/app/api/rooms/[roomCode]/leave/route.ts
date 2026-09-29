import { NextRequest, NextResponse } from 'next/server';
import { leaveRoomOnServer } from '@/lib/multiplayer/realtimeService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const body = await req.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ success: false, error: 'Player ID required' }, { status: 400 });
    }

    const result = await leaveRoomOnServer(roomCode, playerId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
