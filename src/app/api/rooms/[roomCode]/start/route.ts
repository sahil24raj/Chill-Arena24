import { NextRequest, NextResponse } from 'next/server';
import { startMatchOnServer } from '@/lib/multiplayer/realtimeService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const body = await req.json();
    const { hostPlayerId } = body;

    if (!hostPlayerId) {
      return NextResponse.json(
        { success: false, error: 'Host player ID is required to start.' },
        { status: 400 }
      );
    }

    const result = await startMatchOnServer(roomCode, hostPlayerId);

    if (!result.success) {
      const status = result.code === 'UNAUTHORIZED' ? 403 : 400;
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
