/**
 * Columnas
 * Artista, album title, disponible, genero, precio
 */

import React, { useEffect, useRef, useState } from 'react'
import { SpotifySearchResult } from '../../../types/spotify.types'
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
} from './sections/columns/columns'
import TrackTable, { TrackListData } from '../Tracks/TrackTable'
import Player from '../../Player/Player'

export default function AlbumTable({ data }: { data: SpotifySearchResult[] }) {
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const tableAlbumsRef = useRef<HTMLTableElement>(null)
  const [tracklistNumTracks, setTracklistNumTracks] = useState<number>(0)
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const columns = React.useMemo(
    () => [
      image,
      albumAndArtist,
      category,
      releaseDate,
      price,
    ], []
  )
  const table = useReactTable({
    columns,
    data,
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
                console.log('!click', row.original.id)
                // TODO otra solucion
                // TODO give it margin        
                // e.currentTarget.scrollIntoView({ behavior: 'smooth' , 
                //   block: 'start', inline: 'start'
                // })
                // Toggle
                setTrackListVisible({ albumId: tracklistVisible.albumId === albumId ? null : albumId })
                // Sets the height for the dropdown
                setTracklistNumTracks(row.original.totalTracks)
                setTracklist(row.original.trackList)
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

                        {/* {Array.from({ length: row.original.totalTracks}).map(() => {
                          return (
                            <div style={{ height: 'var(--trackListRowHeight)'}}>work</div>
                          )
                        })} */}
                        {tracklist && 
                          <TrackTable 
                            data={tracklist} 
                            key={row.original.id} 
                            imageUrl={row.original.image.url} 
                            setAudioUrl={setAudioUrl}
                          />
                        }
                        {/* {tracklist && tracklist.map((trackData) => {
                          console.log('!track', trackData)
                          return (
                            <div style={{ height: 'var(--trackListRowHeight)' }}>
                              {trackData.name}
                            </div>
                          )
                        })} */}
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
