/**
 * Storage utility for managing API keys and authentication tokens
 * Uses localStorage for client-side storage in Next.js
 */

const STORAGE_KEY = 'api_key';

// Check if we're in the browser environment
const isClient = typeof window !== 'undefined';

export const authStorage = {
  /**
   * Get the stored API key
   * @returns The API key string or empty string if not found
   */
  Get(): string {
    if (!isClient) return '';
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return '';
    }
  },

  /**
   * Set the API key in storage
   * @param key The API key to store
   */
  Set(key: string): void {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  /**
   * Remove the API key from storage
   */
  Remove(): void {
    if (!isClient) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  /**
   * Check if an API key exists in storage
   * @returns True if API key exists, false otherwise
   */
  Has(): boolean {
    if (!isClient) return false;
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  },
};

