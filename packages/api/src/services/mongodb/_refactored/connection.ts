import mongoDB from 'mongodb'

import dotenv from 'dotenv';
dotenv.config();

export async function connectToDatabase(): Promise<mongoDB.Db> {
  const connectionString  = process.env.DB_CONN_STRING
  const faradayDB = process.env.DB_NAME
  if (!connectionString || !faradayDB) throw new Error('No connection string or no DB Name for mongo db');

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionString);
  await client.connect();
  const db: mongoDB.Db = client.db(faradayDB);
  const albumsCollection: mongoDB.Collection = db.collection('albums');
     
  console.log(`Successfully connected to database: ${db.databaseName} and collection: ${albumsCollection.collectionName}`);
  return db
}