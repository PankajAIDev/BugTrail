# Security Specification — BugTrail AI Firestore

## Data Invariants
1. A user document `/users/{userId}` can only be read or modified by the authenticated user whose `request.auth.uid == userId`.
2. A progress document `/users/{userId}/progress/{challengeId}` can only be read, created, or updated by the authenticated owner (`request.auth.uid == userId`).
3. Identity integrity must be strictly enforced (`request.auth.uid` matches the document path and owner fields).

## The "Dirty Dozen" Threat Vectors
1. Identity Spoofing: Attempting to create/modify `/users/{victimId}` while authenticated as `attackerId`.
2. Unauthenticated Writes: Attempting to write to `/users` or subcollections without valid auth credentials.
3. Path Poisoning: Attempting to inject oversized or malicious string IDs into document paths.
4. Shadow Field Injection: Adding extra unauthorized administrative fields (`isAdmin: true`).
5. Overwriting Immutable Fields: Modifying `createdAt` or `userId` after creation.
6. Cross-User Progress Mutating: Attempting to update another user's challenge completion progress.
7. Out-of-Bounds Numbers: Setting negative XP or absurdly large streak days.
8. Timestamp Manipulation: Passing forged client timestamps instead of server timestamps.
9. Blind List Scraping: Attempting to list all users in the `/users` collection without filtering by specific authenticated owner.
10. Unverified Email Writes: Attempting privileged writes without email verification if required.
11. Arbitrary Type Injection: Storing boolean or object instead of integer/string in progress fields.
12. Terminal State Bypassing: Reverting a completed challenge back to unattempted status maliciously.

## Security Rules Enforcement Strategy
- Global default deny on all document paths.
- Master Gate pattern verifying `request.auth.uid == userId`.
- Standalone schema validation helper functions `isValidUserProfile(data)` and `isValidUserProgress(data)`.
- Explicit `affectedKeys().hasOnly()` checks on all update operations.
