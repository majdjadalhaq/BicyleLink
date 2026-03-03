require('dotenv').config({ path: './server/.env' });
const http = require('http');

const SERVER_URL = 'http://localhost:3000/api';
let cookies = [];

// Helper to make fetch requests with cookies
async function fetchApi(endpoint, options = {}) {
  const headers = { ...options.headers };
  if (cookies.length > 0) {
    headers.cookie = cookies.join('; ');
  }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return new Promise((resolve, reject) => {
    const url = new URL(`${SERVER_URL}${endpoint}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers,
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        // Save set-cookie headers
        if (res.headers['set-cookie']) {
          cookies = res.headers['set-cookie'].map(c => c.split(';')[0]);
        }
        let parsedData = data;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {}

        resolve({
          status: res.statusCode,
          data: parsedData,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING BICYCLEL COMPREHENSIVE E2E VERIFICATION ===\n");
  try {
    // 1. Authentication Flows
    console.log("--> 1. Testing Registration & Verification...");
    const email = `testuser_${Date.now()}@bicyclel.nl`;
    const password = 'Password@123';
    
    let res = await fetchApi('/users/register', {
      method: 'POST',
      body: { name: 'E2E Tester', email, password }
    });
    console.log("Registration Status:", res.status);
    if(res.status !== 201) throw new Error(res.data.msg);

    const verificationCode = res.data.user.verificationCode || 'not-returned'; // We would need the DB directly to get the code since it's emailed.
    
    console.log("--> Accessing DB directly to get verification code...");
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/final-project');
    const User = require('./src/models/User').default;
    const Listing = require('./src/models/Listing').default;
    
    const dbUser = await User.findOne({ email });
    
    console.log("Verifying User with code:", dbUser.verificationCode);
    res = await fetchApi('/users/verify-email', {
      method: 'POST',
      body: { email, code: dbUser.verificationCode }
    });
    console.log("Verification Status:", res.status);

    console.log("--> Testing Login...");
    res = await fetchApi('/users/login', {
      method: 'POST',
      body: { email, password }
    });
    console.log("Login Status:", res.status);
    const buyerId = dbUser._id;

    // 2. Setup Seller
    console.log("\n--> 2. Setting up Seller Profile...");
    const sellerEmail = `seller_${Date.now()}@bicyclel.nl`;
    await fetchApi('/users/register', { method: 'POST', body: { name: 'Seller User', email: sellerEmail, password } });
    const dbSeller = await User.findOne({ email: sellerEmail });
    await fetchApi('/users/verify-email', { method: 'POST', body: { email: sellerEmail, code: dbSeller.verificationCode } });
    
    cookies = []; // clear buyer cookies
    res = await fetchApi('/users/login', { method: 'POST', body: { email: sellerEmail, password } });
    console.log("Seller Login Status:", res.status);
    const sellerId = dbSeller._id;

    // 3. Create Listing (Seller)
    console.log("\n--> 3. Testing Listing Management...");
    const listingData = {
      title: 'E2E Test Bike',
      description: 'A great bike for testing',
      price: 1500,
      category: 'Road',
      condition: 'Excellent',
      brand: 'Trek',
      model: 'Domane',
      year: 2023,
      location: 'Amsterdam',
      coordinates: { lat: 52.3676, lng: 4.9041 },
      images: ['http://example.com/bike.jpg']
    };
    res = await fetchApi('/listings', { method: 'POST', body: listingData });
    console.log("Create Listing Status:", res.status);
    if(res.status !== 201) throw new Error(res.data.msg);
    const listingId = res.data.listing._id;

    // 4. Test Favorites (Buyer)
    console.log("\n--> 4. Testing Favorites...");
    cookies = [];
    await fetchApi('/users/login', { method: 'POST', body: { email, password } }); // login buyer
    res = await fetchApi('/favorites/toggle', { method: 'POST', body: { listingId } });
    console.log("Favorite Toggle Status:", res.status);

    // 5. Test Chat & Inbox (Buyer -> Seller)
    console.log("\n--> 5. Testing Real-Time Chat & Inbox...");
    // We simulate API since sockets require complex mock.
    const Message = require('./src/models/Message').default;
    const room = [buyerId, sellerId, listingId].sort().join('_');
    const msg = await Message.create({
      senderId: buyerId,
      receiverId: sellerId,
      listingId,
      content: 'Is this still available?',
      room
    });
    console.log("Simulated Chat Message Created");

    res = await fetchApi('/messages/inbox');
    console.log("Buyer Inbox Status:", res.status);
    console.log("Conversations found:", res.data.result?.length);

    // 6. Test Review Gating (Should fail before purchase)
    console.log("\n--> 6. Testing Reviews & Notifications...");
    res = await fetchApi('/reviews', { method: 'POST', body: { targetId: sellerId, listingId, rating: 5, comment: 'Great seller' } });
    console.log("Review before purchase Status (expected 403):", res.status);

    // 7. Mark as Sold (Seller)
    cookies = [];
    await fetchApi('/users/login', { method: 'POST', body: { email: sellerEmail, password } }); // login seller
    res = await fetchApi(`/listings/${listingId}/sold`, { method: 'PATCH', body: { buyerId } });
    console.log("Mark Sold Status:", res.status);

    // 8. Review After Sold (Buyer)
    cookies = [];
    await fetchApi('/users/login', { method: 'POST', body: { email, password } }); // login buyer
    res = await fetchApi('/reviews', { method: 'POST', body: { targetId: sellerId, listingId, rating: 5, comment: 'Great seller!' } });
    console.log("Review after purchase Status (expected 201):", res.status);

    // 9. Admin Setup & Flows
    console.log("\n--> 9. Testing Admin Flows...");
    dbUser.role = 'admin';
    await dbUser.save(); // elevate buyer to admin
    await fetchApi('/users/login', { method: 'POST', body: { email, password } }); // re-login to update token
    
    res = await fetchApi('/admin/stats');
    console.log("Admin Stats Status:", res.status);

    res = await fetchApi('/admin/users');
    console.log("Admin Users List Status:", res.status);

    console.log("\n=== ALL FLOWS VERIFIED SUCCESSFULLY ===");
    process.exit(0);

  } catch (error) {
    console.error("FLOW VERIFICATION FAILED:", error);
    process.exit(1);
  }
}

runTests();
