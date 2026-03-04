# BiCycleL Database Structure

MongoDB with Mongoose. All models live in `server/src/models/`.

## Collections

### users

| Field | Type | Notes |
|-------|------|-------|
| name | String | Required, unique |
| email | String | Required, unique |
| password | String | Required (local auth) |
| role | String | "user" \| "admin" |
| isVerified | Boolean | Email verification |
| avatarUrl | String | Profile image |
| city, country, bio | String | Profile |
| notificationSettings | Object | messages, reviews, favorites, marketing |
| authProvider | String | "local" \| "google" |
| googleId | String | For OAuth |
| ratingSum, reviewCount | Number | Aggregated from reviews |
| verificationCode, verificationCodeExpiry | - | Email verification |
| passwordResetCode, passwordResetCodeExpiry | - | Password reset |
| failedAttempts, lockoutUntil | - | Security / lockout |

### listings

| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| description | String | Required |
| images | [String] | Max 5 |
| price | Decimal128 | Required |
| status | String | "active" \| "sold" \| "cancelled" |
| ownerId | ObjectId | Ref users |
| buyerId | ObjectId | Ref users |
| location | String | Required |
| coordinates | GeoJSON Point | Optional |
| brand, model, year, category | - | Specs |
| inquiries | Number | Count of first-time buyer messages |

### favorites

| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref users |
| listingId | ObjectId | Ref listings |

### messages

| Field | Type | Notes |
|-------|------|-------|
| room | String | Chat room ID |
| senderId | ObjectId | Ref users |
| receiverId | ObjectId | Ref users |
| listingId | ObjectId | Ref listings |
| content | String | Message body |
| mediaType | String | Optional (image, location) |
| mediaUrl | String | Optional |

### conversationstatuses

| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | Ref users |
| room | String | Chat room |
| lastReadAt | Date | Read marker |
| isArchived | Boolean | Archive flag |
| isDeleted | Boolean | Soft delete |

### notifications

| Field | Type | Notes |
|-------|------|-------|
| recipientId | ObjectId | Ref users |
| senderId | ObjectId | Ref users |
| listingId | ObjectId | Ref listings |
| type | String | message, favorite, review, etc. |
| title, body | String | Content |
| link | String | Deep link |
| read | Boolean | Read flag |

### reviews

| Field | Type | Notes |
|-------|------|-------|
| reviewerId | ObjectId | Ref users |
| revieweeId | ObjectId | Ref users |
| listingId | ObjectId | Ref listings |
| rating | Number | 1-5 |
| comment | String | Optional |

### reports

| Field | Type | Notes |
|-------|------|-------|
| reporterId | ObjectId | Ref users |
| listingId | ObjectId | Ref listings |
| reason | String | Report reason |
| status | String | Admin status |

## Indexes

Key indexes: `users` (email, name, googleId), `listings` (ownerId, status, coordinates), `messages` (room), `notifications` (recipientId, read), `reviews` (revieweeId).

## Related

- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API.md)
