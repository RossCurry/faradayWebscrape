import mongoDB, { ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
class MongoDb {
    db = null;
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
    async setSpotifyData(data) {
        console.log('!setSpotifyData -> ', data?.length);
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No album collecion found');
        const faradayData = await this.getFaradayData();
        const insertedDocs = await Promise.all(await faradayData.map(async (album) => {
            const matched = data?.find(searchResult => searchResult.faraday.id === album.id);
            if (matched) {
                await albumCollection.updateOne({ 'faraday.id': album.id }, { $set: {
                        spotify: matched.spotify,
                        updatedDate: new Date(Date.now()).toISOString()
                    } });
            }
        }));
        console.log('!insertedDocs -> ', insertedDocs.length);
        return insertedDocs;
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
                    updatedDate: new Date(Date.now()).toISOString()
                } });
        }));
        console.log('!insertedDocs -> ', insertedDocs.length);
        return insertedDocs;
    }
    async getSpotifyData(match) {
        console.log('!getSpotifyData -> ');
        const albumCollection = this.db?.collection('albums');
        const albums = await albumCollection?.find(match || {}, {}).toArray();
        const spotifyData = albums?.map(album => ({ _id: album._id.toString(), ...album.spotify }));
        return spotifyData ? spotifyData : [];
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
        const newFaradayData = newData.map(d => ({ faraday: d, createdDate: new Date().toISOString() }));
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
                const needsUpdate = currentItem.isSoldOut !== prevItem.isSoldOut || currentItem.category !== prevItem.category;
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
                        updatedDate: new Date().toISOString()
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
    async getPlaylistData() {
        if (!this.db)
            throw new Error('No DB found');
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No albumCollection found');
        const albums = await albumCollection?.find({ 'spotify.trackIds': { '$exists': true } }, {}).toArray();
        if (!albums)
            return [];
        const playlistData = albums
            .filter(album => !!album)
            .map(album => ({ trackIds: album.spotify.trackIds }));
        const flattenedIds = playlistData?.flatMap(album => album.trackIds);
        return flattenedIds;
    }
    async setUserInfo(userInfo, tokenInfo) {
        console.log('!setUserInfo -> ', userInfo);
        const usersCollection = this.db?.collection('users');
        if (!usersCollection)
            throw new Error('No users collecion found');
        const [user] = await usersCollection.find({ id: userInfo.id, href: userInfo.href }).toArray();
        console.log('!user -> ', user);
        if (!user) {
            const insertedDocs = await usersCollection.insertOne({
                ...userInfo,
                endpoint: tokenInfo,
                createdDate: new Date(Date.now()).toISOString()
            });
            console.log('!insertedDocs -> ', insertedDocs);
            return insertedDocs;
        }
        const insertedDocs = await usersCollection.updateOne({ _id: user._id }, { $set: {
                endpoint: tokenInfo,
                updatedDate: new Date(Date.now()).toISOString()
            } });
        console.log('!insertedDocs -> ', insertedDocs);
        return insertedDocs;
    }
}
export default MongoDb;
