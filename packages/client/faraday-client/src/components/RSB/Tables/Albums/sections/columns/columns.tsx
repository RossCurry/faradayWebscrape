import { AccessorColumnDef } from "@tanstack/react-table"
import styles from './columns.module.css'
import { SpotifySearchResult } from "../../../../../../types/spotify.types"
import React from "react"
import { AddIcon, PlayIconFilled, RemoveIcon } from "../../../../../../icons"
import Tooltip from "../../../../../Shared/Tooltip/Tooltip"
import { TrackListData } from "../../../Tracks/TrackTable"
import IconButton from "../../../../../Shared/IconButton/IconButton"
import { useAppDispatch, useAppState } from "../../../../../../state/AppStateHooks"
import { AlbumItemTableData } from "../../AlbumTableContainer"
import { HeaderAlbumTableView } from "./components/HeaderAlbumTableView"

export const getImage = ({ isMobile }: { isMobile: boolean }) => {
  const image: AccessorColumnDef<AlbumItemTableData, { url: SpotifySearchResult["image"]["url"], isSoldOut: SpotifySearchResult["isSoldOut"] }> = {
    accessorFn: ({ isSoldOut, image }) => {
      return {
        url: image?.url,
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
    enableSorting: false,
    // column size options
    // enableResizing: true // default
    size: isMobile ? 120 : 150,
  }
  return image;
}

export const getPlayButton = ({ isMobile }: { isMobile: boolean }) => {
  const playButton: AccessorColumnDef<AlbumItemTableData, AlbumItemTableData> = {
    accessorFn: (data) => data,
    id: 'play',
    cell: function AlbumPlayButton(info){
      const { audioUrl } = useAppState().player
      const dispatch = useAppDispatch()
      const keyId = `album-playbutton-${React.useId()}`
      const data = info.getValue()
      const { trackList } = data
      const [firstTrack] = Array.isArray(trackList) ?  trackList : [];
      const preview_url = firstTrack?.preview_url
      // TODO include is playing state
      const isPlaying = audioUrl === preview_url
      const isDisabled = !preview_url;
  
      return (
        <span className={styles.rowDataCentered} key={keyId}>
          <Tooltip 
            Component={
              <IconButton 
                Icon={PlayIconFilled}
                handleOnClick={(e) => { 
                  e?.stopPropagation()
                  dispatch({ type: 'setAudioUrl', track: { ...firstTrack, imageUrl: data.image.url } })
                }}
                text=""
                className={`
                  ${styles.playButton}
                  ${preview_url ? '' : styles.isDisabled}
                  ${isPlaying ? styles.isPlaying : ''}
                `}
                disabled={isDisabled}
              />
            }
            tooltipText={'No preview available'}
            hideTooltip={!isDisabled}
          />
        </span>
      )
    },
    header: () => null,
    enableSorting: false,
    // column size options
    // enableResizing: true // default
    size: isMobile ? 50 : 60,
  }
  return playButton
}

export const getAlbumAndArtist = ({ isMobile }: { isMobile: boolean }) => {
  const albumAndArtist: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult> = {
    accessorFn: row => row,
    id: 'albumInfo',
    cell: info => {
      const { name, artists } = info.getValue() as SpotifySearchResult
      const artist = artists?.join(', ')
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
    size: 300,
    minSize: 200,
    maxSize: isMobile ? 300 : 500,

  }
  return albumAndArtist
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
  cell: info => <span className={styles.rowDataArtist}>{info.getValue()?.join(', ')}</span>,
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

export const getCategory = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) return null
  const category: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["category"]> = {
   accessorFn: row => row.category,
   id: 'category',
   cell: info => <span className={styles.rowDataCentered}>{info.getValue() || ''}</span>,
   header: () => <span>Category</span>,
   sortUndefined: 'last', //force undefined values to the end
   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
 }
 return category
}

export const getPrice = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) return null
  const price: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["price"]> = {
    accessorFn: row => row.price,
    id: 'price',
    cell: info => {
      const value = info.getValue() || ''
      const onSale = value.toLowerCase().includes('sale')
      const i = value.indexOf(':')
      const price = onSale ? value.substring(i + 1, i + 6) : value
      return (
        <div className={styles.rowDataCentered}>{price}</div>
      )
    },
    header: () => <span>Price</span>,
    sortUndefined: 'last', //force undefined values to the end
    sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
  }
  return price
} 

export const getPopularity = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) return null
  const popularity: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["popularity"]> = {
    accessorFn: row => row.popularity,
    id: 'popularity',
    cell: info => info.getValue(),
    header: () => <span>Popularity</span>,
    sortUndefined: 'last', //force undefined values to the end
    sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
  }
  return popularity
}

export const getReleaseDate = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) return null
  const releaseDate: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["releaseDate"]> = {
    accessorFn: row => row.releaseDate,
    id: 'release',
    cell: info => {
      const date = info.getValue()
      const asYear = date ? new Date(date).getFullYear().toString() : ''
      return (
        <div className={styles.rowDataCentered}>{asYear}</div>
      )
    },
    header: () => <span>Release</span>,
    sortUndefined: 'last', //force undefined values to the end
    sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
  }
  return releaseDate
}

export const getGenre = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) return null
  const genre: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["genres"]> = {
    accessorFn: row => row.genres,
    id: 'genre',
    cell: info => info.getValue(),
    header: () => <span>Genre</span>,
    sortUndefined: 'last', //force undefined values to the end
    sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
    size: 200,
  }
  return genre
}

export const getCheckbox = ({
  handleSelectCheckbox,
}: {
  handleSelectCheckbox: (trackList: TrackListData[], isChecked: boolean, albumId: string) => void,
}) => {
  const checkbox: AccessorColumnDef<AlbumItemTableData, { albumId: SpotifySearchResult['id'], isChecked: boolean, trackList: TrackListData[] }> = {
    accessorFn: row => ({ albumId: row.id, isChecked: row.isChecked, trackList: row.trackList }),
    id: 'checkbox',
    cell: function CheckboxCell(info) {
      const inputRef = React.useRef<HTMLInputElement>(null)
      const { albumId, isChecked, trackList } = info.getValue()
      const inputId = `album-checkbox-id-${albumId?.toString()}`

      const handleOnClick = (e: React.MouseEvent<HTMLDivElement | HTMLInputElement | SVGAElement | HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        handleSelectCheckbox(trackList, !isChecked, albumId)
      }
      
      return (
        <div className={styles.rowDataCheckboxWrapper} onClick={handleOnClick}>
          <label htmlFor={inputId} className={styles.rowDataCheckboxLabel} onClick={handleOnClick}>
            {isChecked 
              ? <RemoveIcon />
              : <AddIcon  /> 
            }
            <input
              className={styles.rowDataCheckbox}
              type="checkbox" 
              value={albumId} 
              checked={isChecked}
              onChange={()=>{}}
              id={inputId}
              style={{display: 'none'}}
              ref={inputRef}
            />
          </label>
        </div>
      )
    },
    // This needs to be a function for the React hook to work
    header: () => <HeaderAlbumTableView />,
    enableSorting: false,
    size: 80,
  }
  return checkbox
}



