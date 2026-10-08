export interface GameFullscreenConfig {
  id: string;
  title?: string;
  preferredAspectRatio?: '16/9' | '1/1' | '4/3' | '9/16' | 'auto';
  preferredOrientation?: 'landscape' | 'portrait' | 'any';
  scalingMode?: 'contain' | 'responsive' | 'fill';
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  showHUD?: boolean;
}

export const GAME_FULLSCREEN_REGISTRY: Record<string, GameFullscreenConfig> = {
  'spin-cricket': {
    id: 'spin-cricket',
    title: 'Spin Cricket (Book Cricket) 🏏',
    preferredAspectRatio: '1/1',
    preferredOrientation: 'any',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'word-builder': {
    id: 'word-builder',
    title: 'Word Builder Pro 🔠',
    preferredAspectRatio: 'auto',
    preferredOrientation: 'any',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'tic-tac-toe': {
    id: 'tic-tac-toe',
    title: 'Neon Tic-Tac-Toe ❌⭕',
    preferredAspectRatio: '1/1',
    preferredOrientation: 'any',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'pen-flip': {
    id: 'pen-flip',
    title: 'Pen Flip Battle 🖊️',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'landscape',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'brain-pot': {
    id: 'brain-pot',
    title: 'Brain Pot: Rapid IQ Arena 🧠',
    preferredAspectRatio: 'auto',
    preferredOrientation: 'any',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'modi-run': {
    id: 'modi-run',
    title: 'Modi Run: Express Dash 🏃',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'landscape',
    scalingMode: 'contain',
    showHUD: true,
  },
  'gully-cricket': {
    id: 'gully-cricket',
    title: 'Gully Cricket Smash 🏏',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'landscape',
    scalingMode: 'contain',
    showHUD: true,
  },
  'eraser-throw': {
    id: 'eraser-throw',
    title: 'Classroom Eraser Throw 🎯',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'landscape',
    scalingMode: 'contain',
    showHUD: true,
  },
  'emoji-dodge': {
    id: 'emoji-dodge',
    title: 'Emoji Meme Dodge 🎭',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'any',
    scalingMode: 'contain',
    showHUD: true,
  },
  'cid-escape': {
    id: 'cid-escape',
    title: 'CID Escape: Daya Darwaza Tod 🚪',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'landscape',
    scalingMode: 'contain',
    showHUD: true,
  },
  'chai-tapri': {
    id: 'chai-tapri',
    title: 'Chai Tapri Rush ☕',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'landscape',
    scalingMode: 'contain',
    showHUD: true,
  },
  'meme-clicker': {
    id: 'meme-clicker',
    title: 'Desi Meme Clicker Empire 🚀',
    preferredAspectRatio: 'auto',
    preferredOrientation: 'any',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'chor-sipahi': {
    id: 'chor-sipahi',
    title: 'Chor Sipahi (Raja Mantri) 👑🥷',
    preferredAspectRatio: 'auto',
    preferredOrientation: 'any',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'fake-bomb': {
    id: 'fake-bomb',
    title: 'Fake Bomb (Chaos Core) 💣⚛️',
    preferredAspectRatio: '16/9',
    preferredOrientation: 'landscape',
    scalingMode: 'responsive',
    showHUD: true,
  },
  'escape-door': {
    id: 'escape-door',
    title: 'Escape From The Door 🚪',
    preferredAspectRatio: 'auto',
    preferredOrientation: 'any',
    scalingMode: 'responsive',
    showHUD: true,
  },
};

const DEFAULT_CONFIG: GameFullscreenConfig = {
  id: 'generic-game',
  preferredAspectRatio: 'auto',
  preferredOrientation: 'any',
  scalingMode: 'responsive',
  showHUD: true,
};

export function getGameFullscreenConfig(gameId: string): GameFullscreenConfig {
  return GAME_FULLSCREEN_REGISTRY[gameId] || { ...DEFAULT_CONFIG, id: gameId };
}
