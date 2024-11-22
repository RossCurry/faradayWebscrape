import { SpotifyCoverImageResponse } from "#controllers/spotify/spotify.types.js"
import { ObjectId } from "mongodb"
import MongoDb from "../index.js"

// TODO an Idea to create subsclasses for mongo methods
// export default class SpotifyMongo {
//   playlists: { setCoverImage: (playlistId: string, coverImageInfo: SpotifyCoverImageResponse) => void } | null = null
//   mongo: MongoDb
//   constructor(mongo: MongoDb){
//     this.mongo = mongo
//     this.init()
//   }
//   init(){
//     this.playlists = {
//       setCoverImage: this.setCoverImage
//     }
//   }
//   async setCoverImage(userId: string, playlistId: string, coverImageInfo: SpotifyCoverImageResponse){
//     console.log('!setCoverImage -> ', playlistId, coverImageInfo.length);
//     const usersCollection = this.mongo.db?.collection('users')
//     if (!usersCollection) throw new Error('No users collecion found')
//     // An alternative approach would be to use arrayFilters. lets see.
//     /**
//      *  { _id: userId },
//         { $set: { "playlists.$[elem].images": coverImageInfo } },
//         { arrayFilters: [{ "elem.id": playlistId }] }
//      */
//     const match = { _id: new ObjectId(userId), 'playlists.id': new ObjectId(playlistId) }
//     const update = { $set: { "playlists.$.images": coverImageInfo } }
//     const updated = await usersCollection.updateOne(match,update)
//     return updated
//   } 
// }