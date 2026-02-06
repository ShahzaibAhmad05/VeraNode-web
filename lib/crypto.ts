/**
 * Cryptographic utilities for VeraNode
 * Handles nullifier generation, hashing, and blockchain integrity
 */

/**
 * Generate a SHA-256 hash from a string
 */
export async function generateHash(input: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side (won't be used much, but for completeness)
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  // Client-side using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a unique nullifier for user-rumor combination
 * Nullifier = Hash(SecretKey + RumorID)
 */
export async function generateNullifier(secretKey: string, rumorId: string): Promise<string> {
  const combined = secretKey + rumorId;
  return generateHash(combined);
}

/**
 * Generate a random secret key for a new user
 */
export function generateSecretKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate vote weight based on user points and area factor
 * W(vote) = P(user) × A(factor) + B(base)
 */
export function calculateVoteWeight(
  userPoints: number,
  isWithinArea: boolean,
  baseWeight: number = 1
): number {
  const proximityMultiplier = isWithinArea ? 1.5 : 0.5;
  const weight = userPoints * proximityMultiplier + baseWeight;
  return Math.max(weight, baseWeight); // Ensure minimum weight
}

/**
 * Verify blockchain hash chain integrity
 */
export async function verifyHashChain(
  rumorId: string,
  content: string,
  finalDecision: string,
  votingData: string,
  previousHash: string,
  currentHash: string
): Promise<boolean> {
  const dataToHash = `${rumorId}${content}${finalDecision}${votingData}${previousHash}`;
  const computedHash = await generateHash(dataToHash);
  return computedHash === currentHash;
}

/**
 * Format secret key for display (showing only first and last 4 characters)
 */
export function formatSecretKey(key: string): string {
  if (key.length <= 8) return key;
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

/**
 * Validate secret key format
 */
export function isValidSecretKey(key: string): boolean {
  return /^[a-f0-9]{64}$/i.test(key);
}
