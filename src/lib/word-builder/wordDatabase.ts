export interface WordPuzzleLevel {
  id: string;
  rootWord: string;
  letters: string[];
  theme: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetWords: string[]; // Key words to solve on the board
  allSolutions: {
    [length: number]: { word: string; definition: string }[];
  };
}

export const PUZZLE_LEVELS: WordPuzzleLevel[] = [
  {
    id: 'lvl-1',
    rootWord: 'PLANET',
    letters: ['P', 'L', 'A', 'N', 'E', 'T'],
    theme: 'Cosmic & Space',
    difficulty: 'Easy',
    targetWords: ['PLANET', 'PLANT', 'PLANE', 'PLATE', 'PANEL', 'LATE', 'TAPE', 'PLAN', 'NEAT', 'LEAP'],
    allSolutions: {
      6: [
        { word: 'PLANET', definition: 'A celestial body moving in an elliptical orbit around a star.' }
      ],
      5: [
        { word: 'PLANT', definition: 'A living organism of the kind exemplified by trees, shrubs, herbs.' },
        { word: 'PLANE', definition: 'A flat surface or aircraft.' },
        { word: 'PLATE', definition: 'A flat dish from which food is eaten.' },
        { word: 'PANEL', definition: 'A flat or curved component forming part of a surface.' },
        { word: 'PLEAT', definition: 'A double or multiple fold in a garment.' },
        { word: 'PETAL', definition: 'Each of the segments of the corolla of a flower.' }
      ],
      4: [
        { word: 'PLAN', definition: 'A detailed proposal for doing or achieving something.' },
        { word: 'LATE', definition: 'Taking place after the expected time.' },
        { word: 'TAPE', definition: 'A narrow strip of adhesive material.' },
        { word: 'NEAT', definition: 'Arranged in an orderly, tidy way.' },
        { word: 'LEAP', definition: 'Jump or spring a long way with force.' },
        { word: 'PALE', definition: 'Light in color or dim.' },
        { word: 'LANE', definition: 'A narrow road or track.' },
        { word: 'LEAN', definition: 'Be in a sloping position or slender.' },
        { word: 'TALE', definition: 'A narrative story.' },
        { word: 'PEAL', definition: 'A loud ringing of bells.' }
      ],
      3: [
        { word: 'PEN', definition: 'An instrument for writing with ink.' },
        { word: 'PAN', definition: 'A metal container used for cooking.' },
        { word: 'PET', definition: 'A domestic animal kept for companionship.' },
        { word: 'NET', definition: 'Mesh material used for catching.' },
        { word: 'TEN', definition: 'Number after nine; 10.' },
        { word: 'TAP', definition: 'Strike lightly or control valve.' },
        { word: 'PAT', definition: 'Touch gently with flat hand.' },
        { word: 'LET', definition: 'Allow or permit.' },
        { word: 'ALE', definition: 'A type of beer.' },
        { word: 'ATE', definition: 'Consumed food.' },
        { word: 'TEA', definition: 'A hot brewed herbal beverage.' },
        { word: 'EAT', definition: 'Chew and swallow food.' },
        { word: 'ANT', definition: 'Small social insect.' },
        { word: 'TAN', definition: 'Yellowish-brown hue.' },
        { word: 'APT', definition: 'Appropriate or suitable.' }
      ]
    }
  },
  {
    id: 'lvl-2',
    rootWord: 'STREAM',
    letters: ['S', 'T', 'R', 'E', 'A', 'M'],
    theme: 'Nature & Currents',
    difficulty: 'Easy',
    targetWords: ['STREAM', 'MASTER', 'SMART', 'STARE', 'STEAM', 'MATES', 'TEAMS', 'REST', 'STAR', 'TEAM', 'MEAT'],
    allSolutions: {
      6: [
        { word: 'STREAM', definition: 'A small, narrow river or continuous flow.' },
        { word: 'MASTER', definition: 'A person skilled in a particular art or trade.' },
        { word: 'TAMERS', definition: 'People who train wild animals.' }
      ],
      5: [
        { word: 'SMART', definition: 'Having or showing quick-witted intelligence.' },
        { word: 'STARE', definition: 'Look fixedly with wide eyes.' },
        { word: 'STEAM', definition: 'Vapor into which water converts when heated.' },
        { word: 'MATES', definition: 'Friends, companions, or partners.' },
        { word: 'TEAMS', definition: 'Groups of players in competitive sports.' },
        { word: 'TAMER', definition: 'One who trains wild creatures.' },
        { word: 'RATES', definition: 'Measures or prices per unit.' }
      ],
      4: [
        { word: 'REST', definition: 'Cease work to relax or sleep.' },
        { word: 'STAR', definition: 'A fixed luminous point in the night sky.' },
        { word: 'TEAM', definition: 'A cooperative group.' },
        { word: 'MEAT', definition: 'Flesh of animals as food.' },
        { word: 'MATE', definition: 'Friend or partner.' },
        { word: 'RATE', definition: 'Speed, frequency, or value.' },
        { word: 'SEAM', definition: 'Line joining two pieces of cloth.' },
        { word: 'STEM', definition: 'Main stalk of a plant.' },
        { word: 'MAST', definition: 'Tall upright pole on a ship.' },
        { word: 'SEAT', definition: 'Furniture designed for sitting.' },
        { word: 'EAST', definition: 'Direction of sunrise.' },
        { word: 'TEAR', definition: 'Rip apart or drop from eye.' },
        { word: 'ARMS', definition: 'Upper limbs or weapons.' }
      ],
      3: [
        { word: 'SEA', definition: 'Large body of salt water.' },
        { word: 'SET', definition: 'Place or position.' },
        { word: 'MAT', definition: 'Floor covering piece.' },
        { word: 'RAT', definition: 'Small rodent mammal.' },
        { word: 'TAR', definition: 'Dark thick petroleum liquid.' },
        { word: 'ART', definition: 'Human creative expression.' },
        { word: 'RAM', definition: 'Male adult sheep.' },
        { word: 'ARM', definition: 'Upper human limb.' },
        { word: 'EAT', definition: 'Consume nourishment.' },
        { word: 'TEA', definition: 'Herbal hot infusion.' },
        { word: 'EAR', definition: 'Hearing organ.' }
      ]
    }
  },
  {
    id: 'lvl-3',
    rootWord: 'CASTLE',
    letters: ['C', 'A', 'S', 'T', 'L', 'E'],
    theme: 'Medieval Fortresses',
    difficulty: 'Medium',
    targetWords: ['CASTLE', 'SCALE', 'STALE', 'CLEAT', 'LACE', 'SALE', 'LATE', 'EAST', 'CASE', 'CAST'],
    allSolutions: {
      6: [
        { word: 'CASTLE', definition: 'A fortified medieval building with towers.' }
      ],
      5: [
        { word: 'SCALE', definition: 'Graduated series or fish skin plates.' },
        { word: 'STALE', definition: 'No longer fresh; hard or dry.' },
        { word: 'CLEAT', definition: 'T-shaped fastening fixture.' },
        { word: 'CASTE', definition: 'Hereditary social class.' }
      ],
      4: [
        { word: 'LACE', definition: 'Delicate open fabric.' },
        { word: 'SALE', definition: 'Exchange of goods for money.' },
        { word: 'LATE', definition: 'After the agreed time.' },
        { word: 'EAST', definition: 'Compass direction.' },
        { word: 'CASE', definition: 'Instance or container.' },
        { word: 'CAST', definition: 'Throw forcefully or acting ensemble.' },
        { word: 'SEAL', definition: 'Marine mammal or stamp of approval.' },
        { word: 'TALE', definition: 'Imaginative story.' }
      ],
      3: [
        { word: 'CAT', definition: 'Feline companion animal.' },
        { word: 'ACT', definition: 'Take action or perform.' },
        { word: 'ACE', definition: 'Top playing card or expert.' },
        { word: 'LET', definition: 'Permit.' },
        { word: 'SET', definition: 'Group or place.' },
        { word: 'SEA', definition: 'Ocean body.' },
        { word: 'TEA', definition: 'Hot beverage.' },
        { word: 'ATE', definition: 'Swallowed food.' }
      ]
    }
  },
  {
    id: 'lvl-4',
    rootWord: 'SILENT',
    letters: ['S', 'I', 'L', 'E', 'N', 'T'],
    theme: 'Mystery & Focus',
    difficulty: 'Medium',
    targetWords: ['SILENT', 'LISTEN', 'INLET', 'STEIN', 'LINES', 'TILES', 'LINE', 'NEST', 'LION', 'LENT', 'TILE'],
    allSolutions: {
      6: [
        { word: 'SILENT', definition: 'Making completely no sound.' },
        { word: 'LISTEN', definition: 'Give attention to sound.' },
        { word: 'TINSEL', definition: 'Shiny metallic decoration ribbon.' }
      ],
      5: [
        { word: 'INLET', definition: 'Narrow water opening.' },
        { word: 'STEIN', definition: 'Large ceramic drink mug.' },
        { word: 'LINES', definition: 'Long marks or boundaries.' },
        { word: 'TILES', definition: 'Clay or ceramic plates for flooring.' }
      ],
      4: [
        { word: 'LINE', definition: 'Continuous mark.' },
        { word: 'NEST', definition: 'Bird home for hatching eggs.' },
        { word: 'LION', definition: 'Majestic feline king of jungle.' },
        { word: 'LENT', definition: 'Loaned temporarily.' },
        { word: 'TILE', definition: 'Square slab for floor or wall.' },
        { word: 'SITE', definition: 'Location or construction area.' },
        { word: 'SENT', definition: 'Dispatched to destination.' }
      ],
      3: [
        { word: 'SET', definition: 'Fix in place.' },
        { word: 'SIT', definition: 'Rest on chair.' },
        { word: 'NET', definition: 'Intertwined mesh.' },
        { word: 'TEN', definition: 'Number 10.' },
        { word: 'TIN', definition: 'Metallic chemical element.' },
        { word: 'SIN', definition: 'Moral transgression.' },
        { word: 'LIE', definition: 'False statement or recline.' },
        { word: 'LIT', definition: 'Brightened with light.' }
      ]
    }
  },
  {
    id: 'lvl-5',
    rootWord: 'FRIEND',
    letters: ['F', 'R', 'I', 'E', 'N', 'D'],
    theme: 'Companionship',
    difficulty: 'Medium',
    targetWords: ['FRIEND', 'FIEND', 'DINER', 'FINED', 'RIDE', 'FIND', 'FIRE', 'FINE', 'DINE', 'RED'],
    allSolutions: {
      6: [
        { word: 'FRIEND', definition: 'A person with whom one has a bond of affection.' }
      ],
      5: [
        { word: 'FIEND', definition: 'Enthusiast or mischievous spirit.' },
        { word: 'DINER', definition: 'One who partakes in a meal or roadside restaurant.' },
        { word: 'FINED', definition: 'Penalized with money.' }
      ],
      4: [
        { word: 'RIDE', definition: 'Journey on a vehicle or animal.' },
        { word: 'FIND', definition: 'Discover by searching.' },
        { word: 'FIRE', definition: 'Combustion emitting heat and light.' },
        { word: 'FINE', definition: 'Excellent quality or fee.' },
        { word: 'DINE', definition: 'Eat formal meal.' },
        { word: 'DIRE', definition: 'Urgent and desperate.' },
        { word: 'FERN', definition: 'Green frond plant.' }
      ],
      3: [
        { word: 'RED', definition: 'Crimson color.' },
        { word: 'FED', definition: 'Given sustenance.' },
        { word: 'DIE', definition: 'Gaming cube or cease living.' },
        { word: 'DEN', definition: 'Animal retreat or study room.' },
        { word: 'END', definition: 'Terminal conclusion.' },
        { word: 'FIN', definition: 'Fish steering appendage.' },
        { word: 'RID', definition: 'Clear away unwanted items.' }
      ]
    }
  },
  {
    id: 'lvl-6',
    rootWord: 'GARDEN',
    letters: ['G', 'A', 'R', 'D', 'E', 'N'],
    theme: 'Flora & Earth',
    difficulty: 'Easy',
    targetWords: ['GARDEN', 'DANGER', 'RANGED', 'GRADE', 'GRAND', 'DREAM', 'READ', 'DEAR', 'NEAR', 'EARN', 'GEAR'],
    allSolutions: {
      6: [
        { word: 'GARDEN', definition: 'Plot of ground for cultivating plants and flowers.' },
        { word: 'DANGER', definition: 'Risk of harm or peril.' },
        { word: 'GANDER', definition: 'Male goose or quick glance.' }
      ],
      5: [
        { word: 'GRADE', definition: 'Level of quality or slope.' },
        { word: 'GRAND', definition: 'Magnificent or one thousand.' },
        { word: 'RANGED', definition: 'Varied between bounds.' },
        { word: 'ANGER', definition: 'Strong feeling of displeasure.' }
      ],
      4: [
        { word: 'READ', definition: 'Interpret written language.' },
        { word: 'DEAR', definition: 'Cherished or costly.' },
        { word: 'NEAR', definition: 'Close in proximity.' },
        { word: 'EARN', definition: 'Gain through effort.' },
        { word: 'GEAR', definition: 'Equipment or cogwheel.' },
        { word: 'RAGE', definition: 'Intense boiling anger.' },
        { word: 'DARE', definition: 'Challenge courage.' }
      ],
      3: [
        { word: 'RED', definition: 'Ruby color.' },
        { word: 'AGE', definition: 'Years lived.' },
        { word: 'RAG', definition: 'Scrap of fabric.' },
        { word: 'END', definition: 'Completion point.' },
        { word: 'DEN', definition: 'Quiet room.' },
        { word: 'EAR', definition: 'Auditory sensor.' }
      ]
    }
  },
  {
    id: 'lvl-7',
    rootWord: 'BRIGHT',
    letters: ['B', 'R', 'I', 'G', 'H', 'T'],
    theme: 'Luminescence',
    difficulty: 'Hard',
    targetWords: ['BRIGHT', 'BIRTH', 'RIGHT', 'GRITH', 'BRIG', 'GRIT', 'GIRTH', 'BIRD', 'HIT', 'BIT', 'RIB'],
    allSolutions: {
      6: [
        { word: 'BRIGHT', definition: 'Emitting or reflecting much light; shining.' }
      ],
      5: [
        { word: 'RIGHT', definition: 'Morally good, justified, or correct direction.' },
        { word: 'BIRTH', definition: 'The emergence of a baby or other young from the body of its mother.' },
        { word: 'GIRTH', definition: 'The measurement around the middle of something.' }
      ],
      4: [
        { word: 'GRIT', definition: 'Small loose particles of stone or sand; courage and resolve.' },
        { word: 'BRIG', definition: 'A two-masted square-rigged ship or military prison.' },
        { word: 'THIR', definition: 'These (archaic dialect).' }
      ],
      3: [
        { word: 'BIT', definition: 'A small piece, amount, or binary digit.' },
        { word: 'HIT', definition: 'Bring one\'s hand or tool into contact forcefully.' },
        { word: 'RIB', definition: 'Each of a series of curved bones in chest.' },
        { word: 'BIG', definition: 'Of considerable size or extent.' },
        { word: 'RIG', definition: 'Set up equipment for use.' }
      ]
    }
  }
];

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
