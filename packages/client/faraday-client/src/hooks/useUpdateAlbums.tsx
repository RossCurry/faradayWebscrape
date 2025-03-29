import { useEffect } from 'react'
import { getAvailableAlbums } from '../services/services'
import { useAppDispatch, useAppState } from '../state/AppStateHooks'

/**
 * Old hook used to get all albums.
 * Prefer batch call
 */
export default function useUpdateAlbums() {
  const dispatch = useAppDispatch()
  const { albumCollection } = useAppState()

  useEffect(() => {
    async function updateAlbums(){
      const availableAlbums = await getAvailableAlbums()
      if (availableAlbums && availableAlbums.length) dispatch({ type: 'setAlbumCollection', albums: availableAlbums })
    }
    if (!albumCollection?.length) updateAlbums()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumCollection])

}
