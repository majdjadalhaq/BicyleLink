import mongoose from 'mongoose';
import Listing from './src/models/Listing.js';
import dotenv from 'dotenv';
dotenv.config();

const URI = process.env.MONGODB_URL;

async function checkIndexes() {
  await mongoose.connect(URI);
  console.log('Connected.');
  
  // Force index creation explicitly
  try {
    const res = await Listing.collection.createIndex(
      { title: "text", description: "text", brand: "text", model: "text" },
      { name: "ListingTextIndex", weights: { title: 10, brand: 5, model: 5, description: 1 } }
    );
    console.log('Created Index Result:', res);
  } catch(e) {
    console.log('Create Index Error:', e.message);
  }

  const indexes = await Listing.collection.indexes();
  console.log('\n--- ATLAS LISTING INDEXES ---');
  indexes.forEach(idx => console.log(idx.name));
  
  await mongoose.disconnect();
}
checkIndexes().catch(console.error);
