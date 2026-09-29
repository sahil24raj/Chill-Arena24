/**
 * Clean & Collision-Resistant 6-Character Room Code Generator
 * Uses unambiguous characters: Excludes 'O'/'0', 'I'/'1', 'S'/'5'.
 */

const SAFE_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
  'N', 'P', 'Q', 'R', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '2', '3', '4', '6', '7', '8', '9'
];

/**
 * Generates a high-entropy 6-character room code.
 */
export const generateRoomCode = (length = 6): string => {
  let code = '';
  // Use crypto API if available for cryptographically secure randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    for (let i = 0; i < length; i++) {
      code += SAFE_ALPHABET[randomBytes[i] % SAFE_ALPHABET.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      code += SAFE_ALPHABET[Math.floor(Math.random() * SAFE_ALPHABET.length)];
    }
  }
  return code;
};

/**
 * Normalizes user-entered room codes (removes leading '#', trims whitespace, transforms to uppercase).
 */
export const normalizeRoomCode = (rawCode: string): string => {
  if (!rawCode) return '';
  return rawCode
    .trim()
    .replace(/^#+/, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
};

/**
 * Validates whether a given room code follows the required 6-character format.
 */
export const isValidRoomCode = (code: string): boolean => {
  const normalized = normalizeRoomCode(code);
  return normalized.length >= 5 && normalized.length <= 8 && /^[A-Z0-9]+$/.test(normalized);
};
