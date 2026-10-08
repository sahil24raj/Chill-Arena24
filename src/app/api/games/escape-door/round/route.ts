import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import {
  getDoorCountForLevel,
  encryptRoundToken,
  RoundTokenPayload
} from '@/lib/games/escapeDoorCrypto';

const RoundRequestSchema = z.object({
  sessionId: z.string().min(1),
  level: z.number().int().min(1),
  isEndless: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RoundRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid round payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, level } = parsed.data;
    const doorCount = getDoorCountForLevel(level);

    // Cryptographically secure random door selection [0, doorCount - 1]
    const safeDoorIndex = crypto.randomInt(0, doorCount);

    const payload: RoundTokenPayload = {
      sessionId,
      level,
      doorCount,
      safeDoorIndex,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex'),
    };

    const roundToken = encryptRoundToken(payload);

    // NEVER return safeDoorIndex to client!
    return NextResponse.json({
      success: true,
      level,
      doorCount,
      roundToken,
    });
  } catch (error: any) {
    console.error('Escape Door round generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate door round' },
      { status: 500 }
    );
  }
}
