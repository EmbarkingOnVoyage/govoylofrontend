/**
 * Simple, high-speed shared memory cache to pass data between auth screens
 * without breaking strict navigation engine contracts.
 */
let savedEmailCache = "user@email.com";

export const authContextCache = {
  setEmail(email: string) {
    savedEmailCache = email;
  },
  getEmail(): string {
    return savedEmailCache;
  }
};
