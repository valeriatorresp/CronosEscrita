# Security Specification & "Dirty Dozen" Threat Model

This document outlines the security invariants, the 12 malicious payloads designed to breach access control (The "Dirty Dozen"), and the validation parameters defined to safeguard user backups in Firebase Firestore.

## 1. Core Data Invariants

1. **User Ownership Boundaries**: A user can only read, write, create, update, or delete their own backup documents. Access to `/users/{userId}/backups/current` requires `request.auth.uid == userId`.
2. **Immutable Identity**: The `userId` property within the backup document must strictly match the authenticated user's UID (`request.auth.uid`) on create and update.
3. **Data Volume Limits**: Values like `goal` and `dailyGoal` must be positive integers constrained within reasonable limits to prevent DoW (Denial of Wallet) attacks through massive storage sizes. String lengths of titles and deadlines are strictly capped.
4. **Verified Authenticity**: Writes are only permitted for users with fully verified emails if using Firebase Authentication (Google logins are automatically verified).

---

## 2. The "Dirty Dozen" Attack Payloads

The following 12 payloads represent malicious attempts to bypass security checks and must be denied by `firestore.rules`:

### Payload 1: Identity Spoofing (Write to another user's document path)
* **Goal**: Write to `/users/victim_user_123/backups/current` as `attacker_user_456`.
* **Result**: `PERMISSION_DENIED`.

### Payload 2: Hostile UID Injection (Set userId mismatch inside document payload)
* **Goal**: Write to `/users/attacker_user_456/backups/current` but set `userId` to `victim_user_123` in the body.
* **Result**: `PERMISSION_DENIED` (due to helper validating `incoming().userId == request.auth.uid`).

### Payload 3: Unsigned Request Attack (Write without Auth session)
* **Goal**: Write to `/users/anonymous_user/backups/current` without any auth headers.
* **Result**: `PERMISSION_DENIED`.

### Payload 4: Email Verification Spoofing (Unverified user bypass)
* **Goal**: Attempt to write as a Google user whose `email_verified` claim is `false`.
* **Result**: `PERMISSION_DENIED`.

### Payload 5: Integer Overflow / DoS Goal (Set extremely negative word goal)
* **Goal**: Set `goal = -500000000`.
* **Result**: `PERMISSION_DENIED` (due to `incoming().goal > 0` validation).

### Payload 6: Integer Overflow / DoS Daily Goal (Set zero word goal)
* **Goal**: Set `dailyGoal = 0`.
* **Result**: `PERMISSION_DENIED` (due to `incoming().dailyGoal >= 100` validation).

### Payload 7: Immense Payload Injection (Attempt to inject a 10MB string into simple fields)
* **Goal**: Set `userId` value to a 20,000-character junk string.
* **Result**: `PERMISSION_DENIED` (due to `isValidId()` string length restriction of 128 characters).

### Payload 8: Immutable field manipulation during update (Altering creation metadata)
* **Goal**: Attempt to update a backup and alter the existing `createdAt` property or similar static properties.
* **Result**: `PERMISSION_DENIED`.

### Payload 9: Invalid String Format (Junk character injection in IDs)
* **Goal**: Set a document path or `userId` containing malicious path traversal chars like `../` or `\0`.
* **Result**: `PERMISSION_DENIED` (due to regex guard `id.matches('^[a-zA-Z0-9_\\-]+$')`).

### Payload 10: Array size overflow attack (Exploiting lists)
* **Goal**: Attempt to inject massive arrays without strict limits.
* **Result**: `PERMISSION_DENIED`.

### Payload 11: Schema violation (Omitting required properties)
* **Goal**: Create/update a backup document while omitting mandatory fields like `challengeDays`.
* **Result**: `PERMISSION_DENIED` (due to `hasAll` validation helper).

### Payload 12: Administrative privilege escalation
* **Goal**: Write to administrative collections or overwrite other users' records by claiming false admin states in local storage.
* **Result**: `PERMISSION_DENIED` (all role privileges are checked server-side).

---

## 3. Security Rules Draft Code

The security rules are defined to completely block the "Dirty Dozen" payloads. The draft implementation is written to `DRAFT_firestore.rules`.
