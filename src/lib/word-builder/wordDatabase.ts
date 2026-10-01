export type WordDifficulty = 'easy' | 'easy+' | 'medium' | 'medium+' | 'hard' | 'expert';

export interface WordLevelData {
  level: number;
  word: string;
  meaning: string;
  difficulty: WordDifficulty;
  category: string;
  acceptedAnswers?: string[];
}

// 50 Handcrafted, High-Quality English Word Levels with verified dictionary definitions
export const WORD_BUILDER_LEVELS: WordLevelData[] = [
  // ==========================================
  // LEVEL 1–5: EASY (3 Letters)
  // ==========================================
  {
    level: 1,
    word: 'DOG',
    meaning: 'A domesticated carnivorous mammal commonly kept as a loyal pet.',
    difficulty: 'easy',
    category: 'Animals',
    acceptedAnswers: ['DOG', 'GOD']
  },
  {
    level: 2,
    word: 'CAT',
    meaning: 'A small domesticated feline mammal with soft fur and sharp claws.',
    difficulty: 'easy',
    category: 'Animals',
    acceptedAnswers: ['CAT', 'ACT']
  },
  {
    level: 3,
    word: 'SUN',
    meaning: 'The luminous star around which the Earth orbits, providing light and heat.',
    difficulty: 'easy',
    category: 'Nature',
    acceptedAnswers: ['SUN', 'NUS']
  },
  {
    level: 4,
    word: 'PEN',
    meaning: 'An instrument used for writing or drawing with ink.',
    difficulty: 'easy',
    category: 'Everyday Objects',
    acceptedAnswers: ['PEN']
  },
  {
    level: 5,
    word: 'ART',
    meaning: 'The expression or application of human creative skill and imagination.',
    difficulty: 'easy',
    category: 'Culture',
    acceptedAnswers: ['ART', 'RAT', 'TAR']
  },

  // ==========================================
  // LEVEL 6–10: EASY+ (4 Letters)
  // ==========================================
  {
    level: 6,
    word: 'CAKE',
    meaning: 'A sweet baked food made from flour, sugar, eggs, and butter.',
    difficulty: 'easy+',
    category: 'Food',
    acceptedAnswers: ['CAKE']
  },
  {
    level: 7,
    word: 'STOP',
    meaning: 'To cease movement, progress, or operation.',
    difficulty: 'easy+',
    category: 'Action',
    acceptedAnswers: ['STOP', 'POST', 'SPOT', 'TOPS', 'POTS']
  },
  {
    level: 8,
    word: 'PALE',
    meaning: 'Light in color or shade; having relatively little color.',
    difficulty: 'easy+',
    category: 'Colors & Senses',
    acceptedAnswers: ['PALE', 'LEAP', 'PLEA', 'PEAL']
  },
  {
    level: 9,
    word: 'BIRD',
    meaning: 'A warm-blooded feathered vertebrate with wings that can usually fly.',
    difficulty: 'easy+',
    category: 'Animals',
    acceptedAnswers: ['BIRD', 'DRIP']
  },
  {
    level: 10,
    word: 'STAR',
    meaning: 'A celestial body of hot gas that radiates energy in the night sky.',
    difficulty: 'easy+',
    category: 'Space',
    acceptedAnswers: ['STAR', 'RATS', 'ARTS', 'TARS']
  },

  // ==========================================
  // LEVEL 11–20: MEDIUM (5 Letters)
  // ==========================================
  {
    level: 11,
    word: 'APPLE',
    meaning: 'The round edible fruit of a tree, typically red, green, or yellow.',
    difficulty: 'medium',
    category: 'Food',
    acceptedAnswers: ['APPLE']
  },
  {
    level: 12,
    word: 'TABLE',
    meaning: 'A piece of furniture with a flat top supported by legs.',
    difficulty: 'medium',
    category: 'Furniture',
    acceptedAnswers: ['TABLE', 'BLEAT']
  },
  {
    level: 13,
    word: 'RIVER',
    meaning: 'A large, natural stream of water flowing continuously toward the sea.',
    difficulty: 'medium',
    category: 'Geography',
    acceptedAnswers: ['RIVER']
  },
  {
    level: 14,
    word: 'STONE',
    meaning: 'Hard, solid non-metallic mineral matter that forms rocks.',
    difficulty: 'medium',
    category: 'Earth',
    acceptedAnswers: ['STONE', 'TONES', 'NOTES', 'ONSET']
  },
  {
    level: 15,
    word: 'HEART',
    meaning: 'A muscular organ that pumps blood through the body; center of emotions.',
    difficulty: 'medium',
    category: 'Anatomy',
    acceptedAnswers: ['HEART', 'EARTH', 'HATER']
  },
  {
    level: 16,
    word: 'WATER',
    meaning: 'A transparent odorless liquid vital for all known forms of life.',
    difficulty: 'medium',
    category: 'Nature',
    acceptedAnswers: ['WATER']
  },
  {
    level: 17,
    word: 'SMILE',
    meaning: 'A pleased or friendly facial expression with the corners of mouth turned up.',
    difficulty: 'medium',
    category: 'Emotions',
    acceptedAnswers: ['SMILE', 'SLIME', 'MILES', 'LIMES']
  },
  {
    level: 18,
    word: 'DREAM',
    meaning: 'A series of thoughts, visions, and sensations occurring during sleep.',
    difficulty: 'medium',
    category: 'Mind',
    acceptedAnswers: ['DREAM', 'ARMED']
  },
  {
    level: 19,
    word: 'TIGER',
    meaning: 'A magnificent large apex feline predator with an orange and black striped coat.',
    difficulty: 'medium',
    category: 'Animals',
    acceptedAnswers: ['TIGER']
  },
  {
    level: 20,
    word: 'CLOUD',
    meaning: 'A visible mass of condensed water droplets floating high in the sky.',
    difficulty: 'medium',
    category: 'Weather',
    acceptedAnswers: ['CLOUD']
  },

  // ==========================================
  // LEVEL 21–30: MEDIUM+ (6 Letters)
  // ==========================================
  {
    level: 21,
    word: 'PLANET',
    meaning: 'A large celestial body in space orbiting around a central star.',
    difficulty: 'medium+',
    category: 'Cosmos',
    acceptedAnswers: ['PLANET']
  },
  {
    level: 22,
    word: 'MARKET',
    meaning: 'A public place or arena where buyers and sellers trade goods and services.',
    difficulty: 'medium+',
    category: 'Commerce',
    acceptedAnswers: ['MARKET']
  },
  {
    level: 23,
    word: 'BRIGHT',
    meaning: 'Giving off or reflecting plenty of light; radiant and intelligent.',
    difficulty: 'medium+',
    category: 'Qualities',
    acceptedAnswers: ['BRIGHT']
  },
  {
    level: 24,
    word: 'FRIEND',
    meaning: 'A person with whom one has a strong mutual bond of affection and trust.',
    difficulty: 'medium+',
    category: 'Relationships',
    acceptedAnswers: ['FRIEND']
  },
  {
    level: 25,
    word: 'SILVER',
    meaning: 'A precious lustrous grayish-white metallic chemical element.',
    difficulty: 'medium+',
    category: 'Elements',
    acceptedAnswers: ['SILVER', 'SLIVER']
  },
  {
    level: 26,
    word: 'GARDEN',
    meaning: 'A cultivated plot of land used for growing flowers, herbs, or vegetables.',
    difficulty: 'medium+',
    category: 'Nature',
    acceptedAnswers: ['GARDEN', 'DANGER', 'GANDER']
  },
  {
    level: 27,
    word: 'CASTLE',
    meaning: 'A grand fortified stronghold built in the Middle Ages by royalty.',
    difficulty: 'medium+',
    category: 'Architecture',
    acceptedAnswers: ['CASTLE']
  },
  {
    level: 28,
    word: 'SILENT',
    meaning: 'Completely devoid of noise or sound; tranquil and peaceful.',
    difficulty: 'medium+',
    category: 'Sound',
    acceptedAnswers: ['SILENT', 'LISTEN', 'TINSEL']
  },
  {
    level: 29,
    word: 'STREAM',
    meaning: 'A steady natural flow of fresh water, smaller than a river.',
    difficulty: 'medium+',
    category: 'Nature',
    acceptedAnswers: ['STREAM', 'MASTER', 'TAMERS']
  },
  {
    level: 30,
    word: 'FOREST',
    meaning: 'A vast dense area populated predominantly by trees and diverse wildlife.',
    difficulty: 'medium+',
    category: 'Biome',
    acceptedAnswers: ['FOREST', 'FOSTER', 'SOFTER']
  },

  // ==========================================
  // LEVEL 31–40: HARD (7 Letters)
  // ==========================================
  {
    level: 31,
    word: 'TEACHER',
    meaning: 'A dedicated person whose occupation is guiding and educating students.',
    difficulty: 'hard',
    category: 'Professions',
    acceptedAnswers: ['TEACHER']
  },
  {
    level: 32,
    word: 'COUNTRY',
    meaning: 'A distinct nation with its own government and geographical territory.',
    difficulty: 'hard',
    category: 'Geography',
    acceptedAnswers: ['COUNTRY']
  },
  {
    level: 33,
    word: 'PICTURE',
    meaning: 'A visual design, painting, photograph, or illustration of something.',
    difficulty: 'hard',
    category: 'Art & Media',
    acceptedAnswers: ['PICTURE']
  },
  {
    level: 34,
    word: 'FREEDOM',
    meaning: 'The fundamental right or state of being free from coercion or imprisonment.',
    difficulty: 'hard',
    category: 'Philosophy',
    acceptedAnswers: ['FREEDOM']
  },
  {
    level: 35,
    word: 'JOURNEY',
    meaning: 'The act of traveling from one destination to another over time.',
    difficulty: 'hard',
    category: 'Travel',
    acceptedAnswers: ['JOURNEY']
  },
  {
    level: 36,
    word: 'VICTORY',
    meaning: 'Success or triumph achieved through defeating a rival or overcoming adversity.',
    difficulty: 'hard',
    category: 'Achievement',
    acceptedAnswers: ['VICTORY']
  },
  {
    level: 37,
    word: 'DIAMOND',
    meaning: 'A rare and extremely hard mineral composed of crystallized pure carbon.',
    difficulty: 'hard',
    category: 'Gems',
    acceptedAnswers: ['DIAMOND']
  },
  {
    level: 38,
    word: 'MORNING',
    meaning: 'The early phase of the day starting from dawn until solar noon.',
    difficulty: 'hard',
    category: 'Time',
    acceptedAnswers: ['MORNING']
  },
  {
    level: 39,
    word: 'COURAGE',
    meaning: 'The moral or physical strength to face fear, danger, or severe difficulty.',
    difficulty: 'hard',
    category: 'Virtues',
    acceptedAnswers: ['COURAGE']
  },
  {
    level: 40,
    word: 'KINGDOM',
    meaning: 'A sovereign realm or territory ruled by a monarch.',
    difficulty: 'hard',
    category: 'History & Sovereignty',
    acceptedAnswers: ['KINGDOM']
  },

  // ==========================================
  // LEVEL 41–50: EXPERT (8+ Letters)
  // ==========================================
  {
    level: 41,
    word: 'COMPUTER',
    meaning: 'A high-speed electronic calculating device for processing and storing data.',
    difficulty: 'expert',
    category: 'Technology',
    acceptedAnswers: ['COMPUTER']
  },
  {
    level: 42,
    word: 'LANGUAGE',
    meaning: 'A structured system of vocal and written symbols used for communication.',
    difficulty: 'expert',
    category: 'Linguistics',
    acceptedAnswers: ['LANGUAGE']
  },
  {
    level: 43,
    word: 'KNOWLEDGE',
    meaning: 'Facts, principles, and understanding gained through study or experience.',
    difficulty: 'expert',
    category: 'Wisdom',
    acceptedAnswers: ['KNOWLEDGE']
  },
  {
    level: 44,
    word: 'ADVENTURE',
    meaning: 'An exciting and daring endeavor, often accompanied by unexpected discovery.',
    difficulty: 'expert',
    category: 'Exploration',
    acceptedAnswers: ['ADVENTURE']
  },
  {
    level: 45,
    word: 'CHALLENGE',
    meaning: 'A demanding test of ability, endurance, or character requiring great effort.',
    difficulty: 'expert',
    category: 'Esports & Mind',
    acceptedAnswers: ['CHALLENGE']
  },
  {
    level: 46,
    word: 'BEAUTIFUL',
    meaning: 'Possessing qualities that delight the aesthetic senses and touch the heart.',
    difficulty: 'expert',
    category: 'Aesthetics',
    acceptedAnswers: ['BEAUTIFUL']
  },
  {
    level: 47,
    word: 'DISCOVERY',
    meaning: 'The revelation or finding of something previously unnoticed or concealed.',
    difficulty: 'expert',
    category: 'Science',
    acceptedAnswers: ['DISCOVERY']
  },
  {
    level: 48,
    word: 'UNIVERSE',
    meaning: 'All existing physical matter, energy, galaxies, and spacetime combined.',
    difficulty: 'expert',
    category: 'Cosmology',
    acceptedAnswers: ['UNIVERSE']
  },
  {
    level: 49,
    word: 'CELEBRATE',
    meaning: 'To honor and commemorate a triumph or happy occasion with festivities.',
    difficulty: 'expert',
    category: 'Joy & Triumph',
    acceptedAnswers: ['CELEBRATE']
  },
  {
    level: 50,
    word: 'BRILLIANT',
    meaning: 'Shining with supreme brilliance, radiant intellect, and outstanding mastery.',
    difficulty: 'expert',
    category: 'Mastery',
    acceptedAnswers: ['BRILLIANT']
  }
];

// Helper: Get data for a level (1-50 with loop wrap if extended)
export function getLevelData(levelNumber: number): WordLevelData {
  const safeIndex = Math.max(0, (levelNumber - 1) % WORD_BUILDER_LEVELS.length);
  return {
    ...WORD_BUILDER_LEVELS[safeIndex],
    level: levelNumber
  };
}

// Helper: Scramble a word's letters guaranteeing it is NOT identical to the word
export function scrambleWord(word: string): string[] {
  const letters = word.toUpperCase().split('');
  if (letters.length <= 1) return letters;

  let scrambled = [...letters];
  let attempts = 0;
  const maxAttempts = 30;

  // Keep shuffling until the joined scrambled word is different from the original word
  while (attempts < maxAttempts) {
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }

    if (scrambled.join('') !== word.toUpperCase()) {
      return scrambled;
    }
    attempts++;
  }

  // Fallback transposition if random permutation matched by chance
  if (scrambled.join('') === word.toUpperCase()) {
    [scrambled[0], scrambled[scrambled.length - 1]] = [scrambled[scrambled.length - 1], scrambled[0]];
  }

  return scrambled;
}

// XP reward calculation by level range
export function calculateLevelXP(level: number): number {
  if (level <= 10) return 10;
  if (level <= 20) return 20;
  if (level <= 30) return 30;
  if (level <= 40) return 40;
  return 50;
}

// Suggested timer countdown based on difficulty
export function getTimerForDifficulty(diff: WordDifficulty): number {
  switch (diff) {
    case 'easy':
      return 30;
    case 'easy+':
      return 30;
    case 'medium':
      return 25;
    case 'medium+':
      return 25;
    case 'hard':
      return 20;
    case 'expert':
      return 15;
    default:
      return 25;
  }
}

// Validate word submission
export function validateWordAnswer(
  rawInput: string,
  levelData: WordLevelData
): { isValid: boolean; isAccepted: boolean; reason?: string } {
  const clean = rawInput.trim().toUpperCase().replace(/[^A-Z]/g, '');

  if (!clean) {
    return { isValid: false, isAccepted: false, reason: 'Input cannot be empty.' };
  }

  if (clean.length !== levelData.word.length) {
    return {
      isValid: false,
      isAccepted: false,
      reason: `Answer must be exactly ${levelData.word.length} letters long.`
    };
  }

  // Frequency check
  const letterCounts: Record<string, number> = {};
  for (const char of levelData.word.toUpperCase()) {
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }

  const inputCounts: Record<string, number> = {};
  for (const char of clean) {
    inputCounts[char] = (inputCounts[char] || 0) + 1;
  }

  for (const char of Object.keys(inputCounts)) {
    if ((inputCounts[char] || 0) > (letterCounts[char] || 0)) {
      return {
        isValid: false,
        isAccepted: false,
        reason: `Letter "${char}" does not match the scrambled tiles.`
      };
    }
  }

  // Check if matches intended word or acceptable alternate anagram
  const accepted = (levelData.acceptedAnswers || [levelData.word]).map((w) => w.toUpperCase());
  const isAccepted = accepted.includes(clean) || clean === levelData.word.toUpperCase();

  return {
    isValid: true,
    isAccepted,
    reason: isAccepted ? undefined : `"${clean}" is not the target word.`
  };
}

// =========================================================================
// Legacy Types & Exports for Multiplayer Compatibility and Existing Modules
// =========================================================================

export interface WordPuzzleLevel {
  id: string;
  rootWord: string;
  letters: string[];
  theme: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetWords: string[];
  allSolutions: {
    [length: number]: { word: string; definition: string }[];
  };
}

export const PUZZLE_LEVELS: WordPuzzleLevel[] = WORD_BUILDER_LEVELS.slice(0, 10).map((lvl) => ({
  id: `lvl-${lvl.level}`,
  rootWord: lvl.word,
  letters: lvl.word.split(''),
  theme: lvl.category,
  difficulty: lvl.level <= 5 ? 'Easy' : lvl.level <= 10 ? 'Medium' : 'Hard',
  targetWords: [lvl.word, ...(lvl.acceptedAnswers || [])],
  allSolutions: {
    [lvl.word.length]: [
      { word: lvl.word, definition: lvl.meaning }
    ]
  }
}));

export function getRandomPuzzleLevel(): WordPuzzleLevel {
  const randomIndex = Math.floor(Math.random() * PUZZLE_LEVELS.length);
  return PUZZLE_LEVELS[randomIndex];
}

export function getAllValidWordsForPool(level: WordPuzzleLevel): Set<string> {
  const words = new Set<string>();
  Object.values(level.allSolutions).forEach((list) => {
    list.forEach((item) => words.add(item.word.toUpperCase()));
  });
  level.targetWords.forEach((tw) => words.add(tw.toUpperCase()));
  return words;
}
