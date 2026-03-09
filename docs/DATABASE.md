# BiCycleL Database Schema

MongoDB with Mongoose 9 as the ODM. All models are in `server/src/models/`.

---

## users

| Field | Type | Notes |
|---|---|---|
| `name` | String | Unique display name, required |
| `email` | String | Unique, required |
| `password` | String | bcrypt hash — absent for Google OAuth accounts |
| `role` | String | `"user"` (default) or `"admin"` |
| `isVerified` | Boolean | Set to true after email verification |
| `isBlocked` | Boolean | Set by admin to suspend an account |
| `agreedToTerms` | Boolean | Required on registration |
| `authProvider` | String | `"local"` or `"google"` |
| `avatarUrl` | String | Cloudinary URL |
| `city` / `country` | String | Profile location |
| `bio` | String | Optional profile description |
| `ratingSum` | Number | Running total of all received review ratings |
| `reviewCount` | Number | Total number of reviews received |
| `notificationSettings` | Object | Booleans for `messages`, `reviews`, `favorites`, `marketing` |
| `lockoutUntil` | Date | Temporary lockout after repeated failed logins |
| `failedLoginAttempts` | Number | Counter for lockout logic |

**Indexes**: unique on `email`, unique on `name`.

---

## listings

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | Required |
| `images` | [String] | Up to 5 Cloudinary URLs |
| `price` | Decimal128 | High-precision currency value |
| `status` | String | `"active"` (default), `"sold"`, `"cancelled"` |
| `ownerId` | ObjectId | Ref: `users` |
| `buyerId` | ObjectId | Ref: `users` — set when marked as sold, locked after assignment |
| `brand` | String | Bike brand for filtering |
| `category` | String | Bike type (road, mountain, city, etc.) |
| `condition` | String | e.g. new, like new, good, fair |
| `location` | String | City/area label |
| `coordinates` | GeoJSON Point | `{ type: "Point", coordinates: [lng, lat] }` for map display |
| `views` | Number | Incremented on each listing page visit |
| `inquiries` | Number | Count of unique users who messaged about this listing |
| `isFeatured` | Boolean | Set by admin — featured listings appear at top |

**Indexes**: compound on `ownerId + status`; `2dsphere` on `coordinates` for geo queries.

---

## messages

| Field | Type | Notes |
|---|---|---|
| `room` | String | Format: `{listingId}_{userId1}_{userId2}` — required |
| `senderId` | ObjectId | Ref: `users` |
| `receiverId` | ObjectId | Ref: `users` |
| `listingId` | ObjectId | Ref: `listings` — used by the candidates query for Mark as Sold |
| `content` | String | Required |
| `mediaType` | String | `"text"`, `"image"`, or `"location"` |
| `mediaUrl` | String | Cloudinary URL for image messages |
| `location` | Object | `{ lat, lng, address }` for location messages |
| `read` | Boolean | Whether the recipient has read this message |
| `isEdited` | Boolean | Whether the message body has been changed after sending |

**Indexes**: `{ listingId, senderId }` for candidates query; `{ room, createdAt: -1 }` for paginated history.

---

## notifications

| Field | Type | Notes |
|---|---|---|
| `recipientId` | ObjectId | Ref: `users` |
| `senderId` | ObjectId | Ref: `users` |
| `listingId` | ObjectId | Optional ref: `listings` |
| `type` | String | `message`, `review`, `review_permission`, `favorite`, `listing_sold` |
| `title` | String | Short heading shown in notification dropdown |
| `body` | String | Full notification text |
| `link` | String | Internal route for deep linking (e.g. `/listings/:id`) |
| `read` | Boolean | Toggled via REST API and synced in real time over Socket.IO |

**Index**: `{ recipientId, read }` for fast unread count queries.

---

## reviews

| Field | Type | Notes |
|---|---|---|
| `reviewerId` | ObjectId | Ref: `users` — the buyer |
| `targetId` | ObjectId | Ref: `users` — the seller |
| `listingId` | ObjectId | Ref: `listings` — the completed transaction |
| `rating` | Number | Integer 1–5 |
| `comment` | String | Optional, max 500 characters |
| `createdAt` | Date | Auto-set |

**Index**: unique compound on `{ reviewerId, listingId }` — enforces one review per transaction at the database level.

---

## reports

| Field | Type | Notes |
|---|---|---|
| `reporterId` | ObjectId | Ref: `users` |
| `targetId` | ObjectId | The reported listing or user |
| `targetType` | String | `"Listing"` or `"User"` |
| `reason` | String | Required |
| `status` | String | `"pending"`, `"reviewed"`, `"dismissed"` |
| `createdAt` | Date | Auto-set |

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Tech Stack Details](./TECH_STACK.md)
