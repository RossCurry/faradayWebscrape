import React, { useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import styles from './TrackTable.module.css'
import {
  image,
  songAndArtist,
  duration,
  trackNumber,
  checkBox
} from './columns/columns'
import { CheckedAlbumDict, CheckedTrackDict } from '../Albums/AlbumTable'
import { SpotifySearchResult } from '../../../../types/spotify.types'

export type TrackListData = SpotifySearchResult["trackList"][number] & { imageUrl: string }
export type TrackListColumnData = TrackListData & { isChecked: boolean }
export type TrackTableProps = { data: TrackListData[] } & { 
  setAudioUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setCustomPlaylist: React.Dispatch<React.SetStateAction<CheckedTrackDict>>,
  customPlaylist: CheckedTrackDict,
  albumId: string,
  setCustomPlaylistAlbumSelection: React.Dispatch<React.SetStateAction<CheckedAlbumDict>>,
}
export default function TrackTable({
  data,
  setAudioUrl,
  customPlaylist,
  setCustomPlaylist,
  albumId,
  setCustomPlaylistAlbumSelection,
}: TrackTableProps) {
  const tableTracksRef = useRef<HTMLTableElement>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const dataWithCheckbox = useMemo(() => data.map(track => {
    return {
      ...track,
      isChecked: !!customPlaylist[track.id]
    }
  }),[data, customPlaylist])

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
    e.stopPropagation()
    const { target } = e
    const { tagName, checked, value: trackId } = target as HTMLInputElement;
    if (tagName  === 'INPUT'){
      setCustomPlaylist(selection => {
        if (checked){
          return {
            ...selection,
            [trackId]: checked
          }
        } 
        const copy = { ...selection }
        delete copy[trackId]
        return copy
      })
      // Handle unClicking a selected album if you unselect an option
      if (!checked){
        setCustomPlaylistAlbumSelection(selection => {
          const copy = { ...selection }
          delete copy[albumId]
          return copy
        })
      }
      return
    }
    setAudioUrl(audioUrl)
  }

  const table = useReactTable({
    columns,
    data: dataWithCheckbox,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    state: { sorting },
  })

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
                <TrackRowMemoized 
                  key={row.id + row.original.id}
                  row={row}
                  handleOnClick={handleOnClick}
                />
              )
            })}
        </tbody>
      </table>
    </div>
  )
}

type TrackRowMemoizedProps = {
  row: Row<TrackListColumnData>
  handleOnClick: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, audioUrl: string) => void
}
const TrackRowMemoized = React.memo(({
  row,
  handleOnClick
}: TrackRowMemoizedProps) => {
  return (
    <tr 
      key={row.id} 
      className={styles.trackRows} 
      onClick={(e) => handleOnClick(e, row.original.preview_url)}
    >
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
})
