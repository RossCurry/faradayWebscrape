/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Columnas
 * Artista, album title, disponible, genero, precio
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
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

type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

export default function AlbumTable({ data }: { data: SpotifySearchResult[] }) {
  const checkedAlbumDictionary = useMemo(() => data.reduce((dict: CheckedAlbumDict, album: SpotifySearchResult) => {
    dict[album.id] = false
    return dict;
  }, {} as CheckedAlbumDict), [data])
  // This might just be too big to manage in memory
  const checkedTrackDictionary = useMemo(() => data.reduce((dict: CheckedAlbumDict, album: SpotifySearchResult) => {
    album.trackList.forEach(track =>{
      dict[track.id] = false
    })
    return dict;
  }, {} as CheckedAlbumDict),[data])
  const [customPlaylistAlbumSelection, setCustomPlaylistAlbumSelection] = useState<CheckedAlbumDict>({})
  const [customPlaylist, setCustomPlaylist] = useState<CheckedTrackDict>({})
  const [customPlaylistArray, setCustomPlaylistArray] = useState<string[]>([])
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const tableAlbumsRef = useRef<HTMLTableElement>(null)
  const [tracklistNumTracks, setTracklistNumTracks] = useState<number>(0)
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  console.log('!customPlaylistSelection -> ', customPlaylistAlbumSelection);
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
    // sortingFns: {
    //   sortStatusFn, //or provide our custom sorting function globally for all columns to be able to use
    // },
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    state: {
      sorting,
    },
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering - default on/true
    // enableMultiSort: false, //Don't allow shift key to sort multiple columns - default on/true
    // enableSorting: false, // - default on/true
    // enableSortingRemoval: false, //Don't allow - default on/true
    // isMultiSortEvent: (e) => true, //Make all clicks multi-sort - default requires `shift` key
    // maxMultiSortColCount: 3, // only allow 3 columns to be sorted at once - default is Infinity
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
            // TODO Pagination if you want
            // .rows.slice(0, 10)
            .rows
            .map(row => {
              // Each row is actually going to be 2 rows
              // 1. the tanStack data row (album)
              // 2. the track info for the album

              const albumId = row.original.id
              const handleOnClick = async (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
                const { tagName } = (e.target as HTMLElement)
                if (tagName === 'INPUT'){
                  const { target } = e;
                  const { value: albumId, checked } = (target as HTMLInputElement)
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
                  return
                } 
                // TODO otra solucion
                // TODO give it margin
                // e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest'})
                // Toggle
                setTrackListVisible({ albumId: tracklistVisible.albumId === albumId ? null : albumId })
                // Sets the height for the dropdown
                setTracklistNumTracks(row.original.totalTracks)
                setTracklist(row.original.trackList.map(track => ({ 
                  ...track, 
                  // isChecked: customPlaylistArray.includes(track.id),
                  // isChecked: customPlaylist[track.id],
                  imageUrl: row.original.image.url,
                })))
              }
              return (
                <>
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
                            setCustomPlaylistArray={setCustomPlaylistArray}
                            customPlaylistArray={customPlaylistArray}
                          />
                        }
                      </div>
                    </td>
                  </tr>
                </>
              )
            })}
        </tbody>
      </table>
    </>
  )
}
