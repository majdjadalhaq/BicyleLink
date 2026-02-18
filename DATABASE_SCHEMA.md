# Database Schema Documentation

This document describes the MongoDB collections and schemas used in the BiCycleL application.

## 1. Users Collection (`users`)

Stores user account information, profile details, and security/verification state.

| Field                     | Type    | Required         | Description                                |
| ------------------------- | ------- | ---------------- | ------------------------------------------ |
| `name`                    | String  | Yes              | Full name of the user.                     |
| `email`                   | String  | Yes              | Unique email address for login.            |
| `password`                | String  | Yes              | Hashed password.                           |
| `city`                    | String  | Yes              | User's city for location-based searches.   |
| `country`                 | String  | Yes              | User's country.                            |
| `bio`                     | String  | No               | Short biography or profile description.    |
| `isVerified`              | Boolean | Yes (def: false) | Account verification status.               |
| `agreedToTerms`           | Boolean | Yes              | Must be `true` to create an account.       |
| `avatarUrl`               | String  | No               | Profile picture URL.                       |
| `verificationCode`        | String  | No               | Code sent for email verification.          |
| `verificationCodeExpiry`  | Date    | No               | Expiration time for the verification code. |
| `passwordResetCode`       | String  | No               | Code for password recovery.                |
| `passwordResetCodeExpiry` | Date    | No               | Expiration for the reset code.             |

---

## 2. Listings Collection (`listings`)

Stores information about bicycles listed for sale on the platform.

| Field         | Type          | Required          | Description                                |
| ------------- | ------------- | ----------------- | ------------------------------------------ |
| `title`       | String        | Yes               | Headline of the listing.                   |
| `description` | String        | Yes               | Detailed description of the bicycle.       |
| `images`      | Array[String] | No                | URLs to uploaded images.                   |
| `price`       | Decimal128    | Yes               | Price in Euros.                            |
| `status`      | String        | Yes (def: active) | `active`, `sold`, or `cancelled`.          |
| `ownerId`     | ObjectId      | Yes               | Reference to the `users` collection.       |
| `location`    | String        | Yes               | City/Location where the item is located.   |
| `brand`       | String        | No                | Bicycle brand (e.g., Gazelle, Giant).      |
| `model`       | String        | No                | Specific model of the bike.                |
| `year`        | Number        | No                | Manufacturing year.                        |
| `condition`   | String        | No                | `new`, `like-new`, `good`, `fair`, `poor`. |
| `mileage`     | Number        | No                | Distance traveled by the bike.             |
| `createdAt`   | Date          | Yes (def: now)    | Timestamp of listing creation.             |

---

## 3. Messages Collection (`messages`)

Handles real-time and persistent communication between buyers and sellers.

| Field        | Type     | Required   | Description                                       |
| ------------ | -------- | ---------- | ------------------------------------------------- |
| `senderId`   | ObjectId | Yes        | User who sent the message (Ref: `User`).          |
| `receiverId` | ObjectId | Yes        | User who receives the message (Ref: `User`).      |
| `listingId`  | ObjectId | Yes        | Contextual listing for the chat (Ref: `Listing`). |
| `content`    | String   | Yes        | The actual message text.                          |
| `room`       | String   | Yes        | Unique ID for the conversation room.              |
| `createdAt`  | Date     | Yes (Auto) | Timestamp of the message.                         |
| `updatedAt`  | Date     | Yes (Auto) | Timestamp of last update.                         |

### Relationships

- **User -> Listing**: One user can own multiple listings.
- **User -> Message**: Users can be senders or receivers.
- **Listing -> Message**: Conversations are grouped by both users AND a specific listing context.

---

## 4. Test and Seed Data

To quickly set up the testing environment, use the `/api/test/seed` endpoint. This will empty the database and create the following default records:

### Default Users

- **Seller Sam** (`seller@test.com`): Primary seller for testing listing ownership.
- **Buyer Ben** (`buyer@test.com`): Primary buyer for testing purchase/inquiry flows.
- **Teammate Tom** (`teammate@test.com`): Dedicated account for teammate testing.
- **Shared Password**: `Password123!` (for all seed users).

### Default Listings

- **Vintage Gazelle Bike**: Owned by Seller Sam, priced at **€250**.

---

## Final Repository State

- All models are located in `server/src/models/`.
- Validation logic is integrated into the model files.
- Relationships are managed via Mongoose `ObjectId` references.
