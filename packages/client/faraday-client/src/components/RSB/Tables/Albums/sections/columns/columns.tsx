import { AccessorColumnDef } from "@tanstack/react-table"
import styles from './columns.module.css'
import { SpotifySearchResult } from "../../../../../../types/spotify.types"
import { AlbumItemTableData } from "../../AlbumTable"


export const image: AccessorColumnDef<AlbumItemTableData, { url: SpotifySearchResult["image"]["url"], isSoldOut: SpotifySearchResult["isSoldOut"] }> = {
  accessorFn: ({ isSoldOut, image }) => {
    return {
      url: image.url,
      isSoldOut
    }
  },
  id: 'image',
  cell: info => {
    const { isSoldOut, url } = info.getValue()
    return (
      <>
        <div
          className={styles.rowDataImg}
          style={{
            backgroundImage: `url(${url})`
          }}
        >
          {isSoldOut && <div className={styles.albumItemSoldOut}></div>}
        </div>
      </>
    )
  },
  header: () => null,
  enableSorting: false
}

export const albumAndArtist: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult> = {
  accessorFn: row => row,
  id: 'albumInfo',
  cell: info => {
    const { name, artists } = info.getValue() as SpotifySearchResult
    const artist = artists.join(', ')
    const album = name
    return (
      <div className={styles.rowDataAlbum}>
        <p>{album}</p>
        <p>{artist}</p>
      </div>
    )
  },
  header: () => <span>Title</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const album: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["name"]> = {
  accessorFn: row => row.name,
  id: 'album',
  cell: info => <span className={styles.rowDataAlbum}>{info.getValue() as string}</span>,
  header: () => <span>Album</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const artists: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["artists"]> = {
  accessorFn: row => row.artists,
  id: 'artists',
  cell: info => <span className={styles.rowDataArtist}>{info.getValue().join(', ')}</span>,
  header: () => <span>Artist</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const availablity: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["isSoldOut"]> = {
  accessorFn: row => row.isSoldOut,
  id: 'availablity',
  cell: info => {
    const isSoldOut = !!info.getValue()
    return (
      <span className={`${styles.rowDataAvailability} ${isSoldOut ? styles.unavailable : ''}`}>

      </span>
    )
  },
  header: () => <span>Available</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const category: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["category"]> = {
  accessorFn: row => row.category,
  id: 'category',
  cell: info => info.getValue() || '',
  header: () => <span>Category</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const price: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["price"]> = {
  accessorFn: row => row.price,
  id: 'price',
  cell: info => {
    const value = info.getValue() || ''
    const onSale = value.toLowerCase().includes('sale')
    const i = value.indexOf(':')
    const price = onSale ? value.substring(i + 1, i + 6) : value
    return (
      <div>{price}</div>
    )
  },
  header: () => <span>Price</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const popularity: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["popularity"]> = {
  accessorFn: row => row.popularity,
  id: 'popularity',
  cell: info => info.getValue(),
  header: () => <span>Popularity</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const releaseDate: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["releaseDate"]> = {
  accessorFn: row => row.releaseDate,
  id: 'release',
  cell: info => {
    const date = info.getValue()
    const asYear = date ? new Date(date).getFullYear().toString() : ''
    return (
      <div>{asYear}</div>
    )
  },
  header: () => <span>Release Date</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const genre: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["genres"]> = {
  accessorFn: row => row.genres,
  id: 'genre',
  cell: info => info.getValue(),
  header: () => <span>Genre</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const getCheckbox = ({
  areAllAlbumsSelected,
  handleSelectAll,
}: {
  areAllAlbumsSelected: boolean,
  handleSelectAll: (checked?: boolean) => void,
}) => {
  const checkbox: AccessorColumnDef<AlbumItemTableData, { albumId: SpotifySearchResult['id'], isChecked: boolean }> = {
    accessorFn: row => ({ albumId: row.id, isChecked: row.isChecked }),
    id: 'checkbox',
    cell: info => {
      const {albumId, isChecked} = info.getValue()
      return (
        <input
          className={styles.rowDataCheckbox}
          type="checkbox" 
          value={albumId} 
          checked={isChecked}
        />
      )
    },
    header: () => {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          <p style={{ textAlign: 'left' }}>Select All</p>
          <input
            className={styles.rowDataCheckbox}
            type="checkbox" 
            value={'all'} 
            checked={areAllAlbumsSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
        </div>
      )
    },
    enableSorting: false
  }
  return checkbox
}



