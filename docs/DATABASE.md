# BiCycleL Database Structure

The BiCycleL platform utilizes MongoDB with Mongoose as the Object Data Mapper (ODM). All database models are defined in `server/src/models/`.

## Core Collections

### users

Stores user credentials, profile information, and account status.

| Field                    | Type    | Description                                                   |
| ------------------------ | ------- | ------------------------------------------------------------- |
| **name**                 | String  | Unique display name (required)                                |
| **email**                | String  | Unique primary identifier (required)                          |
| **password**             | String  | Hashed password for local authentication                      |
| **role**                 | String  | User permissions: `user` or `admin`                           |
| **isVerified**           | Boolean | Status of email verification                                  |
| **avatarUrl**            | String  | URL to Cloudinary hosted profile image                        |
| **city / country**       | String  | User location metadata                                        |
| **notificationSettings** | Object  | Booleans for: `messages`, `reviews`, `favorites`, `marketing` |
| **authProvider**         | String  | Identity source: `local` or `google`                          |
| **ratingSum**            | Number  | Total points from received reviews                            |
| **reviewCount**          | Number  | Total number of received reviews                              |
| **lockoutUntil**         | Date    | Security: temporary suspension after failed attempts          |

### listings

Stores bike marketplace items and their transaction status.

| Field                      | Type       | Description                                       |
| -------------------------- | ---------- | ------------------------------------------------- |
| **title / description**    | String     | Multi-language supported marketing text           |
| **images**                 | [String]   | Array of up to 5 Cloudinary image URLs            |
| **price**                  | Decimal128 | High-precision currency handling                  |
| **status**                 | String     | Lifecycle: `active`, `sold`, `cancelled`          |
| **ownerId**                | ObjectId   | Reference to the `users` collection               |
| **buyerId**                | ObjectId   | Reference to the `users` collection (set on sale) |
| **location / coordinates** | Point      | GeoJSON for map-based distance filtering          |
| **brand / category**       | String     | Specs for parameterized search                    |
| **inquiries**              | Number     | Unique inquiry counter for seller dashboards      |

### messages

Stores real-time chat data between users.

| Field          | Type     | Description                                  |
| -------------- | -------- | -------------------------------------------- |
| **room**       | String   | Unique identifier for a chat conversation    |
| **senderId**   | ObjectId | Reference to the message author              |
| **receiverId** | ObjectId | Reference to the message recipient           |
| **listingId**  | ObjectId | The specific bike listing being discussed    |
| **content**    | String   | The message payload                          |
| **mediaType**  | String   | Content type: `text`, `image`, or `location` |
| **read**       | Boolean  | Status for the recipient                     |

### notifications

Stores system and user-triggered notifications for the notification bell.

| Field            | Type     | Description                                       |
| ---------------- | -------- | ------------------------------------------------- |
| **recipientId**  | ObjectId | Reference to the user receiving the alert         |
| **senderId**     | ObjectId | Reference to the user triggering the alert        |
| **listingId**    | ObjectId | Optional reference to a related listing           |
| **type**         | String   | Event type: `message`, `favorite`, `review`, etc. |
| **title / body** | String   | Content displayed in the notification dropdown    |
| **link**         | String   | Internal route for deep linking                   |
| **read**         | Boolean  | Read/unread status (syncs via WebSockets)         |

### reviews

Stores transaction-based feedback.

| Field          | Type     | Description                                |
| -------------- | -------- | ------------------------------------------ |
| **reviewerId** | ObjectId | Reference to the user giving the rating    |
| **targetId**   | ObjectId | Reference to the user receiving the rating |
| **listingId**  | ObjectId | Reference to the completed transaction     |
| **rating**     | Number   | Integer value between 1 and 5              |
| **comment**    | String   | Textual feedback                           |

## Performance Indexing

To ensure high performance under load, we have implemented the following core indexes:

- **Users**: Unique indexes on `email` and `name`.
- **Listings**: compound index on `ownerId` and `status`; 2dsphere index on `coordinates`.
- **Messages**: Index on `room` and `createdAt` for historical retrieval.
- **Notifications**: Index on `recipientId` and `read` for real-time count updates.

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Tech Stack Details](./TECH_STACK.md)
