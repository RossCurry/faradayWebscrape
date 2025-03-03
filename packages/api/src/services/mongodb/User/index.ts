import {  SpotifyPlaylist, SpotifyUserProfile } from "#controllers/spotify/spotify.types.js"
import { Collection, Db, ObjectId, WithId } from "mongodb"
import { AuthToken, JwtPayloadUser } from "#services/token/Token.js"
import BaseConnection from "../BaseConnection.js"

type UserDocument = WithId<SpotifyUserProfile 
  & { 
    endpoint: AuthToken & {
      setAt: Date
    },
    createdDate: Date
    updatedDate?: Date
    playlists: Array<SpotifyPlaylist & {
      createdAt: Date
    }>
  }>

export default class UserMongo extends BaseConnection {
  collection: Collection<UserDocument>

  constructor(db: Db) {
    super(db)
    this.collection = this.db.collection('users');
  }


  /**
   * Create or Update a User in the DB
   * @returns UserInfo
   */
  async setUserInfo(userInfo: JwtPayloadUser | SpotifyUserProfile, tokenInfo: Omit<AuthToken, 'token_type'>): Promise<WithId<SpotifyUserProfile> | null> {
    console.log('!setUserInfo -> ', userInfo);
    if ('error' in userInfo) throw new Error('No userInfo set: Error in userInfo.', { cause: userInfo })
    if ('error' in tokenInfo) throw new Error('No tokenInfo set: Error in tokenInfo', { cause: tokenInfo })

    const [user] = await this.collection.find({ id: userInfo.id, uri: userInfo.uri }).toArray()

    // Update token info
    if (user) {
      return this.#updateUserInfo(user, userInfo, tokenInfo)
    }

    // TODO some typeguard for SpotifyUserProfile
    // Insert new user
    return this.#setNewUserInfo(userInfo as SpotifyUserProfile, tokenInfo)
  }

  async #updateUserInfo(user: UserDocument, userInfo: JwtPayloadUser | SpotifyUserProfile, tokenInfo: Omit<AuthToken, 'token_type'>): Promise<WithId<SpotifyUserProfile> | null> {
    console.log('!updateUserInfo -> ', userInfo);
    const modifiedFields = Object.keys(userInfo).reduce((newFields, field) => {
      if (field === '_id') return newFields;

      const newValue = (userInfo as any)[field]
      const currentValue = (user as any)[field]

      // Quick n dirty nested check
      const sameValue = JSON.stringify(newValue) !== JSON.stringify(currentValue)

      // No change - move on to next key
      if (sameValue) return newFields;

      // Update new value
      return {
        ...newFields,
        [field]: (userInfo as any)[field]
      }
    }, {} as Partial<SpotifyUserProfile>)

    console.log(`setUserInfo Updating user endpoint info:`, tokenInfo)
    const updatedUser = await this.collection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          ...modifiedFields,
          endpoint: {
            ...tokenInfo,
            token_type: 'Bearer',
            setAt: new Date(),
          },
          updatedDate: new Date()
        }
      },
      // Dont return this sensitive info
      { projection: { endpoint: 0, playlists: 0, _id: 0 } }
    )
    return updatedUser as WithId<SpotifyUserProfile> | null
  }

  async #setNewUserInfo(userInfo: SpotifyUserProfile, tokenInfo: Omit<AuthToken, 'token_type'>): Promise<WithId<SpotifyUserProfile> | null> {
    const usersCollection = this.db?.collection('users')
    if (!usersCollection) throw new Error('No users collecion found')
    // Insert new user
    console.log(`setUserInfo Inserting new user: ${userInfo}`)
    const insertedDoc = await this.collection.insertOne({
      ...userInfo,
      endpoint: {
        ...tokenInfo,
        token_type: 'Bearer',
        setAt: new Date(),
      },
      createdDate: new Date(),
      playlists: [] as UserDocument['playlists']
    } as UserDocument)

    // Get newley inserted user
    const insertedUser = await usersCollection.findOne(
      { _id: insertedDoc.insertedId },
      // Dont return endpoint info
      { projection: { endpoint: 0, playlists: 0, _id: 0 } }
    );

    return insertedUser as WithId<SpotifyUserProfile> | null
  }

  async setUsersPlaylist(userUri: SpotifyUserProfile["uri"], spotifyPlaylist: SpotifyPlaylist) {
    console.log('setUsersPlaylist', userUri, spotifyPlaylist)

    const updated = await this.collection.findOneAndUpdate({ uri: userUri }, {
      $push: {
        playlists: {
          ...spotifyPlaylist,
          createdAt: new Date()
        }
      }
    })
  }


  /**
   * Gets user info from mongo by spotify uri or id
   * TODO should just use id in future
   * @param id uri or mongo id
   */
  async getUserInfoById(uri: string) {
    if (!this.db) throw new Error('No DB found')
    const userCollection = this.db.collection('users')
    if (!userCollection) throw new Error('No userCollection found')
    // Remove accesstoken info
    const projection = { endpoint: 0, playlists: 0, _id: 0 }
    const user = await userCollection.findOne({ uri: uri }, { projection })
    console.log('!getUserInfoById user -> ', user);
    return user
  }

  async getUsersRefreshToken(userInfo: JwtPayloadUser | WithId<SpotifyUserProfile>) {
    if (!this.db) throw new Error('No DB found')
    const userCollection = this.db.collection('users')
    if (!userCollection) throw new Error('No userCollection found')
    // Get accesstoken info
    const projection = { endpoint: 1 }
    const userEndpointInfo = await userCollection.findOne(
      { uri: userInfo.uri }, { projection }
    ) as { _id: ObjectId, endpoint: AuthToken } | null
    console.log('!getUsersRefreshToken userEndpointInfo -> ', userEndpointInfo);
    return userEndpointInfo?.endpoint?.refresh_token
  }

  async getUsersAccessToken(userInfo: SpotifyUserProfile | WithId<SpotifyUserProfile>) {
    if (!this.db) throw new Error('No DB found')
    const userCollection = this.db.collection('users')
    if (!userCollection) throw new Error('No userCollection found')
    // Get accesstoken info
    const projection = { endpoint: 1 }
    const userEndpointInfo = await userCollection.findOne(
      { uri: userInfo.uri }, { projection }
    ) as { _id: ObjectId, endpoint: AuthToken } | null
    console.log('!getUsersAccessToken userEndpointInfo -> ', userEndpointInfo);
    return userEndpointInfo?.endpoint?.access_token || null
  }

}