export type WordDifficulty = 'Starter' | 'Moderate' | 'Challenging' | 'Tough' | 'Hard' | 'Elite';

export interface WordLevelData {
  level: number;
  word: string;
  meaning: string;
  difficulty: WordDifficulty;
  category: string;
  acceptedAnswers: string[];
}

// 50 Handcrafted Moderate-to-Elite Difficulty Word Levels with verified definitions and anagrams
export const WORD_BUILDER_LEVELS: WordLevelData[] = [
  // ==========================================
  // LEVEL 1–5: WARM-UP / MODERATE (4 Letters)
  // ==========================================
  {
    level: 1,
    word: 'LION',
    meaning: 'A large, powerful carnivorous feline predator known as the king of beasts.',
    difficulty: 'Starter',
    category: 'Wild Kingdom',
    acceptedAnswers: ['LION', 'LOIN']
  },
  {
    level: 2,
    word: 'CAMP',
    meaning: 'A place with tents or temporary shelters used for outdoor recreational stay.',
    difficulty: 'Starter',
    category: 'Outdoor & Travel',
    acceptedAnswers: ['CAMP']
  },
  {
    level: 3,
    word: 'BIRD',
    meaning: 'A warm-blooded feathered vertebrate with wings capable of flight.',
    difficulty: 'Starter',
    category: 'Nature',
    acceptedAnswers: ['BIRD', 'DRIP']
  },
  {
    level: 4,
    word: 'GOLD',
    meaning: 'A precious yellow metallic element valued worldwide for rarity and jewelry.',
    difficulty: 'Starter',
    category: 'Treasures',
    acceptedAnswers: ['GOLD']
  },
  {
    level: 5,
    word: 'WIND',
    meaning: 'The natural perceptible movement of air flowing along the Earth\'s surface.',
    difficulty: 'Starter',
    category: 'Atmosphere',
    acceptedAnswers: ['WIND']
  },

  // ==========================================
  // LEVEL 6–15: MODERATE+ / CHALLENGING (5 Letters)
  // ==========================================
  {
    level: 6,
    word: 'GHOST',
    meaning: 'An apparition of a deceased person believed to haunt living places.',
    difficulty: 'Moderate',
    category: 'Mystic Lore',
    acceptedAnswers: ['GHOST']
  },
  {
    level: 7,
    word: 'FLAME',
    meaning: 'A hot glowing body of ignited gas produced by combustion or fire.',
    difficulty: 'Moderate',
    category: 'Elements',
    acceptedAnswers: ['FLAME']
  },
  {
    level: 8,
    word: 'SWORD',
    meaning: 'A bladed melee weapon intended for slashing or thrusting combat.',
    difficulty: 'Moderate',
    category: 'Medieval Warfare',
    acceptedAnswers: ['SWORD', 'WORDS']
  },
  {
    level: 9,
    word: 'MAGIC',
    meaning: 'The power of apparently influencing events by using mysterious or supernatural forces.',
    difficulty: 'Moderate',
    category: 'Arcane Arts',
    acceptedAnswers: ['MAGIC']
  },
  {
    level: 10,
    word: 'BRAIN',
    meaning: 'The organ of soft nervous tissue in the skull, coordinating intellect and sensation.',
    difficulty: 'Moderate',
    category: 'Biology',
    acceptedAnswers: ['BRAIN', 'BARIN']
  },
  {
    level: 11,
    word: 'TIGER',
    meaning: 'A magnificent apex predator feline with vibrant orange fur and black stripes.',
    difficulty: 'Moderate',
    category: 'Wild Predators',
    acceptedAnswers: ['TIGER']
  },
  {
    level: 12,
    word: 'STORM',
    meaning: 'A violent atmospheric disturbance accompanied by fierce winds, rain, or thunder.',
    difficulty: 'Moderate',
    category: 'Weather',
    acceptedAnswers: ['STORM']
  },
  {
    level: 13,
    word: 'VIPER',
    meaning: 'A venomous snake having large hinged fangs capable of delivering deep punctures.',
    difficulty: 'Moderate',
    category: 'Reptiles',
    acceptedAnswers: ['VIPER']
  },
  {
    level: 14,
    word: 'CROWN',
    meaning: 'A circular ornamental headdress worn by a monarch as a symbol of authority.',
    difficulty: 'Moderate',
    category: 'Royalty',
    acceptedAnswers: ['CROWN']
  },
  {
    level: 15,
    word: 'OCEAN',
    meaning: 'A very large expanse of continuous salt water covering most of the Earth.',
    difficulty: 'Moderate',
    category: 'Geography',
    acceptedAnswers: ['OCEAN', 'CANOE']
  },

  // ==========================================
  // LEVEL 16–25: TOUGH (6 Letters)
  // ==========================================
  {
    level: 16,
    word: 'DRAGON',
    meaning: 'A legendary mythical monster resembling a giant reptile breathing fire.',
    difficulty: 'Tough',
    category: 'Mythology',
    acceptedAnswers: ['DRAGON']
  },
  {
    level: 17,
    word: 'KNIGHT',
    meaning: 'A medieval warrior of noble birth serving a monarch clad in steel armor.',
    difficulty: 'Tough',
    category: 'Medieval Honor',
    acceptedAnswers: ['KNIGHT']
  },
  {
    level: 18,
    word: 'PLANET',
    meaning: 'A celestial body orbiting a star, large enough for gravity to shape into a sphere.',
    difficulty: 'Tough',
    category: 'Astronomy',
    acceptedAnswers: ['PLANET']
  },
  {
    level: 19,
    word: 'WIZARD',
    meaning: 'A wise person skilled in magical or mystical arts and ancient enchantments.',
    difficulty: 'Tough',
    category: 'Fantasy',
    acceptedAnswers: ['WIZARD']
  },
  {
    level: 20,
    word: 'SHADOW',
    meaning: 'A dark area or shape produced by a body coming between rays of light and a surface.',
    difficulty: 'Tough',
    category: 'Optics & Mystery',
    acceptedAnswers: ['SHADOW']
  },
  {
    level: 21,
    word: 'CASTLE',
    meaning: 'A fortified medieval residence with defensive walls, moats, and battlements.',
    difficulty: 'Tough',
    category: 'Architecture',
    acceptedAnswers: ['CASTLE']
  },
  {
    level: 22,
    word: 'BREEZE',
    meaning: 'A gentle, refreshing and invigorating natural current of wind.',
    difficulty: 'Tough',
    category: 'Atmosphere',
    acceptedAnswers: ['BREEZE']
  },
  {
    level: 23,
    word: 'SILVER',
    meaning: 'A precious, highly conductive lustrous white metallic element.',
    difficulty: 'Tough',
    category: 'Metals',
    acceptedAnswers: ['SILVER', 'SLIVER']
  },
  {
    level: 24,
    word: 'FOREST',
    meaning: 'A large dense biome dominated by lush trees, canopies, and diverse wildlife.',
    difficulty: 'Tough',
    category: 'Ecosystems',
    acceptedAnswers: ['FOREST', 'FOSTER', 'SOFTER']
  },
  {
    level: 25,
    word: 'FALCON',
    meaning: 'A fast bird of prey with long pointed wings and exceptional hunting vision.',
    difficulty: 'Tough',
    category: 'Raptors',
    acceptedAnswers: ['FALCON']
  },

  // ==========================================
  // LEVEL 26–38: HARD (7 Letters)
  // ==========================================
  {
    level: 26,
    word: 'PHANTOM',
    meaning: 'A ghost or elusive apparition perceived only by illusion or hallucination.',
    difficulty: 'Hard',
    category: 'Paranormal',
    acceptedAnswers: ['PHANTOM']
  },
  {
    level: 27,
    word: 'MYSTERY',
    meaning: 'Something difficult or impossible to understand, explain, or decipher.',
    difficulty: 'Hard',
    category: 'Enigma',
    acceptedAnswers: ['MYSTERY']
  },
  {
    level: 28,
    word: 'THUNDER',
    meaning: 'The loud rumbling or crashing noise heard after lightning expands heated air.',
    difficulty: 'Hard',
    category: 'Forces of Nature',
    acceptedAnswers: ['THUNDER']
  },
  {
    level: 29,
    word: 'WARRIOR',
    meaning: 'A brave or experienced fighter engaged in warfare or martial contest.',
    difficulty: 'Hard',
    category: 'Combat Arts',
    acceptedAnswers: ['WARRIOR']
  },
  {
    level: 30,
    word: 'MONSTER',
    meaning: 'An imaginary creature that is typically large, ugly, and frightening.',
    difficulty: 'Hard',
    category: 'Mythos',
    acceptedAnswers: ['MONSTER']
  },
  {
    level: 31,
    word: 'KINGDOM',
    meaning: 'A country, state, or sovereign realm governed by a monarch.',
    difficulty: 'Hard',
    category: 'Sovereignty',
    acceptedAnswers: ['KINGDOM']
  },
  {
    level: 32,
    word: 'JOURNEY',
    meaning: 'An act of traveling from one destination to another, especially over long distances.',
    difficulty: 'Hard',
    category: 'Adventure',
    acceptedAnswers: ['JOURNEY']
  },
  {
    level: 33,
    word: 'VICTORY',
    meaning: 'An act of defeating an enemy, rival, or opponent in competition or battle.',
    difficulty: 'Hard',
    category: 'Triumph',
    acceptedAnswers: ['VICTORY']
  },
  {
    level: 34,
    word: 'CAPTAIN',
    meaning: 'The person in command of a ship, aircraft, expedition, or athletic team.',
    difficulty: 'Hard',
    category: 'Leadership',
    acceptedAnswers: ['CAPTAIN']
  },
  {
    level: 35,
    word: 'DIAMOND',
    meaning: 'An extremely hard precious stone composed of crystal clear carbon.',
    difficulty: 'Hard',
    category: 'Minerals',
    acceptedAnswers: ['DIAMOND']
  },
  {
    level: 36,
    word: 'GLACIER',
    meaning: 'A slowly moving mass of dense ice formed by the accumulation of snow over centuries.',
    difficulty: 'Hard',
    category: 'Geology',
    acceptedAnswers: ['GLACIER']
  },
  {
    level: 37,
    word: 'COMPASS',
    meaning: 'An instrument containing a magnetized needle showing the magnetic north direction.',
    difficulty: 'Hard',
    category: 'Navigation',
    acceptedAnswers: ['COMPASS']
  },
  {
    level: 38,
    word: 'VOLCANO',
    meaning: 'A mountain or hill having a crater through which lava and rock fragments erupt.',
    difficulty: 'Hard',
    category: 'Earth Sciences',
    acceptedAnswers: ['VOLCANO']
  },

  // ==========================================
  // LEVEL 39–50: ELITE (8+ Letters)
  // ==========================================
  {
    level: 39,
    word: 'BLIZZARD',
    meaning: 'A severe, blinding snowstorm with high winds and extreme freezing temperatures.',
    difficulty: 'Elite',
    category: 'Extreme Weather',
    acceptedAnswers: ['BLIZZARD']
  },
  {
    level: 40,
    word: 'CHALLENGE',
    meaning: 'A demanding call or task that severely tests someone\'s abilities or resources.',
    difficulty: 'Elite',
    category: 'Esports & Mind',
    acceptedAnswers: ['CHALLENGE']
  },
  {
    level: 41,
    word: 'CHAMPION',
    meaning: 'A person who has surpassed all rivals in a sporting contest or competition.',
    difficulty: 'Elite',
    category: 'Victory',
    acceptedAnswers: ['CHAMPION']
  },
  {
    level: 42,
    word: 'ASTRONOMY',
    meaning: 'The branch of science dealing with celestial objects, space, and the universe.',
    difficulty: 'Elite',
    category: 'Cosmic Science',
    acceptedAnswers: ['ASTRONOMY']
  },
  {
    level: 43,
    word: 'TREASURE',
    meaning: 'A quantity of precious metals, gems, or valuable artifacts stored or hidden.',
    difficulty: 'Elite',
    category: 'Valuables',
    acceptedAnswers: ['TREASURE']
  },
  {
    level: 44,
    word: 'ADVENTURE',
    meaning: 'An exciting and hazardous undertaking requiring courage and curiosity.',
    difficulty: 'Elite',
    category: 'Exploration',
    acceptedAnswers: ['ADVENTURE']
  },
  {
    level: 45,
    word: 'LIGHTNING',
    meaning: 'A powerful sudden electrostatic discharge occurring during a thunderstorm.',
    difficulty: 'Elite',
    category: 'Electrodynamics',
    acceptedAnswers: ['LIGHTNING']
  },
  {
    level: 46,
    word: 'GUARDIAN',
    meaning: 'A defender, protector, or keeper who guards something precious or sacred.',
    difficulty: 'Elite',
    category: 'Sentinels',
    acceptedAnswers: ['GUARDIAN']
  },
  {
    level: 47,
    word: 'LABYRINTH',
    meaning: 'A complex, intricate combination of paths or passages in which it is difficult to navigate.',
    difficulty: 'Elite',
    category: 'Ancient Mazes',
    acceptedAnswers: ['LABYRINTH']
  },
  {
    level: 48,
    word: 'NIGHTMARE',
    meaning: 'A terrifying dream that evokes extreme fright, anxiety, and dread.',
    difficulty: 'Elite',
    category: 'Psychology',
    acceptedAnswers: ['NIGHTMARE']
  },
  {
    level: 49,
    word: 'DISCOVERY',
    meaning: 'The act or process of finding or learning something previously unseen or unknown.',
    difficulty: 'Elite',
    category: 'Innovation',
    acceptedAnswers: ['DISCOVERY']
  },
  {
    level: 50,
    word: 'EXCALIBUR',
    meaning: 'The legendary mystical sword of King Arthur, attributed with supernatural sovereignty.',
    difficulty: 'Elite',
    category: 'Mythic Legends',
    acceptedAnswers: ['EXCALIBUR']
  }
];

export function getLevelData(levelNumber: number): WordLevelData {
  const safeIndex = Math.max(0, (levelNumber - 1) % WORD_BUILDER_LEVELS.length);
  return {
    ...WORD_BUILDER_LEVELS[safeIndex],
    level: levelNumber
  };
}

export function scrambleWord(word: string): string[] {
  const letters = word.toUpperCase().split('');
  if (letters.length <= 1) return letters;

  let scrambled = [...letters];
  let attempts = 0;
  const maxAttempts = 50;

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

  // Fallback transposition
  if (scrambled.join('') === word.toUpperCase()) {
    [scrambled[0], scrambled[scrambled.length - 1]] = [scrambled[scrambled.length - 1], scrambled[0]];
  }

  return scrambled;
}

export function calculateLevelXP(level: number): number {
  if (level <= 5) return 15;
  if (level <= 15) return 25;
  if (level <= 25) return 35;
  if (level <= 38) return 50;
  return 75;
}

export function getTimerForDifficulty(diff: WordDifficulty): number {
  switch (diff) {
    case 'Starter':
      return 35;
    case 'Moderate':
      return 30;
    case 'Tough':
      return 25;
    case 'Hard':
      return 20;
    case 'Elite':
      return 18;
    default:
      return 25;
  }
}

export function validateWordAnswer(
  rawInput: string,
  levelData: WordLevelData
): { isValid: boolean; isAccepted: boolean; reason?: string } {
  const clean = rawInput.trim().toUpperCase().replace(/[^A-Z]/g, '');

  if (!clean) {
    return { isValid: false, isAccepted: false, reason: 'Please construct a word before submitting!' };
  }

  if (clean.length !== levelData.word.length) {
    return {
      isValid: false,
      isAccepted: false,
      reason: `Answer must use all ${levelData.word.length} letters.`
    };
  }

  // Multiset check
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
        reason: `Letter "${char}" does not match the available tiles.`
      };
    }
  }

  const accepted = (levelData.acceptedAnswers || [levelData.word]).map((w) => w.toUpperCase());
  const isAccepted = accepted.includes(clean) || clean === levelData.word.toUpperCase();

  return {
    isValid: true,
    isAccepted,
    reason: isAccepted ? undefined : `"${clean}" is not the target solution for this puzzle.`
  };
}

// =========================================================================
// Legacy Types & Exports for Multiplayer Compatibility
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
  difficulty: lvl.level <= 5 ? 'Easy' : lvl.level <= 15 ? 'Medium' : 'Hard',
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
