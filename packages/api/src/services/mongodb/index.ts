import mongoDB, { Db, ObjectId } from 'mongodb'
import dotenv from 'dotenv';
dotenv.config();

import { FaradayItemData } from '#controllers/faraday/getItemData.js'
import { AppState } from '../../router.js'
import { SpotifyAlbum, SpotifyCoverImageResponse, SpotifyPlaylist, SpotifySearchResult, SpotifyUserProfile } from '#controllers/spotify/spotify.types.js'
import { AuthToken } from '#services/token/Token.js';

class MongoDb {
  db: mongoDB.Db | null = null
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

  /**
   * Sets Spotify data from faraday webscrape data 
   * @param data 
   * @returns 
   */
  async setSpotifyData(data: AppState["data"]["searchResults"]){
    console.log('!setSpotifyData -> ', data?.length);
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')
      
    const faradayData = await this.getFaradayData()
    let matchedCount = 0
    let notMatchedCount = 0
    const insertedDocs = await Promise.all(await faradayData.map(async (album) => {
      const matched = data?.find(searchResult => searchResult.faraday.id === album.id)
      if (matched){
        await albumCollection.updateOne(
          { 'faraday.id': album.id },
          { $set: { 
            spotify: matched.spotify,
            updatedDate: new Date().toISOString()
          }}
        )
        matchedCount++
      } else notMatchedCount++
    }))
    console.log('!insertedDocs -> ', {notMatchedCount, matchedCount});
    return {
      notMatchedCount, 
      matchedCount
    }
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
          updatedDate: new Date().toISOString()
        }}
      )
    }))
    console.log('!insertedDocs -> ', insertedDocs.length);
    return insertedDocs
  }

  // Updates a single album with new properties we might want
  async updateSpotifyAlbumFields(albumProperties: Partial<SpotifyAlbum> & { id: SpotifyAlbum["id"]}){
    console.log('!updateSpotifyAlbumFields -> ', albumProperties);
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')
    const { id, ...fieldsToUpdate } = albumProperties;
    const match = { 'spotify.id': id }
    const update = Object.entries(fieldsToUpdate).reduce(
      (update: Record<string, unknown>, [key, value]) => {
      update[`spotify.${key}`] = value
      return update
    }, {})
    const insertedDoc = await albumCollection.updateOne(
        match,
        { $set: { 
          ...update,
          updatedDate: new Date().toISOString()
        }}
      )
    console.log('!insertedDoc -> ', insertedDoc);
    return insertedDoc
  }

  async getSpotifyData(match?: Record<string, any>){
    console.log('!getSpotifyData -> ');
    const albumCollection = this.db?.collection('albums')
    const albums = await albumCollection?.find(match || {}, {}).toArray()
    const spotifyData: Array<SpotifySearchResult & { _id: string }> | undefined = albums?.map(album => ( { _id: album._id.toString(),  ...album.spotify }))
    return spotifyData ? spotifyData : []
  }
  
  /**
   * This is the main GET for the landing page.
   * At the moment, just return everything
   * Will have to figure out a limit
   * @param match 
   * @returns 
   */
  async getSpotifyAlbumData(match?: Record<keyof SpotifySearchResult, any>){
    console.log('!getSpotifyAlbumData -> ');
    const albumProjection = {
      'spotify.artists': 1,
      'spotify.href': 1,
      'spotify.id': 1,
      'spotify.image': 1,
      'spotify.name': 1,
      'faraday.category': 1,
      'faraday.isSoldOut': 1,
      'faraday.price': 1,
      'spotify.albumType': 1,
      'spotify.totalTracks': 1,
      'spotify.releaseDate': 1,
      'spotify.popularity': 1,
      'spotify.genres': 1,
      'spotify.trackInfo.items.artists': 1,
      // 'spotify.trackInfo.items.available_markets': 1,
      // 'spotify.trackInfo.items.disc_number': 1,
      'spotify.trackInfo.items.duration_ms': 1,
      // 'spotify.trackInfo.items.explicit': 1,
      // 'spotify.trackInfo.items.external_urls': 1,
      // 'spotify.trackInfo.items.href': 1,
      'spotify.trackInfo.items.id': 1,
      'spotify.trackInfo.items.name': 1,
      'spotify.trackInfo.items.preview_url': 1,
      'spotify.trackInfo.items.track_number': 1,
      'spotify.trackInfo.items.type': 1,
      'spotify.trackInfo.items.uri': 1,
      // 'spotify.trackInfo.items.is_local': 1,
    }
    const albumCollection = this.db?.collection('albums')
    const notFoundMatch = {
      ...match,
      $or: [{notFound: false}, {notFound: {$exists: false}}],
      // TODO remove
      'faraday.isSoldOut': false
    }
    const albums = await albumCollection?.find(notFoundMatch || {}, { projection: albumProjection, limit: undefined }).toArray()
    console.log('!albums.length -> ', albums?.length);
    // TODO improve this return type
    const spotifyData: Array<Partial<any> & { _id: string }> | undefined = (albums || []).map(album => ( { _id: album._id.toString(),  ...album.spotify, ...album.faraday }))
    /**
     * ReMap the trackInfo data.
     */
    const reMapped = spotifyData.map( datum => {
      const { trackInfo, ...rest } = datum
      return {
        ...rest,
        trackList: trackInfo?.items || [],
        totalTracks: trackInfo?.items.length
      }
    })
    return reMapped
  }

  // TODO divide this into more methods
  async setFaradayData(data: FaradayItemData[]){
    console.log('!setFaradayData -> ', data.length);
    const prevStock = await this.getFaradayData()
    console.log('!prevStock -> ', prevStock.length);
    const prevStockIds = prevStock.map( d => d.id)
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')
    const newData = data.filter( d => !prevStockIds.includes(d.id) )
    // TODO maybe we don't always just want to add on, or I need date info
    const newFaradayData = newData.map( d => ({ faraday: d, createdDate: new Date().toISOString() }))

    /**
     * Insert new data
     */
    let insertedDocs;
    if (newFaradayData.length){
      console.log('!Inserting docuemnts -> ', newFaradayData.length);
      // This avoids: MongoInvalidArgumentError: Invalid BulkOperation, Batch cannot be empty
      insertedDocs = await albumCollection.insertMany(newFaradayData)
    }
    
    /**
     * Update current data
     */
    const needsUpdate = prevStock.filter( prevItem => {
      const currentItem = data.find( currentItem => currentItem.id === prevItem.id) 
      if (currentItem){
        const newAvailablility = currentItem.isSoldOut !== prevItem.isSoldOut
        const newCategory = currentItem.category !== prevItem.category 
        const newPrice = currentItem.price !== prevItem.price
        const needsUpdate = newAvailablility || newCategory || newPrice
        return needsUpdate
      }
      return false
    })
    const stockToUpdate = needsUpdate.map( prevItem => {
      const currentItem = data.find( currentItem => currentItem.id === prevItem.id) 
      if (currentItem) return { _id: prevItem._id, ...currentItem }
      return { _id: prevItem._id, notAvailable: true }
    })

    let updatedDocs;
    if (stockToUpdate.length){
      console.log('!Updating docuemnts -> ', stockToUpdate.length);
      // This avoids: MongoInvalidArgumentError: Invalid BulkOperation, Batch cannot be empty
      updatedDocs = await Promise.all(stockToUpdate.map( async (stock) => {
       const { _id, ...rest } = stock
       const updatedDoc = await albumCollection.updateOne(
        { _id: new ObjectId(_id) }, 
        { $set: { 
          faraday: rest,
          updatedDate: new Date().toISOString()
        }})
       return updatedDoc
     }))
    }

    return { 
      insertedDocs,
      updatedDocs
    }
  }

  
  async getFaradayData(){
    console.log('!getFaradayData -> ');
    const albumCollection = this.db?.collection('albums')
    const albums = await albumCollection?.find({}, {}).toArray()
    const faradayData: Array<FaradayItemData & { _id: string }> | undefined =  albums?.map(album => ( { _id: album._id.toString(),  ...album.faraday }))
    return faradayData ? faradayData : []
  }
 
  async getFaradayPlaylistData(userId: string): Promise<SpotifyPlaylist[] | null | undefined> {
    console.log('!getFaradayPlaylistData -> ');
    const userCollection = this.db?.collection('users')
    const projection = { playlists: 1 , _id: 0 }
    const sort = { createdTime: 'desc' as 'desc' }
    const userPlaylists = await userCollection?.findOne({ _id: new ObjectId(userId) }, { projection, sort })
    console.log('!userPlaylists -> ', userPlaylists?.length);
    if (!userPlaylists?.playlists || !Array.isArray(userPlaylists.playlists)) throw Error('Playlists returned is not an array')
    return userPlaylists.playlists
  }

  async getFaradayDataMissingSpotifyInfo(){
    console.log('!getFaradayDataMissingSpotifyInfo -> ');
    const albumCollection = this.db?.collection('albums')
    // const match = { notFound: true }
    const match = {
      spotify: { $exists: false },
      $or: [ { notFound: { $exists: false } }, { notFound: false } ]
    }
    const albums = await albumCollection?.find(match, {}).toArray()
    const faradayData: Array<FaradayItemData & { _id: string }> | undefined =  albums?.map(album => ( { _id: album._id.toString(),  ...album.faraday }))
    console.log('!getFaradayDataMissingSpotifyInfo length -> ', faradayData?.length);
    return faradayData ? faradayData : []
  }
  
  async getPlaylistData(){
    if (!this.db) throw new Error('No DB found')
      const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No albumCollection found')
    const match = {
      'faraday.isSoldOut': false ,
      'spotify.trackIds': { '$exists': true }
    }
    const albums = await albumCollection?.find(match, {}).toArray()
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
        createdDate: new Date().toISOString(),
        playlists: []
      })
      console.log('!insertedDocs -> ', insertedDocs);
      return insertedDocs
    }

    const insertedDocs = await usersCollection.updateOne(
      { _id: user._id},
      { $set: {
        endpoint: tokenInfo,
        updatedDate: new Date().toISOString()
      }}
    )
    console.log('!insertedDocs -> ', insertedDocs);
    return insertedDocs
  }

  async setUsersPlaylist(userUri: SpotifyUserProfile["uri"], spotifyPlaylist: SpotifyPlaylist){
    console.log('setUsersPlaylist', userUri, spotifyPlaylist)
    const usersCollection: mongoDB.Collection<SpotifyUserProfile> | undefined = this.db?.collection('users')
    if (!usersCollection) throw new Error('No users collecion found')
    const updated = await usersCollection.findOneAndUpdate({ uri: userUri }, { $push: { 
      playlists: {
        ...spotifyPlaylist,
        createdTime: new Date().toISOString()
      }
    }})
  }

  async setFaradayIdAsNotFound(faradayId: FaradayItemData["id"]){
    console.log('!setFaradayIdAsNotFound -> ', faradayId);
    const albumCollection = this.db?.collection('albums')
    const updated = await albumCollection?.updateOne({ "faraday.id": faradayId }, { $set: { notFound: true }})
    return updated
  }
  
  async getSpotifyTracksListByAlbumId(albumId: SpotifyAlbum["id"]){
    console.log('!getSpotifyTracksListByAlbumId -> ', albumId);
    const albumCollection = this.db?.collection('albums')
    const match = { 'spotify.id': albumId }
    const projection = { 'spotify.trackInfo.items': 1, _id: 0}
    const albumInfo = await albumCollection?.findOne(match, { projection })
    const tracks = albumInfo?.spotify.trackInfo
    return tracks
  }

  /**
   * Sets cover image info for a playlist
   * @param userId ObjectId
   * @param playlistId string
   * @param coverImageInfo Array<{url}>
   * @returns 
   */
  async setCoverImage(userId: string, playlistId: string, coverImageInfo: SpotifyCoverImageResponse){
    console.log('!setCoverImage -> ', userId, playlistId, coverImageInfo.length);
    const usersCollection = this.db?.collection('users')
    if (!usersCollection) throw new Error('No users collecion found')
    // An alternative approach would be to use arrayFilters. lets see.
    /**
     *  { _id: userId },
        { $set: { "playlists.$[elem].images": coverImageInfo } },
        { arrayFilters: [{ "elem.id": playlistId }] }
     */
    const match = { _id: new ObjectId(userId), 'playlists.id': playlistId }
    const update = { $set: { "playlists.$.images": coverImageInfo } }
    const updated = await usersCollection.updateOne(match, update)
    return updated
  }

  /**
   * Returns track info for ids given
   */
  async getSpotifyTracksById(trackIds: string[]){
    if (!this.db) throw new Error('No DB found')
    const albumCollection = this.db.collection('albums')
    if (!albumCollection) throw new Error('No albumCollection found')
    const match = {
      'spotify.trackInfo.items.id': { $in: trackIds }
    }
    const tracks = await albumCollection.aggregate([
      { $match: match }, // returns the matching document
      { $unwind: '$spotify.trackInfo.items' },
      { $match: { 'spotify.trackInfo.items.id': { $in: trackIds } } }, // Match only the tracks
      { $project: {
        artists: '$spotify.trackInfo.items.artists',
        duration_ms: '$spotify.trackInfo.items.duration_ms',
        id: '$spotify.trackInfo.items.id',
        name: '$spotify.trackInfo.items.name',
        preview_url: '$spotify.trackInfo.items.preview_url',
        track_number: '$spotify.trackInfo.items.track_number',
        type: '$spotify.trackInfo.items.type',
        uri: '$spotify.trackInfo.items.uri',
        imageUrl: '$spotify.image.url',
      }}
    ]).toArray()
    return tracks;
  }

}

export default MongoDb;