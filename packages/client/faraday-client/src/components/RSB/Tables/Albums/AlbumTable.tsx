/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Columnas
 * Artista, album title, disponible, genero, precio
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import styles from './AlbumTable.module.css'
import {
  image,
  albumAndArtist,
  category,
  price,
  releaseDate,
  checkBox
} from './sections/columns/columns'
import TrackTable, { TrackListData } from '../Tracks/TrackTable'
import Player from '../../Player/Player'
import { SpotifySearchResult } from '../../../../types/spotify.types'

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

// TODO possible improvement use virtualizer from tanStack https://tanstack.com/virtual/latest
export default function AlbumTable({ data }: { data: SpotifySearchResult[] }) {
  // Handles album row input selection
  const [customPlaylistAlbumSelection, setCustomPlaylistAlbumSelection] = useState<CheckedAlbumDict>({})
  // Handles custom playlist selection - tracks here will be added to the custom playlist
  const [customPlaylist, setCustomPlaylist] = useState<CheckedTrackDict>({})
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const tableAlbumsRef = useRef<HTMLTableElement>(null)
  const [tracklistNumTracks, setTracklistNumTracks] = useState<number>(0)
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const dataWithCheckbox = useMemo(() => data.map(album => {
    return {
      ...album,
      isChecked: customPlaylistAlbumSelection[album.id]
    }
  }),[customPlaylistAlbumSelection, data])

  const columns = React.useMemo(
    () => [
      checkBox,
      image,
      albumAndArtist,
      category,
      releaseDate,
      price,
    ], []
  )
  const table = useReactTable({
    columns,
    data: dataWithCheckbox,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    state: { sorting },
  })

  /**
   * Css variable useEffect. 
   * Sets num of tracks which sets height of tracklist
   * calc(var(--trackListNumTracks) * var(--trackListRowHeight))
   */
  useEffect(() => {
    let refCopy: HTMLTableElement | undefined;
    if (tableAlbumsRef.current) {
      // Copy for cleanup
      refCopy = tableAlbumsRef.current
      // Set a CSS variable when the component mounts
      tableAlbumsRef.current.style.setProperty('--trackListNumTracks', `${tracklistNumTracks}`);

    }
    // Cleanup function to reset the variable if needed
    return () => {
      refCopy?.style.removeProperty('--trackListNumTracks');
    };
  }, [tracklistNumTracks]);

  return (
    <>
      <Player audioUrl={audioUrl}/>
      <table
        id='table_albums'
        className={styles.table_albums}
        ref={tableAlbumsRef}
      >
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
                              : header.column.getNextSortingOrder() === 'desc'
                                ? 'Sort descending'
                                : 'Clear sort'
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table
            .getRowModel()
            // TODO virtualize or use pagination
            .rows.slice(0,30)
            .map(row => {
              // Each row is actually going to be 2 rows
              // 1. the tanStack data row (album)
              // 2. the track info for the album
              return (
                <AlbumRowMemoized
                  key={row.id + row.original.id}
                  row={row}
                  setCustomPlaylistAlbumSelection={setCustomPlaylistAlbumSelection}
                  setTrackListVisible={setTrackListVisible}
                  setTracklistNumTracks={setTracklistNumTracks}
                  setTracklist={setTracklist}
                  tracklistVisible={tracklistVisible}
                  tracklist={tracklist}
                  setAudioUrl={setAudioUrl}
                  customPlaylist={customPlaylist}
                  setCustomPlaylist={setCustomPlaylist}
                />
              )
            })}
        </tbody>
      </table>
    </>
  )
}

type AlbumRowMemoizedProps = {
  customPlaylist: CheckedTrackDict,
  row: Row<AlbumItemTableData>,
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setCustomPlaylist: React.Dispatch<React.SetStateAction<CheckedTrackDict>>,
  setCustomPlaylistAlbumSelection: React.Dispatch<React.SetStateAction<CheckedAlbumDict>>,
  setTracklist: React.Dispatch<React.SetStateAction<TrackListData[] | null>>,
  setTracklistNumTracks: React.Dispatch<React.SetStateAction<number>>,
  setTrackListVisible: React.Dispatch<React.SetStateAction<{albumId: string | null}>>,
  tracklist: TrackListData[] | null,
  tracklistVisible: { albumId: string | null },
}
const AlbumRowMemoized = React.memo(({
  customPlaylist,
  row,
  setAudioUrl,
  setCustomPlaylist,
  setCustomPlaylistAlbumSelection,
  setTracklist,
  setTracklistNumTracks,
  setTrackListVisible,
  tracklist,
  tracklistVisible,
}: AlbumRowMemoizedProps) => {
   // Each row is actually going to be 2 rows
  // 1. the tanStack data row (album)
  // 2. the track info for the album

  const albumId = row.original.id
  const handleOnClick = async (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    const { tagName } = (e.target as HTMLElement)
    if (tagName === 'INPUT'){
      const { target } = e;
      const { value: albumId, checked } = (target as HTMLInputElement)
      // controls input components for rows
      setCustomPlaylistAlbumSelection(selection => {
        if (checked){
          return {
            ...selection,
            [albumId]: checked
          }
        }
        const copy = { ...selection }
        delete copy[albumId]
        return copy
      })
      // handle selecting all tracks of the album
      setCustomPlaylist(selection => {
        const copy = { ...selection }
        if (checked){
          row.original.trackList.forEach(track => {
            copy[track.id] = true
          })
          return copy
        } else {
          row.original.trackList.forEach(track => {
            delete copy[track.id]
          })
          return copy
        }
      })
      return
    }
    const isSelected = tracklistVisible.albumId === albumId;
    if (!isSelected) e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest'})
    // Mapping imageUrl here but not isSelected so to re-render on selection
    setTracklist(row.original.trackList.map(track => ({ 
      ...track, 
      imageUrl: row.original.image.url,
    })))
    // Sets the height for the dropdown
    setTracklistNumTracks(row.original.totalTracks)
    // Toggle
    setTrackListVisible({ albumId: isSelected ? null : albumId })
  }
  return (
    <>
      <AlbumCell  
        row={row}
        handleOnClick={handleOnClick}
      />
      <AlbumTrackListCell 
        row={row}
        tracklistVisible={tracklistVisible}
        albumId={albumId}
        tracklist={tracklist}
        setAudioUrl={setAudioUrl}
        customPlaylist={customPlaylist}
        setCustomPlaylist={setCustomPlaylist}
        setCustomPlaylistAlbumSelection={setCustomPlaylistAlbumSelection}
      />
    </>
  )
})

type AlbumCellProps = {
  row: Row<AlbumItemTableData>,
  handleOnClick: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => Promise<void>
}
const AlbumCell = ({ 
  row,
  handleOnClick,
}: AlbumCellProps) => {
  return (
    <tr key={row.id} className={styles.albumRows} onClick={handleOnClick}>
      {row.getVisibleCells().map(cell => {
        return (

          <td key={cell.id}>
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            )}
          </td>
        )
      })}
    </tr>
  )
}

type AlbumTrackListCellProps = {
  albumId: string,
  customPlaylist: CheckedTrackDict,
  row: Row<AlbumItemTableData>,
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setCustomPlaylist: React.Dispatch<React.SetStateAction<CheckedTrackDict>>,
  setCustomPlaylistAlbumSelection: React.Dispatch<React.SetStateAction<CheckedAlbumDict>>,
  tracklist: TrackListData[] | null,
  tracklistVisible: { albumId: string | null },
}
const AlbumTrackListCell = React.memo(({
  albumId,
  customPlaylist,
  row,
  setAudioUrl,
  setCustomPlaylist,
  setCustomPlaylistAlbumSelection,
  tracklist,
  tracklistVisible,
}: AlbumTrackListCellProps) => {
  return (
    <tr
        className={`
          ${styles.tableRowWidth}
        `}
      >
        <td
          colSpan={row.getVisibleCells().length}
        >
          <div
            className={`
              ${styles.albumTrackList}
              ${tracklistVisible.albumId === albumId ? styles.albumTrackListOpen : ''}
            `}
          >
            {tracklist && 
              <TrackTable 
                data={tracklist} 
                key={row.original.id} 
                setAudioUrl={setAudioUrl}
                customPlaylist={customPlaylist}
                setCustomPlaylist={setCustomPlaylist}
                // deselect the album selection if selected
                albumId={albumId}
                setCustomPlaylistAlbumSelection={setCustomPlaylistAlbumSelection}
              />
            }
          </div>
        </td>
      </tr>
  )
})