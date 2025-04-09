import styles from './tiles.module.css'
import { SpotifySearchResult } from '../../../types/spotify.types'

export type TilesProps = {
  albumCollection: SpotifySearchResult[]
}
export default function Tiles({ albumCollection }: TilesProps) {
  return (
    <ul className={styles.albumCollectionList}>
      {albumCollection.map( (album, i) => {
        return <AlbumItem key={i + '-' + album.id} album={album}/>
      })}
    </ul>
  )
}

type AlbumItemProps = {
  album: SpotifySearchResult
}
function AlbumItem({ album }: AlbumItemProps) {
  const {image} = album
  if (!image || !image.url ) return null
  return (
    <li className={styles.albumItem} style={{ backgroundImage: `url(${image.url})` }}>
      <h3>{album.name}</h3>
      <h4>{album.artists.join(', ').trim()}</h4>
      {album.isSoldOut && <div className={styles.albumItemSoldOut}></div>}
    </li>
  )
}