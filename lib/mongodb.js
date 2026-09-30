// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Harap tentukan MONGODB_URI di environment variables.');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Tambahkan helper function ini jika belum ada
export async function getStateCollection() {
  const client = await clientPromise;
  const db = client.db(); // Menggunakan database default dari URI
  return db.collection('app_state'); // Sesuaikan nama koleksi jika perlu
}

export default clientPromise;