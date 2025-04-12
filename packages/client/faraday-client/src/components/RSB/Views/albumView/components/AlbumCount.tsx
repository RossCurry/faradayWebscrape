import { useAppState } from "../../../../../state/AppStateHooks"

export function AlbumCount(){
  const { totalCollectionCount } = useAppState().rsb
  return (
    <p style={{ margin: 0, padding: 0}}>{totalCollectionCount} Albums</p>
  )
}