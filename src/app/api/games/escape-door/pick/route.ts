import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  decryptRoundToken,
  getBaseScoreForLevel,
  getDoorMultiplier,
  getStreakMultiplier,
  getBaseXpForLevel,
} from '@/lib/games/escapeDoorCrypto';

const PickRequestSchema = z.object({
  sessionId: z.string().min(1),
  roundToken: z.string().min(1),
  selectedDoorIndex: z.number().int().nonnegative(),
  currentScore: z.number().int().nonnegative().optional().default(0),
  currentStreak: z.number().int().nonnegative().optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PickRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid pick payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, roundToken, selectedDoorIndex, currentScore, currentStreak } = parsed.data;

    // Decrypt and verify the encrypted round token
    const tokenPayload = decryptRoundToken(roundToken);
    if (!tokenPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid, tampered, or expired round token.',
          cheatingDetected: true,
        },
        { status: 403 }
      );
    }

    if (tokenPayload.sessionId !== sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session mismatch.',
          cheatingDetected: true,
        },
        { status: 403 }
      );
    }

    const { level, doorCount, safeDoorIndex } = tokenPayload;

    if (selectedDoorIndex >= doorCount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Selected door index is out of bounds.',
          cheatingDetected: true,
        },
        { status: 400 }
      );
    }

    const isSafe = selectedDoorIndex === safeDoorIndex;

    if (isSafe) {
      const nextStreak = currentStreak + 1;
      const baseScore = getBaseScoreForLevel(level);
      const doorMultiplier = getDoorMultiplier(doorCount);
      const streakMultiplier = getStreakMultiplier(nextStreak);
      const scoreGained = Math.round(baseScore * doorMultiplier * streakMultiplier);
      const newTotalScore = currentScore + scoreGained;
      const xpGained = getBaseXpForLevel(level);
      const isLevel10Complete = level === 10;

      return NextResponse.json({
        success: true,
        isSafe: true,
        safeDoorIndex,
        selectedDoorIndex,
        scoreGained,
        totalScore: newTotalScore,
        xpGained,
        streak: nextStreak,
        doorMultiplier,
        streakMultiplier,
        isLevel10Complete,
        level,
      });
    } else {
      return NextResponse.json({
        success: true,
        isSafe: false,
        safeDoorIndex,
        selectedDoorIndex,
        scoreGained: 0,
        totalScore: currentScore,
        xpGained: 0,
        streak: 0,
        level,
        gameOver: true,
      });
    }
  } catch (error: any) {
    console.error('Escape Door pick validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate door pick' },
      { status: 500 }
    );
  }
}
