import mongoDB from 'mongodb'

export default class BaseConnection {
  db: mongoDB.Db

  constructor(db: mongoDB.Db){
    this.db = db
  }
}