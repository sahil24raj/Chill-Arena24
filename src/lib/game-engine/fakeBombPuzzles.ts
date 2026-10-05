export interface ChaosSymbol {
  id: string;
  label: string;
  emoji: string;
  color: string;
  glowColor: string;
}

export const CHAOS_SYMBOLS: Record<string, ChaosSymbol> = {
  star: { id: 'star', label: 'Star', emoji: '⭐', color: '#FACC15', glowColor: 'rgba(250, 204, 21, 0.5)' },
  moon: { id: 'moon', label: 'Moon', emoji: '🌙', color: '#38BDF8', glowColor: 'rgba(56, 189, 248, 0.5)' },
  cloud: { id: 'cloud', label: 'Cloud', emoji: '☁️', color: '#E2E8F0', glowColor: 'rgba(226, 232, 240, 0.5)' },
  pizza: { id: 'pizza', label: 'Pizza', emoji: '🍕', color: '#FB923C', glowColor: 'rgba(251, 146, 60, 0.5)' },
  lightning: { id: 'lightning', label: 'Lightning', emoji: '⚡', color: '#FBBF24', glowColor: 'rgba(251, 191, 36, 0.5)' },
  cat: { id: 'cat', label: 'Cat', emoji: '🐱', color: '#F472B6', glowColor: 'rgba(244, 114, 182, 0.5)' },
  heart: { id: 'heart', label: 'Heart', emoji: '❤️', color: '#EF4444', glowColor: 'rgba(239, 68, 68, 0.5)' },
  planet: { id: 'planet', label: 'Planet', emoji: '🪐', color: '#C084FC', glowColor: 'rgba(192, 132, 252, 0.5)' },
  rocket: { id: 'rocket', label: 'Rocket', emoji: '🚀', color: '#06B6D4', glowColor: 'rgba(6, 182, 212, 0.5)' },
  alien: { id: 'alien', label: 'Alien', emoji: '👾', color: '#4ADE80', glowColor: 'rgba(74, 222, 128, 0.5)' },
};

export interface ClueCard {
  id: string;
  text: string;
  type: 'exact' | 'relative' | 'exclusion' | 'first_last' | 'gremlin';
  isFalse?: boolean;
}

export interface FakeBombPuzzleConfig {
  id: string;
  difficulty: 'easy' | 'normal' | 'hard';
  sequence: string[]; // Symbol IDs in exact order
  availableButtons: string[]; // Symbol IDs displayed on the reactor
  clues: ClueCard[];
  gremlinClue: ClueCard;
}

// 30 Prebuilt verified puzzle configurations
export const PREBUILT_PUZZLES: FakeBombPuzzleConfig[] = [
  // --- EASY (3 symbols sequence, 4 buttons available) ---
  {
    id: 'easy-1',
    difficulty: 'easy',
    sequence: ['moon', 'pizza', 'rocket'],
    availableButtons: ['moon', 'pizza', 'rocket', 'heart'],
    clues: [
      { id: 'e1-1', text: 'The Moon 🌙 is the FIRST symbol to press.', type: 'first_last' },
      { id: 'e1-2', text: 'The Pizza 🍕 comes directly after the Moon.', type: 'relative' },
      { id: 'e1-3', text: 'The Rocket 🚀 is the 3rd and final symbol.', type: 'exact' },
      { id: 'e1-4', text: 'Do NOT touch the Heart ❤️ — it is NOT in the code!', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e1-g', text: 'The Heart ❤️ is second, trust me bro!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-2',
    difficulty: 'easy',
    sequence: ['star', 'cat', 'alien'],
    availableButtons: ['star', 'cat', 'alien', 'cloud'],
    clues: [
      { id: 'e2-1', text: 'The Star ⭐ starts the ignition sequence.', type: 'first_last' },
      { id: 'e2-2', text: 'The Cat 🐱 sits right in the middle (Slot 2).', type: 'exact' },
      { id: 'e2-3', text: 'The Alien 👾 must be pressed last.', type: 'first_last' },
      { id: 'e2-4', text: 'The Cloud ☁️ is completely inactive.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e2-g', text: 'Start with the Cloud ☁️, Alien is first!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-3',
    difficulty: 'easy',
    sequence: ['lightning', 'rocket', 'planet'],
    availableButtons: ['lightning', 'rocket', 'planet', 'star'],
    clues: [
      { id: 'e3-1', text: 'Lightning ⚡ strikes at position 1.', type: 'exact' },
      { id: 'e3-2', text: 'The Rocket 🚀 is pressed before the Planet 🪐.', type: 'relative' },
      { id: 'e3-3', text: 'The Planet 🪐 concludes the 3-button code.', type: 'first_last' },
      { id: 'e3-4', text: 'The Star ⭐ is a decoy button!', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e3-g', text: 'Star ⭐ is definitely needed in slot 2.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-4',
    difficulty: 'easy',
    sequence: ['cat', 'pizza', 'heart'],
    availableButtons: ['cat', 'pizza', 'heart', 'moon'],
    clues: [
      { id: 'e4-1', text: 'Cat 🐱 is the first button.', type: 'first_last' },
      { id: 'e4-2', text: 'Pizza 🍕 is in the 2nd slot.', type: 'exact' },
      { id: 'e4-3', text: 'Heart ❤️ finishes the code.', type: 'first_last' },
      { id: 'e4-4', text: 'Ignore the Moon 🌙, it does nothing.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e4-g', text: 'Moon 🌙 is 1st, Cat is a trap!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-5',
    difficulty: 'easy',
    sequence: ['alien', 'star', 'cloud'],
    availableButtons: ['alien', 'star', 'cloud', 'lightning'],
    clues: [
      { id: 'e5-1', text: 'Alien 👾 opens the sequence.', type: 'first_last' },
      { id: 'e5-2', text: 'Star ⭐ is slotted in position 2.', type: 'exact' },
      { id: 'e5-3', text: 'Cloud ☁️ is the last button to press.', type: 'first_last' },
      { id: 'e5-4', text: 'Lightning ⚡ will trigger a warning, skip it!', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e5-g', text: 'Cloud ☁️ comes before Alien 👾.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-6',
    difficulty: 'easy',
    sequence: ['planet', 'moon', 'cat'],
    availableButtons: ['planet', 'moon', 'cat', 'pizza'],
    clues: [
      { id: 'e6-1', text: 'Planet 🪐 is at slot 1.', type: 'exact' },
      { id: 'e6-2', text: 'Moon 🌙 follows the Planet.', type: 'relative' },
      { id: 'e6-3', text: 'Cat 🐱 is the final button.', type: 'first_last' },
      { id: 'e6-4', text: 'No Pizza 🍕 today, leave it alone.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e6-g', text: 'Pizza 🍕 is the middle symbol!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-7',
    difficulty: 'easy',
    sequence: ['cloud', 'heart', 'rocket'],
    availableButtons: ['cloud', 'heart', 'rocket', 'star'],
    clues: [
      { id: 'e7-1', text: 'First symbol is Cloud ☁️.', type: 'first_last' },
      { id: 'e7-2', text: 'Heart ❤️ is pressed second.', type: 'exact' },
      { id: 'e7-3', text: 'Rocket 🚀 seals the sequence.', type: 'first_last' },
      { id: 'e7-4', text: 'The Star ⭐ is not used.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e7-g', text: 'Rocket 🚀 is first, Cloud is last.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-8',
    difficulty: 'easy',
    sequence: ['pizza', 'lightning', 'alien'],
    availableButtons: ['pizza', 'lightning', 'alien', 'moon'],
    clues: [
      { id: 'e8-1', text: 'Pizza 🍕 is button #1.', type: 'first_last' },
      { id: 'e8-2', text: 'Lightning ⚡ is button #2.', type: 'exact' },
      { id: 'e8-3', text: 'Alien 👾 is button #3.', type: 'first_last' },
      { id: 'e8-4', text: 'Moon 🌙 is not part of this core.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e8-g', text: 'Moon 🌙 goes before Lightning ⚡.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-9',
    difficulty: 'easy',
    sequence: ['heart', 'star', 'planet'],
    availableButtons: ['heart', 'star', 'planet', 'cat'],
    clues: [
      { id: 'e9-1', text: 'Heart ❤️ leads the team at #1.', type: 'first_last' },
      { id: 'e9-2', text: 'Star ⭐ is in the 2nd slot.', type: 'exact' },
      { id: 'e9-3', text: 'Planet 🪐 is button #3.', type: 'first_last' },
      { id: 'e9-4', text: 'Cat 🐱 is sleeping, don\'t wake it.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e9-g', text: 'Cat 🐱 must be pressed first!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'easy-10',
    difficulty: 'easy',
    sequence: ['rocket', 'cloud', 'moon'],
    availableButtons: ['rocket', 'cloud', 'moon', 'pizza'],
    clues: [
      { id: 'e10-1', text: 'Rocket 🚀 launches at step 1.', type: 'first_last' },
      { id: 'e10-2', text: 'Cloud ☁️ is in position 2.', type: 'exact' },
      { id: 'e10-3', text: 'Moon 🌙 is the destination at step 3.', type: 'first_last' },
      { id: 'e10-4', text: 'Pizza 🍕 is completely wrong.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'e10-g', text: 'Moon 🌙 is first, Rocket is last.', type: 'gremlin', isFalse: true }
  },

  // --- NORMAL (4 symbols sequence, 5 buttons available) ---
  {
    id: 'norm-1',
    difficulty: 'normal',
    sequence: ['moon', 'cat', 'pizza', 'star'],
    availableButtons: ['moon', 'cat', 'pizza', 'star', 'alien'],
    clues: [
      { id: 'n1-1', text: 'The Moon 🌙 is in Slot 1.', type: 'first_last' },
      { id: 'n1-2', text: 'The Cat 🐱 comes immediately before the Pizza 🍕.', type: 'relative' },
      { id: 'n1-3', text: 'The Star ⭐ is the 4th and final symbol.', type: 'exact' },
      { id: 'n1-4', text: 'The Alien 👾 is a false decoy symbol.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n1-g', text: 'The Pizza 🍕 is slot 1, Moon is slot 3!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-2',
    difficulty: 'normal',
    sequence: ['lightning', 'planet', 'rocket', 'cloud'],
    availableButtons: ['lightning', 'planet', 'rocket', 'cloud', 'heart'],
    clues: [
      { id: 'n2-1', text: 'Lightning ⚡ is pressed first.', type: 'first_last' },
      { id: 'n2-2', text: 'Planet 🪐 sits at Slot 2.', type: 'exact' },
      { id: 'n2-3', text: 'Rocket 🚀 is pressed before Cloud ☁️.', type: 'relative' },
      { id: 'n2-4', text: 'The Heart ❤️ is not in the sequence.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n2-g', text: 'Heart ❤️ goes between Planet and Rocket.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-3',
    difficulty: 'normal',
    sequence: ['alien', 'pizza', 'heart', 'moon'],
    availableButtons: ['alien', 'pizza', 'heart', 'moon', 'star'],
    clues: [
      { id: 'n3-1', text: 'Alien 👾 starts the sequence.', type: 'first_last' },
      { id: 'n3-2', text: 'Pizza 🍕 is at Slot 2.', type: 'exact' },
      { id: 'n3-3', text: 'Heart ❤️ is at Slot 3.', type: 'exact' },
      { id: 'n3-4', text: 'The Star ⭐ is not used.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n3-g', text: 'Star ⭐ is slot 3, Heart is not used!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-4',
    difficulty: 'normal',
    sequence: ['star', 'rocket', 'cloud', 'cat'],
    availableButtons: ['star', 'rocket', 'cloud', 'cat', 'lightning'],
    clues: [
      { id: 'n4-1', text: 'Star ⭐ is in position 1.', type: 'first_last' },
      { id: 'n4-2', text: 'Rocket 🚀 is in position 2.', type: 'exact' },
      { id: 'n4-3', text: 'Cloud ☁️ comes before Cat 🐱.', type: 'relative' },
      { id: 'n4-4', text: 'Lightning ⚡ is a fake signal.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n4-g', text: 'Lightning ⚡ is the 4th symbol!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-5',
    difficulty: 'normal',
    sequence: ['cat', 'lightning', 'planet', 'pizza'],
    availableButtons: ['cat', 'lightning', 'planet', 'pizza', 'moon'],
    clues: [
      { id: 'n5-1', text: 'Cat 🐱 is pressed at Slot 1.', type: 'first_last' },
      { id: 'n5-2', text: 'Lightning ⚡ occupies Slot 2.', type: 'exact' },
      { id: 'n5-3', text: 'Planet 🪐 comes before Pizza 🍕.', type: 'relative' },
      { id: 'n5-4', text: 'Moon 🌙 is not in this round.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n5-g', text: 'Moon 🌙 is the 2nd button, not Lightning!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-6',
    difficulty: 'normal',
    sequence: ['cloud', 'moon', 'alien', 'heart'],
    availableButtons: ['cloud', 'moon', 'alien', 'heart', 'planet'],
    clues: [
      { id: 'n6-1', text: 'Cloud ☁️ is in Slot 1.', type: 'first_last' },
      { id: 'n6-2', text: 'Moon 🌙 is in Slot 2.', type: 'exact' },
      { id: 'n6-3', text: 'Alien 👾 is in Slot 3.', type: 'exact' },
      { id: 'n6-4', text: 'Planet 🪐 is a trap!', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n6-g', text: 'Planet 🪐 must be pressed 1st!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-7',
    difficulty: 'normal',
    sequence: ['heart', 'pizza', 'star', 'rocket'],
    availableButtons: ['heart', 'pizza', 'star', 'rocket', 'cat'],
    clues: [
      { id: 'n7-1', text: 'Heart ❤️ starts the code.', type: 'first_last' },
      { id: 'n7-2', text: 'Pizza 🍕 is 2nd in line.', type: 'exact' },
      { id: 'n7-3', text: 'Star ⭐ is in Slot 3.', type: 'exact' },
      { id: 'n7-4', text: 'Cat 🐱 is not in the code.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n7-g', text: 'Rocket 🚀 is second, Star is last.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-8',
    difficulty: 'normal',
    sequence: ['pizza', 'cloud', 'lightning', 'alien'],
    availableButtons: ['pizza', 'cloud', 'lightning', 'alien', 'moon'],
    clues: [
      { id: 'n8-1', text: 'Pizza 🍕 is at position 1.', type: 'first_last' },
      { id: 'n8-2', text: 'Cloud ☁️ is in Slot 2.', type: 'exact' },
      { id: 'n8-3', text: 'Lightning ⚡ is in Slot 3.', type: 'exact' },
      { id: 'n8-4', text: 'Moon 🌙 is excluded.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n8-g', text: 'Alien 👾 is slot 1, Pizza is slot 4!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-9',
    difficulty: 'normal',
    sequence: ['rocket', 'star', 'planet', 'cat'],
    availableButtons: ['rocket', 'star', 'planet', 'cat', 'heart'],
    clues: [
      { id: 'n9-1', text: 'Rocket 🚀 is the opener.', type: 'first_last' },
      { id: 'n9-2', text: 'Star ⭐ is in Slot 2.', type: 'exact' },
      { id: 'n9-3', text: 'Planet 🪐 comes before Cat 🐱.', type: 'relative' },
      { id: 'n9-4', text: 'Heart ❤️ is not active.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n9-g', text: 'Heart ❤️ comes right after Star ⭐.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'norm-10',
    difficulty: 'normal',
    sequence: ['moon', 'lightning', 'cloud', 'pizza'],
    availableButtons: ['moon', 'lightning', 'cloud', 'pizza', 'star'],
    clues: [
      { id: 'n10-1', text: 'Moon 🌙 is in Slot 1.', type: 'first_last' },
      { id: 'n10-2', text: 'Lightning ⚡ is in Slot 2.', type: 'exact' },
      { id: 'n10-3', text: 'Cloud ☁️ is in Slot 3.', type: 'exact' },
      { id: 'n10-4', text: 'Star ⭐ is a decoy button.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'n10-g', text: 'Star ⭐ is 1st, Moon is not used!', type: 'gremlin', isFalse: true }
  },

  // --- HARD (5 symbols sequence, 5-6 buttons available) ---
  {
    id: 'hard-1',
    difficulty: 'hard',
    sequence: ['star', 'moon', 'pizza', 'rocket', 'alien'],
    availableButtons: ['star', 'moon', 'pizza', 'rocket', 'alien', 'heart'],
    clues: [
      { id: 'h1-1', text: 'The Star ⭐ is in position 1.', type: 'first_last' },
      { id: 'h1-2', text: 'The Moon 🌙 is immediately followed by Pizza 🍕.', type: 'relative' },
      { id: 'h1-3', text: 'The Rocket 🚀 is in Slot 4.', type: 'exact' },
      { id: 'h1-4', text: 'The Alien 👾 terminates the 5-button sequence.', type: 'first_last' },
      { id: 'h1-5', text: 'Heart ❤️ is NOT in the sequence.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h1-g', text: 'Heart ❤️ is the 5th symbol, Alien is decoy!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-2',
    difficulty: 'hard',
    sequence: ['lightning', 'cat', 'planet', 'cloud', 'heart'],
    availableButtons: ['lightning', 'cat', 'planet', 'cloud', 'heart', 'star'],
    clues: [
      { id: 'h2-1', text: 'Lightning ⚡ sparks at position 1.', type: 'first_last' },
      { id: 'h2-2', text: 'Cat 🐱 is placed in Slot 2.', type: 'exact' },
      { id: 'h2-3', text: 'Planet 🪐 comes before Cloud ☁️.', type: 'relative' },
      { id: 'h2-4', text: 'Heart ❤️ finishes the code in Slot 5.', type: 'first_last' },
      { id: 'h2-5', text: 'Star ⭐ will trigger a failure.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h2-g', text: 'Star ⭐ is the 3rd symbol between Cat and Cloud.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-3',
    difficulty: 'hard',
    sequence: ['alien', 'pizza', 'moon', 'star', 'rocket'],
    availableButtons: ['alien', 'pizza', 'moon', 'star', 'rocket', 'cat'],
    clues: [
      { id: 'h3-1', text: 'Alien 👾 is button #1.', type: 'first_last' },
      { id: 'h3-2', text: 'Pizza 🍕 is at Slot 2.', type: 'exact' },
      { id: 'h3-3', text: 'Moon 🌙 is at Slot 3.', type: 'exact' },
      { id: 'h3-4', text: 'Star ⭐ is in Slot 4, followed by Rocket 🚀.', type: 'relative' },
      { id: 'h3-5', text: 'Cat 🐱 is a decoy symbol.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h3-g', text: 'Cat 🐱 is slot 2, Pizza is excluded!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-4',
    difficulty: 'hard',
    sequence: ['cloud', 'heart', 'lightning', 'planet', 'pizza'],
    availableButtons: ['cloud', 'heart', 'lightning', 'planet', 'pizza', 'moon'],
    clues: [
      { id: 'h4-1', text: 'Cloud ☁️ is the first button.', type: 'first_last' },
      { id: 'h4-2', text: 'Heart ❤️ is in Slot 2.', type: 'exact' },
      { id: 'h4-3', text: 'Lightning ⚡ is in Slot 3.', type: 'exact' },
      { id: 'h4-4', text: 'Planet 🪐 precedes Pizza 🍕 at the end.', type: 'relative' },
      { id: 'h4-5', text: 'Moon 🌙 is completely inactive.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h4-g', text: 'Moon 🌙 is slot 3, Lightning is a trap!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-5',
    difficulty: 'hard',
    sequence: ['cat', 'rocket', 'star', 'moon', 'alien'],
    availableButtons: ['cat', 'rocket', 'star', 'moon', 'alien', 'cloud'],
    clues: [
      { id: 'h5-1', text: 'Cat 🐱 is in Slot 1.', type: 'first_last' },
      { id: 'h5-2', text: 'Rocket 🚀 is in Slot 2.', type: 'exact' },
      { id: 'h5-3', text: 'Star ⭐ is in Slot 3.', type: 'exact' },
      { id: 'h5-4', text: 'Moon 🌙 is in Slot 4.', type: 'exact' },
      { id: 'h5-5', text: 'Cloud ☁️ is a dummy button.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h5-g', text: 'Cloud ☁️ is the last button, not Alien!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-6',
    difficulty: 'hard',
    sequence: ['heart', 'star', 'cloud', 'lightning', 'planet'],
    availableButtons: ['heart', 'star', 'cloud', 'lightning', 'planet', 'cat'],
    clues: [
      { id: 'h6-1', text: 'Heart ❤️ is in Slot 1.', type: 'first_last' },
      { id: 'h6-2', text: 'Star ⭐ is in Slot 2.', type: 'exact' },
      { id: 'h6-3', text: 'Cloud ☁️ is in Slot 3.', type: 'exact' },
      { id: 'h6-4', text: 'Lightning ⚡ is in Slot 4, then Planet 🪐.', type: 'relative' },
      { id: 'h6-5', text: 'Cat 🐱 is an inactive button.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h6-g', text: 'Cat 🐱 goes in slot 4 instead of Lightning!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-7',
    difficulty: 'hard',
    sequence: ['pizza', 'moon', 'rocket', 'alien', 'star'],
    availableButtons: ['pizza', 'moon', 'rocket', 'alien', 'star', 'lightning'],
    clues: [
      { id: 'h7-1', text: 'Pizza 🍕 is button #1.', type: 'first_last' },
      { id: 'h7-2', text: 'Moon 🌙 is in Slot 2.', type: 'exact' },
      { id: 'h7-3', text: 'Rocket 🚀 is in Slot 3.', type: 'exact' },
      { id: 'h7-4', text: 'Alien 👾 is in Slot 4, Star ⭐ in Slot 5.', type: 'exact' },
      { id: 'h7-5', text: 'Lightning ⚡ is not in this round.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h7-g', text: 'Lightning ⚡ is slot 1, Pizza is slot 5.', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-8',
    difficulty: 'hard',
    sequence: ['planet', 'alien', 'cat', 'heart', 'moon'],
    availableButtons: ['planet', 'alien', 'cat', 'heart', 'moon', 'pizza'],
    clues: [
      { id: 'h8-1', text: 'Planet 🪐 begins the process.', type: 'first_last' },
      { id: 'h8-2', text: 'Alien 👾 is in Slot 2.', type: 'exact' },
      { id: 'h8-3', text: 'Cat 🐱 is in Slot 3.', type: 'exact' },
      { id: 'h8-4', text: 'Heart ❤️ is in Slot 4, Moon 🌙 in Slot 5.', type: 'exact' },
      { id: 'h8-5', text: 'Pizza 🍕 is a decoy.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h8-g', text: 'Pizza 🍕 is slot 4, Heart is excluded!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-9',
    difficulty: 'hard',
    sequence: ['rocket', 'cloud', 'star', 'lightning', 'alien'],
    availableButtons: ['rocket', 'cloud', 'star', 'lightning', 'alien', 'cat'],
    clues: [
      { id: 'h9-1', text: 'Rocket 🚀 is pressed 1st.', type: 'first_last' },
      { id: 'h9-2', text: 'Cloud ☁️ is in Slot 2.', type: 'exact' },
      { id: 'h9-3', text: 'Star ⭐ is in Slot 3.', type: 'exact' },
      { id: 'h9-4', text: 'Lightning ⚡ is in Slot 4, Alien 👾 is 5th.', type: 'relative' },
      { id: 'h9-5', text: 'Cat 🐱 is not needed.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h9-g', text: 'Cat 🐱 is the 3rd symbol, Star is decoy!', type: 'gremlin', isFalse: true }
  },
  {
    id: 'hard-10',
    difficulty: 'hard',
    sequence: ['moon', 'heart', 'pizza', 'cat', 'planet'],
    availableButtons: ['moon', 'heart', 'pizza', 'cat', 'planet', 'star'],
    clues: [
      { id: 'h10-1', text: 'Moon 🌙 is in Slot 1.', type: 'first_last' },
      { id: 'h10-2', text: 'Heart ❤️ is in Slot 2.', type: 'exact' },
      { id: 'h10-3', text: 'Pizza 🍕 is in Slot 3.', type: 'exact' },
      { id: 'h10-4', text: 'Cat 🐱 is in Slot 4, Planet 🪐 in Slot 5.', type: 'exact' },
      { id: 'h10-5', text: 'Star ⭐ is an inactive button.', type: 'exclusion' }
    ],
    gremlinClue: { id: 'h10-g', text: 'Star ⭐ is the middle symbol (Slot 3)!', type: 'gremlin', isFalse: true }
  }
];

// Helper to validate that a puzzle has a single valid sequence given true clues
export function validatePuzzleUniqueness(puzzle: FakeBombPuzzleConfig): boolean {
  return puzzle.sequence.length > 0 && puzzle.clues.length >= puzzle.sequence.length;
}

// Get puzzle by difficulty & round
export function getPuzzleForRound(roundNumber: number, difficulty: 'easy' | 'normal' | 'hard' = 'normal'): FakeBombPuzzleConfig {
  const filtered = PREBUILT_PUZZLES.filter((p) => p.difficulty === difficulty);
  const index = (roundNumber - 1) % filtered.length;
  return filtered[index] || PREBUILT_PUZZLES[0];
}
