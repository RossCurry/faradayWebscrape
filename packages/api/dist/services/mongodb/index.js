import mongoDB, { ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
class MongoDb {
    db = null;
    // TODO redo this class to have an OOP spotify & faraday classes
    // spotify: SpotifyMongo | null = null
    constructor() {
        console.log('!MongoDb  constructor-> ');
        this.init();
    }
    async init() {
        // connect
        const connection = await this.connectToDatabase();
        this.db = connection;
    }
    async connectToDatabase() {
        const connectionString = process.env.DB_CONN_STRING;
        const faradayDB = process.env.DB_NAME;
        if (!connectionString || !faradayDB)
            throw new Error('No connection string or no DB Name for mongo db');
        const client = new mongoDB.MongoClient(connectionString);
        await client.connect();
        const db = client.db(faradayDB);
        const albumsCollection = db.collection('albums');
        console.log(`Successfully connected to database: ${db.databaseName} and collection: ${albumsCollection.collectionName}`);
        return db;
    }
    /**
     * Sets Spotify data from faraday webscrape data
     * @param data
     * @returns
     */
    async setSpotifyData(data) {
        console.log('!setSpotifyData -> ', data?.length);
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No album collecion found');
        const faradayData = await this.getFaradayData();
        let matchedCount = 0;
        let notMatchedCount = 0;
        const insertedDocs = await Promise.all(await faradayData.map(async (album) => {
            const matched = data?.find(searchResult => searchResult.faraday.id === album.id);
            if (matched) {
                await albumCollection.updateOne({ 'faraday.id': album.id }, { $set: {
                        spotify: matched.spotify,
                        updatedDate: new Date()
                    } });
                matchedCount++;
            }
            else
                notMatchedCount++;
        }));
        console.log('!insertedDocs -> ', { notMatchedCount, matchedCount });
        return {
            notMatchedCount,
            matchedCount
        };
    }
    async setSpotifyTrackData(data) {
        console.log('!setSpotifyData -> ', data?.length);
        if (!data)
            throw new Error('No spotifyTrackInfo found');
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No album collecion found');
        const insertedDocs = await Promise.all(await data.map(async (spotifyTrackInfo) => {
            const trackIds = spotifyTrackInfo.tracks.items
                .sort((trackA, trackB) => (Number(trackA.track_number) - Number(trackB.track_number)))
                .map(track => track.uri); // used for adding to playlist
            await albumCollection.updateOne({ 'spotify.id': spotifyTrackInfo.album.id }, { $set: {
                    'spotify.trackIds': trackIds,
                    'spotify.trackInfo': spotifyTrackInfo.tracks,
                    updatedDate: new Date()
                } });
        }));
        console.log('!insertedDocs -> ', insertedDocs.length);
        return insertedDocs;
    }
    // Updates a single album with new properties we might want
    async updateSpotifyAlbumFields(albumProperties) {
        console.log('!updateSpotifyAlbumFields -> ', albumProperties);
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No album collecion found');
        const { id, ...fieldsToUpdate } = albumProperties;
        const match = { 'spotify.id': id };
        const update = Object.entries(fieldsToUpdate).reduce((update, [key, value]) => {
            update[`spotify.${key}`] = value;
            return update;
        }, {});
        const insertedDoc = await albumCollection.updateOne(match, { $set: {
                ...update,
                updatedDate: new Date()
            } });
        console.log('!insertedDoc -> ', insertedDoc);
        return insertedDoc;
    }
    async getSpotifyData(match) {
        console.log('!getSpotifyData -> ');
        const albumCollection = this.db?.collection('albums');
        const albums = await albumCollection?.find(match || {}, {}).toArray();
        const spotifyData = albums?.map(album => ({ _id: album._id.toString(), ...album.spotify }));
        return spotifyData ? spotifyData : [];
    }
    /**
     * This is the main GET for the landing page.
     * At the moment, just return everything
     * Will have to figure out a limit
     * @param match
     * @returns
     */
    async getSpotifyAlbumData(match, limit, offset, filter) {
        console.log('!getSpotifyAlbumData -> ', { limit, offset });
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
        };
        const albumCollection = this.db?.collection('albums');
        const notFoundMatch = {
            ...match,
            spotify: { $exists: true },
            $or: [{ notFound: false }, { notFound: { $exists: false } }],
            // TODO remove
            'faraday.isSoldOut': !!filter?.isSoldOut
        };
        const albums = await albumCollection?.find(notFoundMatch || {}, {
            projection: albumProjection,
            limit,
            skip: offset
        }).toArray();
        console.log('!albums.length -> ', albums?.length);
        // TODO improve this return type
        const spotifyData = (albums || []).map(album => ({ _id: album._id.toString(), ...album.spotify, ...album.faraday }));
        /**
         * ReMap the trackInfo data.
         */
        const reMapped = spotifyData.map(datum => {
            const { trackInfo, ...rest } = datum;
            return {
                ...rest,
                trackList: trackInfo?.items || [],
                totalTracks: trackInfo?.items.length
            };
        });
        return reMapped;
    }
    /**
     * @returns totalCount for all Spotify Albums
     */
    async getSpotifyAlbumDataCount(match, filter) {
        const albumCollection = this.db?.collection('albums');
        const notFoundMatch = {
            ...match || {},
            $or: [{ notFound: false }, { notFound: { $exists: false } }],
            // TODO remove
            'faraday.isSoldOut': !!filter.isSoldOut
        };
        const albumCount = await albumCollection?.countDocuments(notFoundMatch);
        return albumCount || 0;
    }
    // TODO divide this into more methods
    async setFaradayData(data) {
        console.log('!setFaradayData -> ', data.length);
        const prevStock = await this.getFaradayData();
        console.log('!prevStock -> ', prevStock.length);
        const prevStockIds = prevStock.map(d => d.id);
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No album collecion found');
        const newData = data.filter(d => !prevStockIds.includes(d.id));
        // TODO maybe we don't always just want to add on, or I need date info
        const newFaradayData = newData.map(d => ({ faraday: d, createdDate: new Date() }));
        /**
         * Insert new data
         */
        let insertedDocs;
        if (newFaradayData.length) {
            console.log('!Inserting docuemnts -> ', newFaradayData.length);
            // This avoids: MongoInvalidArgumentError: Invalid BulkOperation, Batch cannot be empty
            insertedDocs = await albumCollection.insertMany(newFaradayData);
        }
        /**
         * Update current data
         */
        const needsUpdate = prevStock.filter(prevItem => {
            const currentItem = data.find(currentItem => currentItem.id === prevItem.id);
            if (currentItem) {
                const newAvailablility = currentItem.isSoldOut !== prevItem.isSoldOut;
                const newCategory = currentItem.category !== prevItem.category;
                const newPrice = currentItem.price !== prevItem.price;
                const needsUpdate = newAvailablility || newCategory || newPrice;
                return needsUpdate;
            }
            return false;
        });
        const stockToUpdate = needsUpdate.map(prevItem => {
            const currentItem = data.find(currentItem => currentItem.id === prevItem.id);
            if (currentItem)
                return { _id: prevItem._id, ...currentItem };
            return { _id: prevItem._id, notAvailable: true };
        });
        let updatedDocs;
        if (stockToUpdate.length) {
            console.log('!Updating docuemnts -> ', stockToUpdate.length);
            // This avoids: MongoInvalidArgumentError: Invalid BulkOperation, Batch cannot be empty
            updatedDocs = await Promise.all(stockToUpdate.map(async (stock) => {
                const { _id, ...rest } = stock;
                const updatedDoc = await albumCollection.updateOne({ _id: new ObjectId(_id) }, { $set: {
                        faraday: rest,
                        updatedDate: new Date()
                    } });
                return updatedDoc;
            }));
        }
        return {
            insertedDocs,
            updatedDocs
        };
    }
    async getFaradayData() {
        console.log('!getFaradayData -> ');
        const albumCollection = this.db?.collection('albums');
        const albums = await albumCollection?.find({}, {}).toArray();
        const faradayData = albums?.map(album => ({ _id: album._id.toString(), ...album.faraday }));
        return faradayData ? faradayData : [];
    }
    async getFaradayPlaylistData(userId) {
        console.log('!getFaradayPlaylistData -> ');
        const userCollection = this.db?.collection('users');
        const projection = { playlists: 1, _id: 0 };
        const sort = { createdTime: 'desc' };
        const userPlaylists = await userCollection?.findOne({ _id: new ObjectId(userId) }, { projection, sort });
        console.log('!userPlaylists -> ', userPlaylists?.length);
        if (!userPlaylists?.playlists || !Array.isArray(userPlaylists.playlists))
            throw Error('Playlists returned is not an array');
        return userPlaylists.playlists;
    }
    async getFaradayDataMissingSpotifyInfo() {
        console.log('!getFaradayDataMissingSpotifyInfo -> ');
        const albumCollection = this.db?.collection('albums');
        // const match = { notFound: true }
        const match = {
            spotify: { $exists: false },
            $or: [{ notFound: { $exists: false } }, { notFound: false }]
        };
        const albums = await albumCollection?.find(match, {}).toArray();
        const faradayData = albums?.map(album => ({ _id: album._id.toString(), ...album.faraday }));
        console.log('!getFaradayDataMissingSpotifyInfo length -> ', faradayData?.length);
        return faradayData ? faradayData : [];
    }
    async getPlaylistData() {
        if (!this.db)
            throw new Error('No DB found');
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No albumCollection found');
        const match = {
            'faraday.isSoldOut': false,
            'spotify.trackIds': { '$exists': true }
        };
        const albums = await albumCollection?.find(match, {}).toArray();
        if (!albums)
            return [];
        const playlistData = albums
            .filter(album => !!album)
            .map(album => ({ trackIds: album.spotify.trackIds }));
        const flattenedIds = playlistData?.flatMap(album => album.trackIds);
        return flattenedIds;
    }
    /**
     * Create or Update a User in the DB
     * @returns UserInfo
     */
    async setUserInfo(userInfo, tokenInfo) {
        console.log('!setUserInfo -> ', userInfo);
        if ('error' in userInfo)
            throw new Error('No userInfo set: Error in userInfo.', { cause: userInfo });
        if ('error' in tokenInfo)
            throw new Error('No tokenInfo set: Error in tokenInfo', { cause: tokenInfo });
        const usersCollection = this.db?.collection('users');
        if (!usersCollection)
            throw new Error('No users collecion found');
        const [user] = await usersCollection.find({ id: userInfo.id, href: userInfo.href }).toArray();
        // Update token info
        if (user) {
            return this.#updateUserInfo(user, userInfo, tokenInfo);
        }
        // Insert new user
        return this.#setNewUserInfo(userInfo, tokenInfo);
    }
    async #updateUserInfo(user, userInfo, tokenInfo) {
        console.log('!updateUserInfo -> ', userInfo);
        const usersCollection = this.db?.collection('users');
        if (!usersCollection)
            throw new Error('No users collecion found');
        const modifiedFields = Object.keys(userInfo).reduce((newFields, field) => {
            if (field === '_id')
                return newFields;
            const newValue = userInfo[field];
            const currentValue = user[field];
            // Quick n dirty nested check
            const sameValue = JSON.stringify(newValue) !== JSON.stringify(currentValue);
            // No change - move on to next key
            if (sameValue)
                return newFields;
            // Update new value
            return {
                ...newFields,
                [field]: userInfo[field]
            };
        }, {});
        console.log(`setUserInfo Updating user endpoint info:`, tokenInfo);
        const updatedUser = await usersCollection.findOneAndUpdate({ _id: user._id }, { $set: {
                ...modifiedFields,
                endpoint: {
                    ...tokenInfo,
                    setAt: new Date(),
                },
                updatedDate: new Date()
            } }, 
        // Dont return this sensitive info
        { projection: { endpoint: 0, playlists: 0 } });
        return updatedUser;
    }
    async #setNewUserInfo(userInfo, tokenInfo) {
        const usersCollection = this.db?.collection('users');
        if (!usersCollection)
            throw new Error('No users collecion found');
        // Insert new user
        console.log(`setUserInfo Inserting new user: ${userInfo}`);
        const insertedDoc = await usersCollection.insertOne({
            ...userInfo,
            endpoint: {
                ...tokenInfo,
                setAt: new Date(),
            },
            createdDate: new Date(),
            playlists: []
        });
        // Get newley inserted user
        const insertedUser = await usersCollection.findOne({ _id: insertedDoc.insertedId }, 
        // Dont return endpoint info
        { projection: { endpoint: 0, playlists: 0 } });
        return insertedUser;
    }
    async setUsersPlaylist(userUri, spotifyPlaylist) {
        console.log('setUsersPlaylist', userUri, spotifyPlaylist);
        const usersCollection = this.db?.collection('users');
        if (!usersCollection)
            throw new Error('No users collecion found');
        const updated = await usersCollection.findOneAndUpdate({ uri: userUri }, { $push: {
                playlists: {
                    ...spotifyPlaylist,
                    createdTime: new Date()
                }
            } });
    }
    async setFaradayIdAsNotFound(faradayId) {
        console.log('!setFaradayIdAsNotFound -> ', faradayId);
        const albumCollection = this.db?.collection('albums');
        const updated = await albumCollection?.updateOne({ "faraday.id": faradayId }, { $set: { notFound: true } });
        return updated;
    }
    async getSpotifyTracksListByAlbumId(albumId) {
        console.log('!getSpotifyTracksListByAlbumId -> ', albumId);
        const albumCollection = this.db?.collection('albums');
        const match = { 'spotify.id': albumId };
        const projection = { 'spotify.trackInfo.items': 1, _id: 0 };
        const albumInfo = await albumCollection?.findOne(match, { projection });
        const tracks = albumInfo?.spotify.trackInfo;
        return tracks;
    }
    /**
     * Sets cover image info for a playlist
     * @param userId ObjectId
     * @param playlistId string
     * @param coverImageInfo Array<{url}>
     * @returns
     */
    async setCoverImage(userId, playlistId, coverImageInfo) {
        console.log('!setCoverImage -> ', userId, playlistId, coverImageInfo.length);
        const usersCollection = this.db?.collection('users');
        if (!usersCollection)
            throw new Error('No users collecion found');
        // An alternative approach would be to use arrayFilters. lets see.
        /**
         *  { _id: userId },
            { $set: { "playlists.$[elem].images": coverImageInfo } },
            { arrayFilters: [{ "elem.id": playlistId }] }
         */
        const match = { _id: new ObjectId(userId), 'playlists.id': playlistId };
        const update = { $set: { "playlists.$.images": coverImageInfo } };
        const updated = await usersCollection.updateOne(match, update);
        return updated;
    }
    /**
     * Returns track info for ids given
     */
    async getSpotifyTracksById(trackIds) {
        if (!this.db)
            throw new Error('No DB found');
        const albumCollection = this.db.collection('albums');
        if (!albumCollection)
            throw new Error('No albumCollection found');
        const match = {
            'spotify.trackInfo.items.id': { $in: trackIds }
        };
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
                } }
        ]).toArray();
        return tracks;
    }
    /**
     * Gets user info from mongo by spotify uri or id
     * TODO should just use id in future
     * @param id uri or mongo id
     */
    async getUserInfoById(uri) {
        if (!this.db)
            throw new Error('No DB found');
        const userCollection = this.db.collection('users');
        if (!userCollection)
            throw new Error('No userCollection found');
        // Remove accesstoken info
        const projection = { endpoint: 0, playlists: 0 };
        const user = await userCollection.findOne({ uri: uri }, { projection });
        console.log('!getUserInfoById user -> ', user);
        return user;
    }
    async getUsersRefreshToken(userInfo) {
        if (!this.db)
            throw new Error('No DB found');
        const userCollection = this.db.collection('users');
        if (!userCollection)
            throw new Error('No userCollection found');
        // Get accesstoken info
        const projection = { endpoint: 1 };
        const userEndpointInfo = await userCollection.findOne({ uri: userInfo.uri }, { projection });
        console.log('!getUsersRefreshToken userEndpointInfo -> ', userEndpointInfo);
        return userEndpointInfo?.endpoint?.refresh_token;
    }
    async getUsersAccessToken(userInfo) {
        if (!this.db)
            throw new Error('No DB found');
        const userCollection = this.db.collection('users');
        if (!userCollection)
            throw new Error('No userCollection found');
        // Get accesstoken info
        const projection = { endpoint: 1 };
        const userEndpointInfo = await userCollection.findOne({ uri: userInfo.uri }, { projection });
        console.log('!getUsersAccessToken userEndpointInfo -> ', userEndpointInfo);
        return userEndpointInfo?.endpoint?.access_token || null;
    }
}
export default MongoDb;
