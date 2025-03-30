import { Collection, Db, ObjectId, WithId } from "mongodb"
import { FaradayItemData } from "#controllers/faraday/getItemData.js"
import { SpotifyPlaylist } from "#controllers/spotify/spotify.types.js"
import BaseConnection from "../BaseConnection.js"

export default class FaradayMongo extends BaseConnection {
  collection: Collection<Document>

  constructor(db: Db, collectionName = 'albums') {
    super(db)
    this.collection = this.db.collection(collectionName);
  }


  // TODO divide this into more methods
  async setFaradayData(data: FaradayItemData[]) {
    console.log('!setFaradayData -> ', data.length);
    const prevStock = await this.getFaradayData()
    console.log('!prevStock -> ', prevStock.length);
    const prevStockIds = prevStock.map(d => d.id)
    const albumCollection = this.db?.collection('albums')
    if (!albumCollection) throw new Error('No album collecion found')
    const newData = data.filter(d => !prevStockIds.includes(d.id))
    // TODO maybe we don't always just want to add on, or I need date info
    const newFaradayData = newData.map(d => ({ faraday: d, createdDate: new Date() }))

    /**
     * Insert new data
     */
    let insertedDocs;
    if (newFaradayData.length) {
      console.log('!Inserting docuemnts -> ', newFaradayData.length);
      // This avoids: MongoInvalidArgumentError: Invalid BulkOperation, Batch cannot be empty
      insertedDocs = await albumCollection.insertMany(newFaradayData)
    }

    /**
     * Update current data
     */
    const needsUpdate = prevStock.filter(prevItem => {
      const currentItem = data.find(currentItem => currentItem.id === prevItem.id)
      // TODO make this more extensible. Based on the types.
      if (currentItem) {
        const newAvailablility = currentItem.isSoldOut !== prevItem.isSoldOut
        const newCategory = currentItem.category !== prevItem.category
        const newPrice = currentItem.price !== prevItem.price
        const newLink = currentItem.link !== prevItem.link
        const newLinkLabel = currentItem.linkLabel !== prevItem.linkLabel
        const newIdTitle = currentItem.idTitle !== prevItem.idTitle
        const needsUpdate = newAvailablility || newCategory || newPrice || newLink || newLinkLabel || newIdTitle
        return needsUpdate
      }
      return false
    })
    const stockToUpdate = needsUpdate.map(prevItem => {
      const currentItem = data.find(currentItem => currentItem.id === prevItem.id)
      if (currentItem) return { _id: prevItem._id, ...currentItem }
      return { _id: prevItem._id, notAvailable: true }
    })

    let updatedDocs;
    if (stockToUpdate.length) {
      console.log('!Updating docuemnts -> ', stockToUpdate.length);
      // This avoids: MongoInvalidArgumentError: Invalid BulkOperation, Batch cannot be empty
      updatedDocs = await Promise.all(stockToUpdate.map(async (stock) => {
        const { _id, ...rest } = stock
        const updatedDoc = await albumCollection.updateOne(
          { _id: new ObjectId(_id) },
          {
            $set: {
              faraday: rest,
              updatedDate: new Date()
            }
          })
        return updatedDoc
      }))
    }

    return {
      insertedDocs,
      updatedDocs
    }
  }

  async setFaradayErrors(errors: FaradayItemData[]){
    console.log('!setFaradayErrors -> ', errors);
    const errorsCollection = this.db?.collection('errors')
    await errorsCollection.insertMany(errors);
  }

  async getFaradayErrors(){
    console.log('!getFaradayErrors -> ');
    const errorsCollection = this.db?.collection('errors')
    const errorData =  await errorsCollection.find({}).toArray();
    console.log('!getFaradayErrors -> ', errorData.length);
    const sourceContext = errorData.map(data => data.sourceContext);
    return sourceContext;
  }

  async getFaradayData() {
    console.log('!getFaradayData -> ');
    const albumCollection = this.db?.collection('albums')
    const albums = await albumCollection?.find({}, {}).toArray()
    const faradayData: Array<WithId<FaradayItemData>> | undefined = albums?.map(album => ({ _id: album._id.toString(), ...album.faraday }))
    return faradayData ? faradayData : []
  }

  async getFaradayPlaylistData(userId: string): Promise<SpotifyPlaylist[] | null | undefined> {
    console.log('!getFaradayPlaylistData -> ');
    const userCollection = this.db?.collection('users')
    const projection = { playlists: 1, _id: 0 }
    const sort = { createdTime: 'desc' as 'desc' }
    const userPlaylists = await userCollection?.findOne({ _id: new ObjectId(userId) }, { projection, sort })
    console.log('!userPlaylists -> ', userPlaylists?.length);
    if (!userPlaylists?.playlists || !Array.isArray(userPlaylists.playlists)) throw Error('Playlists returned is not an array')
    return userPlaylists.playlists
  }

  async getFaradayDataMissingSpotifyInfo(limit: number) {
    console.log('!getFaradayDataMissingSpotifyInfo -> ');
    const albumCollection = this.db?.collection('albums')
    // const match = { notFound: true }
    const match = {
      spotify: { $exists: false },
      $or: [{ notFound: { $exists: false } }, { notFound: false }]
    }
    const albums = await albumCollection?.find(match, { limit }).toArray()
    const faradayData: Array<FaradayItemData & { _id: string }> | undefined = albums?.map(album => ({ _id: album._id.toString(), ...album.faraday }))
    console.log('!getFaradayDataMissingSpotifyInfo length -> ', faradayData?.length);
    return faradayData ? faradayData : []
  }


  async setFaradayIdAsNotFound(faradayId: FaradayItemData["id"]) {
    console.log('!setFaradayIdAsNotFound -> ', faradayId);
    const albumCollection = this.db?.collection('albums')
    const updated = await albumCollection?.updateOne({ "faraday.id": faradayId }, { $set: { notFound: true } })
    return updated
  }

}