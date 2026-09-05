/**
 * Simple, high-speed shared memory cache to pass data between auth screens
 * without breaking strict navigation engine contracts.
 */
let savedEmailCache = "user@email.com";
let savedVerificationTokenCache = "";

export const authContextCache = {
  setEmail(email: string) {
    savedEmailCache = email;
  },
  getEmail(): string {
    return savedEmailCache;
  },
  setVerificationToken(token: string) {
    savedVerificationTokenCache = token;
  },
  getVerificationToken(): string {
    return savedVerificationTokenCache;
  }
};
