import { MongoClient } from 'mongodb';

// On Vercel every request can run in a fresh "serverless function".
// We keep one shared connection on `global` so we don't open a new one each time.
export default function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect().catch((err) => {
      global._mongoClientPromise = null; // allow a retry on the next request
      throw err;
    });
  }
  return global._mongoClientPromise.then((client) => client.db('pothole'));
}
