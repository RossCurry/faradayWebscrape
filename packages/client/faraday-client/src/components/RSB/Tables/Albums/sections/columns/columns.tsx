import { AccessorColumnDef } from "@tanstack/react-table"
import styles from './columns.module.css'
import { SpotifySearchResult } from "../../../../../../types/spotify.types"
import React from "react"
import { AddIcon, LibraryAddIcon, LibraryRemoveIcon, PlayIconFilled, RemoveIcon } from "../../../../../../icons"
import Tooltip from "../../../../../Shared/Tooltip/Tooltip"
import { TrackListData } from "../../../Tracks/TrackTable"
import IconButton from "../../../../../Shared/IconButton/IconButton"
import { useAppDispatch, useAppState } from "../../../../../../state/AppStateHooks"
import { AlbumItemTableData } from "../../AlbumTableContainer"


export const image: AccessorColumnDef<AlbumItemTableData, { url: SpotifySearchResult["image"]["url"], isSoldOut: SpotifySearchResult["isSoldOut"] }> = {
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
  size: 150

}

export const playButton: AccessorColumnDef<AlbumItemTableData, AlbumItemTableData> = {
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
  size: 60
}

export const albumAndArtist: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult> = {
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
  maxSize: 500,
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

export const category: AccessorColumnDef<AlbumItemTableData, SpotifySearchResult["category"]> = {
  accessorFn: row => row.category,
  id: 'category',
  cell: info => <span className={styles.rowDataCentered}>{info.getValue() || ''}</span>,
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
      <div className={styles.rowDataCentered}>{price}</div>
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
      <div className={styles.rowDataCentered}>{asYear}</div>
    )
  },
  header: () => <span>Release</span>,
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
  size: 200
}

export const getCheckbox = ({
  areAllAlbumsSelected,
  handleSelectAll,
  handleSelectCheckbox,
}: {
  areAllAlbumsSelected: boolean,
  handleSelectAll: (checked?: boolean) => void,
  handleSelectCheckbox: (trackList: TrackListData[], isChecked: boolean, albumId: string) => void,
}) => {
  const checkbox: AccessorColumnDef<AlbumItemTableData, { albumId: SpotifySearchResult['id'], isChecked: boolean, trackList: TrackListData[] }> = {
    accessorFn: row => ({ albumId: row.id, isChecked: row.isChecked, trackList: row.trackList }),
    id: 'checkbox',
    cell: function CheckboxCell(info) {
      const inputRef = React.useRef<HTMLInputElement>(null)
      const { albumId, isChecked, trackList } = info.getValue()
      const inputId = `album-checkbox-id-${albumId?.toString()}`

      const handleOnClick = (e: React.MouseEvent<HTMLDivElement | HTMLInputElement | SVGAElement>) => {
        e.stopPropagation()
        handleSelectCheckbox(trackList, !isChecked, albumId)
      }
      
      return (
        <div className={styles.rowDataCheckboxWrapper} onClick={handleOnClick}>
          <label htmlFor={inputId} className={styles.rowDataCheckboxLabel}>
            {isChecked 
              ? <RemoveIcon />
              : <AddIcon  /> 
            }
            <input
              className={styles.rowDataCheckbox}
              type="checkbox" 
              value={albumId} 
              checked={isChecked}
              onChange={(e) => handleSelectCheckbox(trackList, e.target.checked, albumId)}
              id={inputId}
              style={{display: 'none'}}
              ref={inputRef}
            />
          </label>
        </div>
      )
    },
    // This needs to be a function for the React hook to work
    header: function Header(){
      const checkBoxId = `album-checkbox-select-all-id-${React.useId()}`
      return (
        <label htmlFor={checkBoxId} className={styles.rowDataCentered}>
          <Tooltip 
            Component={areAllAlbumsSelected ? <LibraryRemoveIcon /> : <LibraryAddIcon />}
            tooltipText={areAllAlbumsSelected ? "Remove All" : "Select All"}
            position="right"
          />
          <input
            id={checkBoxId}
            className={styles.rowDataCheckbox}
            type="checkbox" 
            value={'all'} 
            checked={areAllAlbumsSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{display: 'none'}}
          />
          </label>
      )
    },
    enableSorting: false,
    size: 60
  }
  return checkbox
}



