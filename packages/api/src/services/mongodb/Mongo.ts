import mongoDB, { Db, ObjectId, WithId } from 'mongodb'
import dotenv from 'dotenv';
import SpotifyMongo from './Spotify/index.js';
import FaradayMongo from './Faraday/index.js';
import UserMongo from './User/index.js';
dotenv.config();


export default class MongoDb {
  db: mongoDB.Db | null = null
  spotify: SpotifyMongo | null= null
  faraday: FaradayMongo | null= null
  user: UserMongo | null= null
  // TODO redo this class to have an OOP spotify & faraday classes
  // spotify: SpotifyMongo | null = null
  constructor(){
    console.log('!MongoDb  constructor-> ')
    this.init()
  }

  async init(){
    // connect
    const connection = await this.connectToDatabase()
    this.db = connection

    this.spotify = new SpotifyMongo(connection)
    this.faraday = new FaradayMongo(connection)
    this.user = new UserMongo(connection)
  }

  async connectToDatabase(): Promise<mongoDB.Db> {
    const connectionString  = process.env.DB_CONN_STRING
    const faradayDB = process.env.DB_NAME
    if (!connectionString || !faradayDB) throw new Error('No connection string or no DB Name for mongo db');
  
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionString);
    await client.connect();
    const db: mongoDB.Db = client.db(faradayDB);
       
    console.log(`Successfully connected to database: ${db.databaseName}`);
    return db
  }

}