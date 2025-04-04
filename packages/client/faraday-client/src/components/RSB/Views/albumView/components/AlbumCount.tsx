import { useAppState } from "../../../../../state/AppStateHooks"

export function AlbumCount(){
  const { totalCollectionCount } = useAppState().rsb
  return (
    <p>{totalCollectionCount} Albums</p>
  )
}