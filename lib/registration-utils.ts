// // lib/registration-utils.ts

// import crypto from "crypto";

// /**
//  * Generates a random string for PKCE code verifier
//  * @returns A random string of the specified length
//  */
// export function generateRandomString(length: number = 64): string {
//   return crypto
//     .randomBytes(length)
//     .toString("base64")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=/g, "")
//     .slice(0, length);
// }

// /**
//  * Creates a code challenge from a code verifier using SHA-256
//  * @param codeVerifier The code verifier string
//  * @returns The code challenge string
//  */
// export function generateCodeChallenge(codeVerifier: string): string {
//   return crypto
//     .createHash("sha256")
//     .update(codeVerifier)
//     .digest("base64")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=/g, "");
// }

// /**
//  * Sanitizes input to prevent SQL injection
//  * @param input The input string to sanitize
//  * @returns Sanitized string
//  */
// export function sanitizeInput(input: string): string {
//   return input.trim().replace(/['"\\\n\r]/g, "");
// }

// /**
//  * Generates a unique community nickname
//  * @param firstName User's first name
//  * @param lastName User's last name
//  * @returns A unique nickname suitable for Salesforce Communities
//  */
// export function generateUniqueCommunityNickname(
//   firstName: string,
//   lastName: string
// ): string {
//   const timestamp = Date.now().toString(36);
//   const randomStr = Math.random().toString(36).substring(2, 6);
//   const firstNameSlug = firstName
//     .toLowerCase()
//     .replace(/[^a-z0-9]/g, "")
//     .substring(0, 3);
//   const lastNameSlug = lastName
//     .toLowerCase()
//     .replace(/[^a-z0-9]/g, "")
//     .substring(0, 4);

//   return `${firstNameSlug}_${lastNameSlug}_${timestamp}_${randomStr}`;
// }

// /**
//  * Validates an email format
//  * @param email Email to validate
//  * @returns Boolean indicating if email is valid
//  */
// export function isValidEmail(email: string): boolean {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// }

// /**
//  * Stores session data securely
//  * Note: In a production environment, use a more secure method like
//  * encrypted cookies, server-side sessions, or a secure database
//  */
// export function storeSessionData(key: string, data: any): void {
//   if (typeof window !== "undefined") {
//     // Client-side storage (simplified)
//     sessionStorage.setItem(key, JSON.stringify(data));
//   } else {
//     // Server-side storage (simplified)
//     // In a real implementation, use a proper session management solution
//     if (!global.sessionData) {
//       global.sessionData = {};
//     }
//     global.sessionData[key] = data;
//   }
// }

// /**
//  * Retrieves session data
//  */
// export function getSessionData(key: string): any {
//   if (typeof window !== "undefined") {
//     // Client-side retrieval
//     const data = sessionStorage.getItem(key);
//     return data ? JSON.parse(data) : null;
//   } else {
//     // Server-side retrieval
//     return global.sessionData?.[key] || null;
//   }
// }

// /**
//  * Clears session data
//  */
// export function clearSessionData(key: string): void {
//   if (typeof window !== "undefined") {
//     sessionStorage.removeItem(key);
//   } else if (global.sessionData) {
//     delete global.sessionData[key];
//   }
// }
