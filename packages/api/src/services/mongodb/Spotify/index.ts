import { Collection, Db, ObjectId, UpdateResult, WithId } from "mongodb"
import { AppState } from "#router/"
import { SpotifyAlbum, SpotifyAlbumTracksResponse, SpotifyCoverImageResponse, SpotifySearchResult, SpotifyTrackData } from "#controllers/spotify/spotify.types.js"
import { FaradayItemData } from "#controllers/faraday/getItemData.js"
import BaseConnection from "../BaseConnection.js"
// import { GetSpotifyDataFilter, GetSpotifyDataMatch } from "../_refactored/_index.js"

export type GetSpotifyDataFilter = {
  isSoldOut?: boolean
}
type SpotifyMongoDoc = SpotifySearchResult & { trackInfo: SpotifyAlbumTracksResponse }

export type GetSpotifyDataMatch = Record<keyof SpotifyMongoDoc, any> | null

export default class SpotifyMongo extends BaseConnection {
  collection: Collection<Document>
  // organize into API related calls
  playlists: { setCoverImage: (userId: string, playlistId: string, coverImageInfo: SpotifyCoverImageResponse) => Promise<UpdateResult<Document>> } | null = null

  constructor(db: Db, collectionName = 'albums') {
    super(db)
    this.collection = this.db.collection(collectionName);
    this.init()
  }

  init() {
    // TODO organize into API related calls
    this.playlists = { setCoverImage: this.setCoverImage }
  }

  /**
   * Sets Spotify data from faraday webscrape data 
   * @param data 
   * @returns 
   */
  async setSpotifyData(data: AppState["data"]["searchResults"], faradayData: WithId<FaradayItemData>[]) {
    console.log('!setSpotifyData -> ', data?.length);
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')

    let matchedCount = 0
    let notMatchedCount = 0
    const insertedDocs = await Promise.all(await faradayData.map(async (album) => {
      const matched = data?.find(searchResult => searchResult.faraday.id === album.id)
      if (matched) {
        await albumCollection.updateOne(
          { 'faraday.id': album.id },
          {
            $set: {
              spotify: matched.spotify,
              updatedDate: new Date()
            }
          }
        )
        matchedCount++
      } else notMatchedCount++
    }))
    console.log('!insertedDocs -> ', { notMatchedCount, matchedCount });
    return {
      notMatchedCount,
      matchedCount
    }
  }
  async setSpotifyTrackData(data: AppState["data"]["spotifyTrackInfo"]) {
    console.log('!setSpotifyData -> ', data?.length);
    if (!data) throw new Error('No spotifyTrackInfo found')
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')

    const insertedDocs = await Promise.all(await data.map(async (spotifyTrackInfo) => {
      const trackIds = spotifyTrackInfo.tracks.items
        .sort((trackA, trackB) => (Number(trackA.track_number) - Number(trackB.track_number)))
        .map(track => track.uri) // used for adding to playlist
      await albumCollection.updateOne(
        { 'spotify.id': spotifyTrackInfo.album.id },
        {
          $set: {
            'spotify.trackIds': trackIds,
            'spotify.trackInfo': spotifyTrackInfo.tracks,
            updatedDate: new Date()
          }
        }
      )
    }))
    console.log('!insertedDocs -> ', insertedDocs.length);
    return insertedDocs
  }

  // Updates a single album with new properties we might want
  async updateSpotifyAlbumFields(albumProperties: Partial<SpotifyAlbum> & { id: SpotifyAlbum["id"] }) {
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
      {
        $set: {
          ...update,
          updatedDate: new Date()
        }
      }
    )
    console.log('!insertedDoc -> ', insertedDoc);
    return insertedDoc
  }

  async getSpotifyData(match?: Record<string, any>) {
    console.log('!getSpotifyData -> ');
    const albumCollection = this.db?.collection('albums')
    const albums = await albumCollection?.find(match || {}, {}).toArray()
    const spotifyData: Array<SpotifySearchResult & { _id: string }> | undefined = albums?.map(album => ({ _id: album._id.toString(), ...album.spotify }))
    return spotifyData ? spotifyData : []
  }


  /**
   * This is the main GET for the landing page.
   * At the moment, just return everything
   * Will have to figure out a limit
   * @param match 
   * @returns 
   */
  async getSpotifyAlbumData({
    match,
    limit,
    offset,
    filter,
    fullProjection,
  }: {
    match?: Record<string, any>, 
    limit?: number, 
    offset?: number, 
    filter?: GetSpotifyDataFilter,
    fullProjection?: boolean
  }) {
    console.log('!getSpotifyAlbumData -> ', { limit, offset, fullProjection });
    const albumProjection = {
      'spotify.artists': 1,
      'spotify.href': 1,
      'spotify.id': 1,
      'spotify.image': 1,
      'spotify.name': 1,
      'faraday.category': 1,
      'faraday.isSoldOut': 1,
      'faraday.price': 1,
      'faraday.link': 1,
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
      spotify: { $exists: true },
      $or: [{ notFound: false }, { notFound: { $exists: false } }],
      // TODO remove
      'faraday.isSoldOut': !!filter?.isSoldOut
    }
    const albums = await albumCollection?.find(
      notFoundMatch || {},
      {
        ...!fullProjection ? { projection: albumProjection} : {},
        limit,
        skip: offset
      }
    ).toArray()
    console.log('!albums.length -> ', albums?.length);
    // TODO improve this return type
    const spotifyData: Array<Partial<any> & { _id: string }> | undefined = (albums || []).map(album => ({ _id: album._id.toString(), ...album.spotify, ...album.faraday }))
    /**
     * ReMap the trackInfo data.
     */
    const reMapped = spotifyData.map(datum => {
      const { trackInfo, ...rest } = datum
      return {
        ...rest,
        trackList: trackInfo?.items || [],
        totalTracks: trackInfo?.items.length
      }
    })
    return reMapped
  }

  /**
   * @returns totalCount for all Spotify Albums
   */
  async getSpotifyAlbumDataCount(match: GetSpotifyDataMatch, filter: GetSpotifyDataFilter) {
    const albumCollection = this.db?.collection('albums')
    const notFoundMatch = {
      ...match || {},
      $or: [{ notFound: false }, { notFound: { $exists: false } }],
      // TODO remove
      'faraday.isSoldOut': !!filter.isSoldOut
    }
    const albumCount = await albumCollection?.countDocuments(notFoundMatch)
    return albumCount || 0
  }


  async getPlaylistData() {
    if (!this.db) throw new Error('No DB found')
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No albumCollection found')
    const match = {
      'faraday.isSoldOut': false,
      'spotify.trackIds': { '$exists': true }
    }
    const albums = await albumCollection?.find(match, {}).toArray()
    if (!albums) return []
    const playlistData: { trackIds: string }[] = albums
      .filter(album => !!album)
      .map(album => ({ trackIds: album.spotify.trackIds }))
    const flattenedIds = playlistData?.flatMap(album => album.trackIds)
    return flattenedIds
  }

  async getSpotifyTracksListByAlbumId(albumId: SpotifyAlbum["id"]) {
    console.log('!getSpotifyTracksListByAlbumId -> ', albumId);
    const albumCollection = this.db?.collection('albums')
    const match = { 'spotify.id': albumId }
    const projection = { 'spotify.trackInfo.items': 1, _id: 0 }
    const albumInfo = await albumCollection?.findOne(match, { projection })
    const tracks = albumInfo?.spotify.trackInfo
    return tracks
  }


  /**
    * Returns track info for ids given
    */
  async getSpotifyTracksById(trackIds: string[]) {
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
      {
        $project: {
          artists: '$spotify.trackInfo.items.artists',
          duration_ms: '$spotify.trackInfo.items.duration_ms',
          id: '$spotify.trackInfo.items.id',
          name: '$spotify.trackInfo.items.name',
          preview_url: '$spotify.trackInfo.items.preview_url',
          track_number: '$spotify.trackInfo.items.track_number',
          type: '$spotify.trackInfo.items.type',
          uri: '$spotify.trackInfo.items.uri',
          imageUrl: '$spotify.image.url',
        }
      }
    ]).toArray()
    return tracks;
  }



  async setCoverImage(userId: string, playlistId: string, coverImageInfo: SpotifyCoverImageResponse) {
    console.log('!setCoverImage -> ', playlistId, coverImageInfo.length);
    const usersCollection = this.db.collection('users')
    if (!usersCollection) throw new Error('No users collecion found')
    // An alternative approach would be to use arrayFilters. lets see.
    /**
     *  { _id: userId },
        { $set: { "playlists.$[elem].images": coverImageInfo } },
        { arrayFilters: [{ "elem.id": playlistId }] }
     */
    const match = { _id: new ObjectId(userId), 'playlists.id': new ObjectId(playlistId) }
    const update = { $set: { "playlists.$.images": coverImageInfo } }
    const updated = await usersCollection.updateOne(match, update)
    return updated
  }

  async getSpotifyAlbumDataMissingPreview(){
    const noPreviewMatch = 'spotify.trackInfo.items.preview_url'
    const albumCollection = this.db?.collection('albums')
    const match = {
      $and: [
        {
          'spotify.trackInfo.items': { $exists: true },
        },
        {
          'spotify.trackInfo.items': { $ne: [] },
        }
      ],
      [noPreviewMatch]: null,
    }
    const albums = await albumCollection?.find(match).toArray()
    /**
     * ReMap the trackInfo data.
     */
    const reMapped = albums.map(datum => {
      console.log('!datum -> ', datum);
      const { _id, spotify } = datum
      return {
        _id,
        trackList: spotify.trackInfo.items as SpotifyTrackData[]
      }
    })
    return reMapped

  }

  async setSpotifyTracksListById(albumsTracksData: { albumId: ObjectId, trackList: SpotifyTrackData[] }[]) {
    if (!albumsTracksData.length) {
      console.log('!setSpotifyTracksListById: albumsTracksData has no items')
      return
    }
    try {
      const albumsCollection = this.db.collection('albums')
      if (!albumsCollection) throw new Error('No albums collecion found')
      
        const bulkOps = albumsTracksData.map(album => ({
        updateOne: {
          filter: { _id: album.albumId }, // Important: Convert _id to ObjectId
          update: { $set: { 'spotify.trackInfo.items': album.trackList } }, // Update the fields
        }
      }));
  
      const result = await albumsCollection.bulkWrite(bulkOps);
  
      console.log(`Modified ${result.modifiedCount} documents, inserted ${result.upsertedCount}`);
  
      if (result.hasWriteErrors()) {
        console.error('Bulk write errors:', result.getWriteErrors());
      }
  
    } catch (error) {
      console.error('Error during bulk update:', error);
    }
  }
}