import { AccessorColumnDef } from "@tanstack/react-table"
import styles from './columns.module.css'
import { TrackListData } from "../TrackTable"


// export const image: AccessorColumnDef<SpotifySearchResult, { url: SpotifySearchResult["image"]["url"], isSoldOut: SpotifySearchResult["isSoldOut"] }> = {
//   accessorFn: ({ isSoldOut, image }) => {
//     return {
//       url: image.url,
//       isSoldOut
//     }
//   },
//   id: 'image',
//   cell: info => {
//     const { isSoldOut, url } = info.getValue()
//     return (
//       <>
//         <div
//           className={styles.rowDataImg}
//           style={{
//             backgroundImage: `url(${url})`
//           }}
//         >
//           {isSoldOut && <div className={styles.albumItemSoldOut}></div>}
//         </div>
//       </>
//     )
//   },
//   header: () => null,
//   enableSorting: false
// }

// export const albumAndArtist: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult> = {
//   accessorFn: row => row,
//   id: 'albumInfo',
//   cell: info => {
//     const { name, artists } = info.getValue() as SpotifySearchResult
//     const artist = artists.join(', ')
//     const album = name
//     return (
//       <div className={styles.rowDataAlbum}>
//         <p>{album}</p>
//         <p>{artist}</p>
//       </div>
//     )
//   },
//   header: () => <span>Title</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }

export const title: AccessorColumnDef<TrackListData, TrackListData["name"]> = {
  accessorFn: row => row.name,
  id: 'title',
  cell: info => <span className={styles.rowDataAlbum}>{info.getValue()}</span>,
  header: () => <span>title</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const duration: AccessorColumnDef<TrackListData, string> = {
  accessorFn: row => {
    const minutes = Math.floor(row.duration_ms / 60000); // 1 minute = 60000 row.duration_ms
    const seconds = Math.floor((row.duration_ms % 60000) / 1000); // Remaining seconds
    // Use padStart to ensure two digits for minutes and seconds
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
    // return row.duration_ms
  },
  id: 'duration',
  cell: info => <span className={styles.rowDataAlbum}>{info.getValue()}</span>,
  header: () => <span>duration</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const artists: AccessorColumnDef<TrackListData, TrackListData["artists"][number]["name"][]> = {
  accessorFn: row => {
    const artistNames = row.artists.map(artist =>  artist.name)
    return artistNames
  },
  id: 'artists',
  cell: info => <span className={styles.rowDataAlbum}>{info.getValue().join(', ')}</span>,
  header: () => <span>artists</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const trackNumber: AccessorColumnDef<TrackListData, TrackListData["track_number"]> = {
  accessorFn: row => row.track_number,
  id: 'trackNumber',
  cell: info => <span className={styles.rowDataAlbum}>{info.getValue()}</span>,
  header: () => <span>trackNumber</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

// export const artists: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult["artists"]> = {
//   accessorFn: row => row.artists,
//   id: 'artists',
//   cell: info => <span className={styles.rowDataArtist}>{info.getValue().join(', ')}</span>,
//   header: () => <span>Artist</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }

// export const availablity: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult["isSoldOut"]> = {
//   accessorFn: row => row.isSoldOut,
//   id: 'availablity',
//   cell: info => {
//     const isSoldOut = !!info.getValue()
//     return (
//       <span className={`${styles.rowDataAvailability} ${isSoldOut ? styles.unavailable : ''}`}>

//       </span>
//     )
//   },
//   header: () => <span>Available</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }

// export const category: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult["category"]> = {
//   accessorFn: row => row.category,
//   id: 'category',
//   cell: info => info.getValue() || '',
//   header: () => <span>Category</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }

// export const price: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult["price"]> = {
//   accessorFn: row => row.price,
//   id: 'price',
//   cell: info => {
//     const value = info.getValue() || ''
//     const onSale = value.toLowerCase().includes('sale')
//     const i = value.indexOf(':')
//     const price = onSale ? value.substring(i + 1, i + 6) : value
//     return (
//       <div>{price}</div>
//     )
//   },
//   header: () => <span>Price</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }

// export const popularity: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult["popularity"]> = {
//   accessorFn: row => row.popularity,
//   id: 'popularity',
//   cell: info => info.getValue(),
//   header: () => <span>Popularity</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }

// export const releaseDate: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult["releaseDate"]> = {
//   accessorFn: row => row.releaseDate,
//   id: 'release',
//   cell: info => {
//     const date = info.getValue()
//     const asYear = date ? new Date(date).getFullYear().toString() : ''
//     return (
//       <div>{asYear}</div>
//     )
//   },
//   header: () => <span>Release Date</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }

// export const genre: AccessorColumnDef<SpotifySearchResult, SpotifySearchResult["genres"]> = {
//   accessorFn: row => row.genres,
//   id: 'genre',
//   cell: info => info.getValue(),
//   header: () => <span>Genre</span>,
//   sortUndefined: 'last', //force undefined values to the end
//   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
// }



