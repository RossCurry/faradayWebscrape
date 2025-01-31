import { AccessorColumnDef } from "@tanstack/react-table"
import styles from './columns.module.css'
import { TrackListColumnData } from "../TrackTable"


export const image: AccessorColumnDef<TrackListColumnData, { url: TrackListColumnData["imageUrl"] }> = {
  accessorFn: ({ imageUrl }) => {
    return {
      url: imageUrl,
    }
  },
  id: 'image',
  cell: info => {
    const { url } = info.getValue()
    return (
      <>
        <div
          className={styles.trackRowDataImg}
          style={{
            backgroundImage: `url(${url})`
          }}
        />
      </>
    )
  },
  header: () => null,
  enableSorting: false,
  size: 50,
  maxSize: 50,
}

export const songAndArtist: AccessorColumnDef<TrackListColumnData, TrackListColumnData> = {
  accessorFn: row => row,
  id: 'songInfo',
  cell: info => {
    const { name, artists } = info.getValue()
    const artist = artists.map(artist => artist.name).join(', ')
    const song = name
    return (
      <div className={styles.rowDataTrack}>
        <p>{song}</p>
        <p>{artist}</p>
      </div>
    )
  },
  header: () => <span>Title</span>,
  sortingFn: (a, b) => {
    return a.original.name.localeCompare(b.original.name)
  },
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const title: AccessorColumnDef<TrackListColumnData, TrackListColumnData["name"]> = {
  accessorFn: row => row.name,
  id: 'title',
  cell: info => <span className={styles.rowDataTrack}>{info.getValue()}</span>,
  header: () => <span>title</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const duration: AccessorColumnDef<TrackListColumnData, string> = {
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
  cell: info => <span className={styles.rowDataTrack}>{info.getValue()}</span>,
  header: () => <span>duration</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const artists: AccessorColumnDef<TrackListColumnData, TrackListColumnData["artists"][number]["name"][]> = {
  accessorFn: row => {
    const artistNames = row.artists.map(artist =>  artist.name)
    return artistNames
  },
  id: 'artists',
  cell: info => <span className={styles.rowDataTrack}>{info.getValue().join(', ')}</span>,
  header: () => <span>artists</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}

export const trackNumber: AccessorColumnDef<TrackListColumnData, TrackListColumnData["track_number"]> = {
  accessorFn: row => row.track_number,
  id: 'trackNumber',
  cell: info => <span className={styles.rowDataTrackNumber}>{info.getValue()}</span>,
  header: () => <span className={styles.headerTrackNumber}>#</span>,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
  size: 50
}

export const player: AccessorColumnDef<TrackListColumnData, TrackListColumnData["preview_url"]> = {
  accessorFn: row => row.preview_url,
  id: 'player',
  cell: info => {
    const playUrl = info.getValue()
    return (
      <audio controls >
        <source src={playUrl} type="audio/mpeg"/>
      </audio>
    )
  },
  header: () => null,
  sortUndefined: 'last', //force undefined values to the end
  sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
}


export const getCheckbox = ({
  handleCheckbox,
}: {
  handleCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const checkBox: AccessorColumnDef<TrackListColumnData, { trackId: TrackListColumnData['id'], isChecked: boolean }> = {
    accessorFn: row => ({ trackId: row.id, isChecked: row.isChecked }),
    id: 'checkbox',
    cell: info => {
      const {trackId, isChecked} = info.getValue()
      return (
        <input
          className={styles.rowDataTrack}
          type="checkbox" 
          value={trackId} 
          checked={isChecked}
          onChange={handleCheckbox}
        />
      )
    },
    header: () => null,
  }
  return checkBox
}

