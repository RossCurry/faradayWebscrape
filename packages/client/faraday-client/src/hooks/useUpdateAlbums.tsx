import { useEffect } from 'react'
import { getAvailableAlbums } from '../services'
import { useAppDispatch, useAppState } from '../state/AppStateHooks'

export default function useUpdateAlbums() {
  const dispatch = useAppDispatch()
  const { albumCollection } = useAppState()

  useEffect(() => {
    async function updateAlbums(){
      const availableAlbums = await getAvailableAlbums()
      if (availableAlbums) dispatch({ type: 'setAlbumCollection', albums: availableAlbums })
    }
    if (!albumCollection) updateAlbums()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumCollection])

}
