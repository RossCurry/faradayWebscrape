// Playlist
export function updateLocalStoragePlaylist(updatedList: Record<string, boolean> | null) {
  if (!updatedList) localStorage.removeItem('playlist')
  else localStorage.setItem('playlist', JSON.stringify(updatedList))
}

export function getLocalStoragePlaylist(){
  const playlist = localStorage.getItem('playlist')
  return playlist ? JSON.parse(playlist) : null
}

// Selected Albums
export function updateLocalStorageSelectedAlbums(updatedList: Record<string, boolean> | null) {
  if (!updatedList) localStorage.removeItem('selectedAlbums')
  else localStorage.setItem('selectedAlbums', JSON.stringify(updatedList))
}

export function getLocalStorageSelectedAlbums(){
  const selectedAlbums = localStorage.getItem('selectedAlbums')
  return selectedAlbums ? JSON.parse(selectedAlbums) : null
}