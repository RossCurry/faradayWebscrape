import mongoDB from 'mongodb'
import dotenv from 'dotenv';
dotenv.config();

import { FaradayItemData } from '#controllers/faraday/getItemData.js'
import { AppState } from '../../router.js'
import { SpotifyUserProfile } from '#controllers/spotify/spotify.types.js'
import { SpotifySearchResult } from '#middlewares/spotify/getAlbumInfo.js';
import { AuthToken } from '#services/token/Token.js';

class MongoDb {
  db: mongoDB.Db | null = null
  constructor(){
    console.log('!MongoDb  constructor-> ')
    this.init()
  }
  async init(){
    // connect
    const connection = await this.connectToDatabase()
    this.db = connection
  }

  async connectToDatabase(): Promise<mongoDB.Db> {
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

  async setSpotifyData(data: AppState["data"]["searchResults"]){
    console.log('!setSpotifyData -> ', data?.length);
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')
      
    const faradayData = await this.getFaradayData()
    const insertedDocs = await Promise.all(await faradayData.map(async (album) => {
      const matched = data?.find(searchResult => searchResult.faraday.id === album.id)
      if (matched){
        await albumCollection.updateOne(
          { 'faraday.id': album.id },
          { $set: { 
            spotify: matched.spotify,
            updatedDate: new Date(Date.now()).toISOString()
          }}
        )
      }
    }))
    console.log('!insertedDocs -> ', insertedDocs.length);
    return insertedDocs
  }
  async setSpotifyTrackData(data: AppState["data"]["spotifyTrackInfo"]){
    console.log('!setSpotifyData -> ', data?.length);
    if (!data) throw new Error('No spotifyTrackInfo found')
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')
      
    const insertedDocs = await Promise.all(await data.map(async (spotifyTrackInfo) => {
      const trackIds = spotifyTrackInfo.tracks.items
        .sort((trackA, trackB) => ( Number(trackA.track_number) - Number(trackB.track_number)))
        .map(track => track.uri) // used for adding to playlist
      await albumCollection.updateOne(
        { 'spotify.id': spotifyTrackInfo.album.id },
        { $set: { 
          'spotify.trackIds': trackIds,
          'spotify.trackInfo':  spotifyTrackInfo.tracks,
          updatedDate: new Date(Date.now()).toISOString()
        }}
      )
    }))
    console.log('!insertedDocs -> ', insertedDocs.length);
    return insertedDocs
  }

  async getSpotifyData(match: Record<string, any> = {}){
    console.log('!getSpotifyData -> ');
    const albumCollection = this.db?.collection('albums')
    const albums = await albumCollection?.find(match, {}).toArray()
    console.log('!getSpotifyData albums -> ', [albums]);
    const spotifyData: Array<SpotifySearchResult & { _id: string }> | undefined = albums?.map(album => ( { _id: album._id.toString(),  ...album.spotify }))
    return spotifyData ? spotifyData : []
  }

  async setFaradayData(data: FaradayItemData[]){
    const prevStock = await this.getFaradayData()
    const prevStockIds = data.map( d => d.id)
    console.log('!setFaradayData -> ', data.length);
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')
    const filteredResults = data.filter( d => prevStockIds.includes(d.id) )
    // TODO maybe we don't always just want to add on, or I need date info
    const newFaradayData = filteredResults.map( d => ({ faraday: d, createdDate: new Date(Date.now()).toISOString() }))
    const insertedDocs = await albumCollection.insertMany(newFaradayData)
    return insertedDocs
  }
  
  async getFaradayData(){
    console.log('!getFaradayData -> ');
    const albumCollection = this.db?.collection('albums')
    const albums = await albumCollection?.find({}, {}).toArray()
    const faradayData: Array<FaradayItemData & { _id: string }> | undefined =  albums?.map(album => ( { _id: album._id.toString(),  ...album.faraday }))
    return faradayData ? faradayData : []
  }
  
  async getPlaylistData(){
    if (!this.db) throw new Error('No DB found')
      const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No albumCollection found')
      const albums = await albumCollection?.find({'spotify.trackIds': { '$exists': true } }, {}).toArray()
    if (!albums) return []
    const playlistData: { trackIds: string}[] =  albums
    .filter(album => !!album )
    .map(album => ( { trackIds: album.spotify.trackIds }))
    const flattenedIds = playlistData?.flatMap( album => album.trackIds )
    return flattenedIds
  }
  
  async setUserInfo(userInfo: SpotifyUserProfile, tokenInfo: Omit<AuthToken, 'token_type'>){
    console.log('!setUserInfo -> ', userInfo);
    const usersCollection = this.db?.collection('users')
    if (!usersCollection) throw new Error('No users collecion found')
    const [user] = await usersCollection.find({ id: userInfo.id, href: userInfo.href }).toArray()
    console.log('!user -> ', user);
    if (!user) {
      const insertedDocs = await usersCollection.insertOne({ 
        ...userInfo, 
        endpoint: tokenInfo,
        createdDate: new Date(Date.now()).toISOString()
      })
      console.log('!insertedDocs -> ', insertedDocs);
      return insertedDocs
    }

    const insertedDocs = await usersCollection.updateOne(
      { _id: user._id},
      { $set: {
        endpoint: tokenInfo,
        updatedDate: new Date(Date.now()).toISOString()
      }}
    )
    console.log('!insertedDocs -> ', insertedDocs);
    return insertedDocs
  }
}

export default MongoDb;