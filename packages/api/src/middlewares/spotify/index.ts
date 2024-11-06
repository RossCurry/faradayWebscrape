import CreatePlaylist from "./CreatePlaylist.js";
import getAlbumInfoSpotify from "./getAlbumInfo.js";
import getCurrentUser from "./getCurrentUser.js";
import getSpotifyAlbumInfo from "./getSpotifyAlbumInfo.js";
import getSpotifyTracksInfo from "./getSpotifyTracksInfo.js";
import PopulatePlaylist from "./PopulatePlaylist.js";
import setSpotifyAlbumInfo from "./setSpotifyAlbumInfo.js";
import setSpotifyTrackInfo from "./setSpotifyTrackInfo.js";
import searchSingleTitle from "./searchSingleTitle.js"
import getAlbumsAndSetProperties from "./getAlbumsAndSetProperties.js"
import updateCoverImage from "./playlists/updateCoverImage.js"

export default {
  CreatePlaylist,
  getAlbumInfoSpotify,
  getCurrentUser,
  getAlbumsAndSetProperties,
  getSpotifyAlbumInfo,
  getSpotifyTracksInfo,
  PopulatePlaylist,
  setSpotifyAlbumInfo,
  setSpotifyTrackInfo,
  searchSingleTitle,
  playlists: {
    updateCoverImage
  }
}