import React, { useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import styles from './TrackTable.module.css'
import {
  image,
  // title,
  songAndArtist,
  // artists,
  duration,
  trackNumber,
  // player,
  checkBox
} from './columns/columns'
import { CheckedTrackDict } from '../Albums/AlbumTable'
import { SpotifySearchResult } from '../../../../types/spotify.types'

export type TrackListData = SpotifySearchResult["trackList"][number] & { isChecked: boolean, imageUrl: string }
export type TrackListColumnData = TrackListData
export type TrackTableProps = { data: TrackListData[] } & { 
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>,
  // setCustomPlaylist: React.Dispatch<React.SetStateAction<CheckedTrackDict>>,
  setCustomPlaylistArray: React.Dispatch<React.SetStateAction<string[]>>,
  customPlaylistArray: string[],
}
export default function TrackTable({
  data,
  setAudioUrl,
  // setCustomPlaylist,
  setCustomPlaylistArray,
  customPlaylistArray,
}: TrackTableProps) {
  const tableTracksRef = useRef<HTMLTableElement>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = React.useMemo(
    () => [
      checkBox,
      image,
      trackNumber,
      songAndArtist,
      duration,
    ], []
  )

  const handleOnClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, audioUrl: string) => {
    const { target } = e
    const { tagName, checked, value: trackId } = target as HTMLInputElement;
    if (tagName  === 'INPUT'){
      // setCustomPlaylist(selection => ({
      //   ...selection,
      //   [trackId]: checked
      // }))
      setCustomPlaylistArray(checked ? customPlaylistArray.concat(trackId) : customPlaylistArray.filter(id => id !== trackId))
      return
    }
    setAudioUrl(audioUrl)
  }

  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
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

  return (
    <div className="p-2">
      <div className="h-2" />
      <table
        id='table_tracks'
        className={styles.table_tracks}
        ref={tableTracksRef}
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
            .rows
            .map(row => {
              return (
                <>
                  <tr key={row.id} className={styles.trackRows} onClick={(e) => handleOnClick(e, row.original.preview_url)}>
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
                </>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
