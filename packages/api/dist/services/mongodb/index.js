import { connectToDatabase } from "./connection.js";
class MongoDb {
    db = null;
    constructor() {
        console.log('!MongoDb  constructor-> ');
        this.init();
    }
    async init() {
        // connect
        const connection = await connectToDatabase();
        this.db = connection;
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
    async getSpotifyData(match = {}) {
        console.log('!getSpotifyData -> ');
        const albumCollection = this.db?.collection('albums');
        const albums = await albumCollection?.find(match, {}).toArray();
        console.log('!getSpotifyData albums -> ', [albums]);
        const spotifyData = albums?.map(album => ({ _id: album._id.toString(), ...album.spotify }));
        return spotifyData ? spotifyData : [];
    }
    async setFaradayData(data) {
        const prevStock = await this.getFaradayData();
        const prevStockIds = data.map(d => d.id);
        console.log('!setFaradayData -> ', data.length);
        const albumCollection = this.db?.collection('albums');
        if (!albumCollection)
            throw new Error('No album collecion found');
        const filteredResults = data.filter(d => prevStockIds.includes(d.id));
        // TODO maybe we don't always just want to add on, or I need date info
        const newFaradayData = filteredResults.map(d => ({ faraday: d, createdDate: new Date(Date.now()).toISOString() }));
        const insertedDocs = await albumCollection.insertMany(newFaradayData);
        return insertedDocs;
    }
    async getFaradayData() {
        console.log('!getFaradayData -> ');
        const albumCollection = this.db?.collection('albums');
        const albums = await albumCollection?.find({}, {}).toArray();
        const faradayData = albums?.map(album => ({ _id: album._id.toString(), ...album.faraday }));
        return faradayData ? faradayData : [];
    }
    async getPlaylistData() {
        console.log('!getPlaylistData -> ');
        const albumCollection = this.db?.collection('albums');
        const albums = await albumCollection?.find({}, {}).toArray();
        if (!albums)
            return [];
        const playlistData = albums
            .filter(album => !!album)
            .map(album => ({ trackIds: album.spotify.trackIds }));
        return playlistData?.flatMap(album => album.trackIds);
    }
}
export default MongoDb;
