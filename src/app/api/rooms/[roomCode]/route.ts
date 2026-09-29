import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode } from '@/lib/multiplayer/realtimeService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const result = await getRoomByCode(roomCode);

    if (!result.success) {
      const status = result.code === 'ROOM_NOT_FOUND' ? 404 : result.code === 'ROOM_EXPIRED' ? 410 : 400;
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
