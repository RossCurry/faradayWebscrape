import mongoDB from 'mongodb'

import { connectToDatabase } from "./connection.js"

class MongoDb {
  db: mongoDB.Db | null = null
  constructor(){
    this.init()
  }
  async init(){
    // connect
    const connection = await connectToDatabase()
    this.db = connection
  }
}

export default MongoDb;