import { GameAdapter } from './types';
import { TicTacToeAdapter } from './TicTacToeAdapter';
import { ChorSipahiAdapter } from './ChorSipahiAdapter';
import { SpinCricketAdapter } from './SpinCricketAdapter';
import { PenFlipAdapter } from './PenFlipAdapter';
import { WordBuilderAdapter } from './WordBuilderAdapter';
import { BrainPotAdapter } from './BrainPotAdapter';
import { createGeneralDuelAdapter } from './GeneralDuelAdapter';

export * from './types';
export * from './TicTacToeAdapter';
export * from './ChorSipahiAdapter';
export * from './SpinCricketAdapter';
export * from './PenFlipAdapter';
export * from './WordBuilderAdapter';
export * from './BrainPotAdapter';
export * from './GeneralDuelAdapter';

const ADAPTER_REGISTRY: Record<string, GameAdapter<any, any>> = {
  'tic-tac-toe': TicTacToeAdapter,
  'chor-sipahi': ChorSipahiAdapter,
  'spin-cricket': SpinCricketAdapter,
  'pen-flip': PenFlipAdapter,
  'word-builder': WordBuilderAdapter,
  'brain-pot': BrainPotAdapter,
  'gully-cricket': createGeneralDuelAdapter('gully-cricket', 'Gully Cricket Box League 🏏🔥'),
  'eraser-throw': createGeneralDuelAdapter('eraser-throw', 'Last Bench Eraser Throw 🎯')
};

/**
 * Returns the authoritative GameAdapter for the specified game ID.
 * Defaults to GeneralDuelAdapter if a specific adapter is not registered.
 */
export const getGameAdapter = (gameId: string, gameTitle?: string): GameAdapter<any, any> => {
  if (ADAPTER_REGISTRY[gameId]) {
    return ADAPTER_REGISTRY[gameId];
  }
  return createGeneralDuelAdapter(gameId, gameTitle || 'Multiplayer Game');
};
