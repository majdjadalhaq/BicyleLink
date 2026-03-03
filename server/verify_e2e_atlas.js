import mongoose from 'mongoose';
import Listing from './src/models/Listing.js';
import User from './src/models/User.js';
import Report from './src/models/Report.js';
import Message from './src/models/Message.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const URI = process.env.MONGODB_URL;

async function verifySuite() {
  console.log('--- STARTING ATLAS E2E VERIFICATION ---');
  console.log('Checking connection URI:', URI ? URI.substring(0, 30) + '...' : 'MISSING');

  try {
    await mongoose.connect(URI);
    console.log('✅ ATLAS CONNECTION SUCCESSFUL');
  } catch (err) {
    console.error('❌ ATLAS CONNECTION FAILED:', err.message);
    process.exit(1);
  }

  // 1. Validate Seeding / Dataset Size
  let count = await Listing.countDocuments();
  console.log(`Current Listing Count: ${count}`);

  if (count < 9000) {
    console.log('Seeding up to 10k listings...');
    const owner = await User.findOne() || await User.create({ name: 'SeedUser', email: 'seed@b.nl', password: 'Password123!', phoneNumber: '1' });
    const batchSize = 1000;
    const toInsert = 10000 - count;
    
    for (let i = 0; i < toInsert; i += batchSize) {
      const listings = [];
      const currentBatch = Math.min(batchSize, toInsert - i);
      for (let j = 0; j < currentBatch; j++) {
        listings.push({
          ownerId: owner._id,
          title: `Performance Test Bicycle ${i+j}`,
          description: `Seeded bike ${i+j} for stress testing text indices and pagination boundaries.`,
          price: (Math.random() * 1000) + 100,
          condition: 'good',
          category: 'Mountain',
          status: 'active',
          location: 'Amsterdam',
          coordinates: { type: 'Point', coordinates: [4, 52] }
        });
      }
      await Listing.insertMany(listings);
      console.log(`... inserted batch of ${currentBatch}`);
    }
    count = await Listing.countDocuments();
    console.log(`✅ SEEDING COMPLETE. Total Listings: ${count}`);
  }

  // 2. Test Text Search & explain()
  console.log('\n--- TESTING $text INDEX SCRIPT OPTIMIZATION ---');
  console.log('Synchronizing Indexes directly to Atlas...');
  await Listing.syncIndexes();
  await Message.syncIndexes();
  await Report.syncIndexes();

  const searchQuery = { $text: { $search: 'Bicycle' } };
  
  const searchExplain = await Listing.find(searchQuery)
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5)
    .explain('executionStats');
    
  console.log('Explain Query Used Index:', searchExplain.queryPlanner?.winningPlan?.stage || searchExplain[0]?.queryPlanner?.winningPlan?.stage || 'UNKNOWN');
  const execStats = searchExplain.executionStats || searchExplain[0]?.executionStats;
  console.log('Execution Time (ms):', execStats?.executionTimeMillis);
  console.log('Total Docs Examined:', execStats?.totalDocsExamined);

  // 3. Test Admin Reports N+1 Fetch (Simulate logic)
  console.log('\n--- TESTING REPORTS N+1 OPTIMIZATION ---');
  const reportTimeStart = Date.now();
  const reports = await Report.find().limit(100);
  const userIds = [];
  const listingIds = [];
  reports.forEach(r => {
    if (r.targetType === 'User') userIds.push(r.targetId);
    if (r.targetType === 'Listing') listingIds.push(r.targetId);
  });
  const [users, listings] = await Promise.all([
    User.find({ _id: { $in: userIds } }).lean(),
    Listing.find({ _id: { $in: listingIds } }).lean()
  ]);
  const reportTimeEnd = Date.now();
  console.log('Reports Batch Fetch Time (ms):', reportTimeEnd - reportTimeStart);
  console.log(`Fetched ${users.length} Users and ${listings.length} Listings safely via $in.`);

  console.log('\n--- VERIFICATION COMPLETE ---');
  await mongoose.disconnect();
}

verifySuite().catch(console.error);
