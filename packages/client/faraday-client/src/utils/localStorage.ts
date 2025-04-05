// Playlist
export function updateLocalStoragePlaylist(updatedList: Record<string, boolean> | null) {
  if (!updatedList) localStorage.removeItem('playlist')
  else localStorage.setItem('playlist', JSON.stringify(updatedList))
}

export function getLocalStoragePlaylist(){
  const playlist = localStorage.getItem('playlist')
  return playlist ? JSON.parse(playlist) : {}
}

// Selected Albums
export function updateLocalStorageSelectedAlbums(updatedList: Record<string, boolean> | null, areAllAlbumsSelected: boolean) {
  if (!updatedList) localStorage.removeItem('selectedAlbums')
  else localStorage.setItem('selectedAlbums', JSON.stringify(updatedList))
  localStorage.setItem('areAllAlbumsSelected', areAllAlbumsSelected.toString())
}

export function getLocalStorageSelectedAlbums(): Record<string, boolean>{
  const selectedAlbums = localStorage.getItem('selectedAlbums')
  return selectedAlbums ? JSON.parse(selectedAlbums) : {}
}

export function getLocalStorageAreAllAlbumsSelected() {
  console.log('!localStorage.getItem(areAllAlbumsSelected) -> ', Boolean(localStorage.getItem('areAllAlbumsSelected')));
  const strValue = localStorage.getItem('areAllAlbumsSelected');
  return strValue === 'true' ? true : false
}