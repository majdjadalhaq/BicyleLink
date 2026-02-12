/**
 * Adapted from https://kimlehtinen.com/how-to-setup-jest-for-node-js-mongoose-typescript-projects/
 */

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoMemServer;

/**
 * Connecting to the Database
 */
export const connectToMockDB = async () => {
  if (mongoMemServer) {
    return;
  }

  mongoMemServer = await MongoMemoryServer.create();
  const uri = mongoMemServer.getUri();

  await mongoose.connect(uri);
};

export const closeMockDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  // if (mongoMemServer) {
  //   await mongoMemServer.stop();
  //   mongoMemServer = null;
  // }
};

/**
 * Clear the database, used to clean between tests
 */
export const clearMockDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
