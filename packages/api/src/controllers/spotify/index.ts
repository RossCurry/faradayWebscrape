import Application from 'koa';
import Router from 'koa-router';
import mw from '#middlewares/index.js'
import { AppContext, AppState } from "../../router.js";
import { getPlaylistImage } from '#middlewares/spotify/playlists/updateCoverImage.js';
const spotifyRouter = new Router<AppState, AppContext>()

// // Temporary Route to update missing genre field for existing
// spotifyRouter.post("/api/spotify/albums/update/properties",
//   mw.faraday.getFaradayStockMissingSpotifyInfo,
//   mw.auth.getClientCredentialToken,
//   mw.spotify.getAlbumsAndSetProperties, // get and set genre
//   // mw.spotify.setSpotifyAlbumInfo,
// )

spotifyRouter.post("/api/spotify/albums/update",
  mw.faraday.getFaradayStockMissingSpotifyInfo,
  mw.auth.getClientCredentialToken,
  mw.spotify.getAlbumInfoSpotify, // expensive on requests 200+
  mw.spotify.setSpotifyAlbumInfo,
)

spotifyRouter.post("/api/spotify/tracks",
  mw.spotify.getTracksById,
)

spotifyRouter.post("/api/spotify/tracks/update",
  mw.spotify.getSpotifyAlbumInfo, // from db
  mw.auth.getClientCredentialToken, 
  mw.spotify.getSpotifyTracksInfo, // from spoti api
  mw.spotify.setSpotifyTrackInfo
)

// spotifyRouter.post('/api/spotify/playlist/create',
//   mw.auth.getClientCredentialToken,
//   mw.spotify.playlists.CreatePlaylist,
//   mw.spotify.playlists.PopulatePlaylist,
// ) 

// Helper route to update playlist images for user X
spotifyRouter.post('/api/spotify/playlist/updateCoverImage/:playlistId',
  mw.auth.getClientCredentialToken, 
  mw.spotify.playlists.updateCoverImage,
)

/**
 * main request from UI to send code verification to spoti auth
 * & redirect FE to the spoti auth
 */
spotifyRouter.get('/api/spotify/connect', 
  async (ctx: AppContext, _next: Application.Next) => {
    console.log('!ctx. -> ', ctx.ip);
    try {
      const { 
        authUrl: spotifyAuthUrl, 
        codeVerifier: notEncoded 
      } = await ctx.services.spotify.redirectToSpotifyAuthorize()
      // We need this for the authTokenRequest
      ctx.services.codeVerifier.set(notEncoded)
      ctx.set('Content-Type', 'application/json');
      ctx.set('location', spotifyAuthUrl.toString());
      ctx.status = 201 // created
    } catch (error) {
      ctx.throw([500, error])
    }
})

/**
 * This is used by the FE to create the playlist.
 * We only get the code from the url redirect from Spotify
 * We need the codeChallenge from the previous connect step
 */
spotifyRouter.post("/api/spotify/redirect", 
  mw.auth.getPCKECredentialsToken, // use code from url
  mw.spotify.getCurrentUserFromSpotify, // get user info
  mw.spotify.playlists.CreatePlaylist, // user info needed for playlist creation
  mw.spotify.playlists.PopulatePlaylist,
)

/**
 * Create a playlist getting user from db
 */
spotifyRouter.post("/api/spotify/playlist/create",
  mw.auth.refreshTokenMiddleware,
  mw.auth.verifiedTokenMiddleware,
  mw.spotify.getCurrentUserFromMongo, // get user info from mongo
  mw.spotify.playlists.CreatePlaylist, // user info needed for playlist creation
  mw.spotify.playlists.PopulatePlaylist,
)

/**
 * Testing spotfiy search single album
 */
spotifyRouter.get("/api/spotify/search",
  mw.auth.getClientCredentialToken,
  mw.spotify.searchSingleTitle
)

/**
 * Return a json list of spotify track info available by album id
 */
spotifyRouter.get("/api/spotify/album/:id/tracks",
  async (ctx: AppContext & { params: Record<string, unknown> }, _next: Application.Next) => {
    const { spotify } = ctx.services.mongo
    if (!spotify) throw new Error('No mongo object found')
    try {
      const { id } = ctx.params
      console.log('!path -> ', id);
      const spotifyData = await spotify.getSpotifyTracksListByAlbumId(id as string)
      ctx.status = 200
      ctx.body = { tracklist: spotifyData };
    } catch (error) {
      console.error('Error in middleware:', error);
      ctx.status = 500;
      ctx.body = 'Internal Server Error';
    }
  }
)

spotifyRouter.get("/api/spotify/playlists",
  mw.auth.getClientCredentialToken,
  // Get playlists
  // Find playlists missing images
  // fetch those images 
  // update those images in db
  // return everything updated to the FE
  async (ctx: AppContext, next: Application.Next) => {
    const { faraday } = ctx.services.mongo
    if (!faraday) throw new Error('No mongo object found')
    try {
      const userId = ctx.services.token.getUserInfo()?.id
      if (!userId) throw Error('Cannot get playlist info. No userId given')
      const playlistsData = await faraday.getFaradayPlaylistData(userId)
      console.log('!spotifyData length-> ', playlistsData?.length);
      ctx.state.data.userPlaylists = playlistsData
      await next()
    } catch (error) {
      console.error('Error in middleware:', error);
      ctx.status = 500;
      ctx.body = `Internal Server Error: ${error}`;
    }
  },
  async (ctx: AppContext, _next: Application.Next) => {
    // Find playlists missing images
    const userId = ctx.services.token.currentUser?.id
    const accessToken = ctx.services.token.accessToken

    if (!userId) throw Error('Cannot get playlist images. No userId found')
    if (!accessToken) throw Error('Cannot get playlist images. No accessToken found')
    if (!ctx.state.data.userPlaylists) throw Error('Cannot get playlist images. No userPlaylists found')

    try {
      const playlistsToUpdate = await Promise.all(ctx.state.data.userPlaylists.map(async (playlist) => {
        const imageInfo = await getPlaylistImage(playlist.id, accessToken)
        // Set in DB for next time
        const updated = await ctx.services.mongo.spotify?.playlists?.setCoverImage(userId, playlist.id, imageInfo)
        // Update in Memory for response
        playlist.images = imageInfo
        return playlist
      }))
      console.log('!playlistsToUpdate -> ', playlistsToUpdate.length);
      ctx.body = playlistsToUpdate;
      ctx.status = 200;
    } catch (error) {
      console.error('Error in middleware:', error);
      ctx.status = 500;
      ctx.body = `Internal Server Error: ${error}`;
    }

  }
)

export default spotifyRouter;
