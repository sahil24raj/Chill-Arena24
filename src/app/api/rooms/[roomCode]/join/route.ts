import { NextRequest, NextResponse } from 'next/server';
import { joinRoomOnServer } from '@/lib/multiplayer/realtimeService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const body = await req.json();
    const { user } = body;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User data is required to join.' },
        { status: 400 }
      );
    }

    const result = await joinRoomOnServer(roomCode, user);

    if (!result.success) {
      const status = result.code === 'ROOM_NOT_FOUND' ? 404 : result.code === 'ROOM_FULL' ? 409 : 400;
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
