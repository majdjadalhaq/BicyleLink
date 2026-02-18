# Pull Request: Better Listings with Search, Pagination, and Optimization

## Overview

This PR improves the listing system to make it better and faster. It includes search, pagination, "Mark as Sold" features, and performance optimizations.

## Key Features

### 1. Listing System Improvements

- **Search & Pagination**: Added a search box on the Home page and a "Load More" button. This makes it easier to find bikes and keeps the page very fast.
- **Mark as Sold**: Owners can now mark their bikes as "Sold." A clear "SOLD" badge and overlay are shown on the image.
- **Improved Redirects**: If a user logs in to contact a seller, they are automatically sent back to the same bike listing.

### 2. Performance & Security

- **Image Optimization**: Images are now optimized using Cloudinary transformations to save bandwidth.
- **Code Splitting**: Used `React.lazy` to make the initial page load faster.
- **Backend Security**: Consolidated validation in the Mongoose model and enforced image limits (max 5 per listing).

## Technical Details

- **Backend**: Updated `getListings` for backend search/pagination and added a status update route.
- **Frontend**: Used `React.memo` for performance and implemented debounced searching.
- **Verification**: All tests (server and client) are passing, and the code is 100% lint-clean.

## Verification

- Verified on Chrome with 100% success.
- Search and pagination tested with large groups of data.
- "Mark as Sold" toggle verified for owners.
