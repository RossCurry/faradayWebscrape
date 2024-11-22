/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Columnas
 * Artista, album title, disponible, genero, precio
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  getCheckbox
} from './sections/columns/columns'
import TrackTable, { TrackListData } from '../Tracks/TrackTable'
import { SpotifySearchResult } from '../../../../types/spotify.types'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks'

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

// TODO possible improvement use virtualizer from tanStack https://tanstack.com/virtual/latest

export default function AlbumTable({ data }: { data: SpotifySearchResult[] }) {
  const appDispatch = useAppDispatch()
  const { selectedAlbums, areAllAlbumsSelected } = useAppState().rsb

  // TrackTable Logic
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const tableAlbumsRef = useRef<HTMLTableElement>(null)
  const [tracklistNumTracks, setTracklistNumTracks] = useState<number>(0)
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  
  const dataWithCheckbox = useMemo(() => data.map(album => {
    return {
      ...album,
      isChecked: selectedAlbums[album.id]
    }
  }),[selectedAlbums, data])

  const allTrackIds = useMemo(() => {
    return data.reduce((tracks, album) => {
      const trackIds = album.trackList.map(track => track.id)
      return tracks.concat(trackIds)
    },[] as string[])
  },[data])

  const handleSelectAll = useCallback((checkboxValue?: boolean) => {
    const addAll = !!checkboxValue
    // Modify playlist and checkbox selection
    if (addAll){
      // add all tracks to the custom playlist
      appDispatch({type: 'addTracksToCustomPlaylist', trackIds: allTrackIds })
      appDispatch({ type: 'selectAllAlbums' })
    } else {
      appDispatch({ type: 'resetCustomPlaylist' })
      appDispatch({ type: 'deselectAllAlbums' })
    }
    // Toggle
    appDispatch({ type: 'setAllAlbumsSelected', areSelected: !areAllAlbumsSelected })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[allTrackIds, areAllAlbumsSelected])


  const columns = React.useMemo(
    () => [
      getCheckbox({ areAllAlbumsSelected, handleSelectAll}),
      image,
      albumAndArtist,
      category,
      releaseDate,
      price,
    ], [areAllAlbumsSelected, handleSelectAll]
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
            .rows.slice(0,60)
            .map(row => {
              // Each row is actually going to be 2 rows
              // 1. the tanStack data row (album)
              // 2. the track info for the album
              return (
                <AlbumRowMemoized
                  key={row.id + row.original.id}
                  row={row}
                  setTrackListVisible={setTrackListVisible}
                  setTracklistNumTracks={setTracklistNumTracks}
                  setTracklist={setTracklist}
                  tracklistVisible={tracklistVisible}
                  tracklist={tracklist}
                  // setIsAllSelected={setIsAllSelected}
                />
              )
            })}
        </tbody>
      </table>
    </>
  )
}

type AlbumRowMemoizedProps = {
  row: Row<AlbumItemTableData>,
  setTracklist: React.Dispatch<React.SetStateAction<TrackListData[] | null>>,
  setTracklistNumTracks: React.Dispatch<React.SetStateAction<number>>,
  setTrackListVisible: React.Dispatch<React.SetStateAction<{albumId: string | null}>>,
  tracklist: TrackListData[] | null,
  tracklistVisible: { albumId: string | null },
  // setIsAllSelected: React.Dispatch<React.SetStateAction<boolean>>
}
const AlbumRowMemoized = React.memo(({
  row,
  setTracklist,
  setTracklistNumTracks,
  setTrackListVisible,
  tracklist,
  tracklistVisible,
  // setIsAllSelected
}: AlbumRowMemoizedProps) => {
  const appDispatch = useAppDispatch();
   // Each row is actually going to be 2 rows
  // 1. the tanStack data row (album)
  // 2. the track info for the album

  const albumId = row.original.id
  const handleOnClick = async (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    console.log('hello', e)
    const { tagName } = (e.target as HTMLElement)
    if (tagName === 'INPUT'){
      const { target } = e;
      const { value: albumId, checked } = (target as HTMLInputElement)
      // controls input components for rows
      if (checked){
        appDispatch({ type: 'addSelectedAlbum', albumId })
        appDispatch({ type: 'addTracksToCustomPlaylist', trackIds: row.original.trackList.map(t => t.id)})
      } else {
        appDispatch({ type: 'deleteSelectedAlbum', albumId })
        appDispatch({ type: 'deleteTracksFromCustomPlaylist', trackIds: row.original.trackList.map(t => t.id)})
      }
      // handle deselect bulk selection
      if (!checked) appDispatch({ type: 'setAllAlbumsSelected', areSelected: false })
      // if (!checked) setIsAllSelected(false)
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
  row: Row<AlbumItemTableData>,
  tracklist: TrackListData[] | null,
  tracklistVisible: { albumId: string | null },
}
const AlbumTrackListCell = React.memo(({
  albumId,
  row,
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
                // deselect the album selection if selected
                albumId={albumId}
              />
            }
          </div>
        </td>
      </tr>
  )
})