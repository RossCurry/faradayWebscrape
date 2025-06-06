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
  getImage,
  duration,
  trackNumber,
  getCheckbox,
  getPlayButton,
  getSongAndArtist
} from './columns/columns'
import { SpotifySearchResult } from '../../../../types/spotify.types'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks'
import { useIsMobile } from '../../../../hooks/useIsMobile'
import { notNull } from '../../../../utils/notNull'

export type TrackListData = SpotifySearchResult["trackList"][number] & { imageUrl?: string }
export type TrackListColumnData = TrackListData & { isChecked: boolean }
export type TrackTableProps = { data: TrackListData[] } & { 
  albumId?: string,
}
export default function TrackTable({
  data,
  albumId,
}: TrackTableProps) {
  const dispatch = useAppDispatch()
  const isMobile = useIsMobile()
  const tableTracksRef = useRef<HTMLTableElement>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const customPlaylist = useAppState().playlist.custom;
  const { view } = useAppState().rsb;

  const dataWithCheckbox = useMemo(() => data.map(track => {
    return {
      ...track,
      isChecked: !!customPlaylist[track.id]
    }
  }),[data, customPlaylist])

  const areAllTracksSelected = useMemo(() => {
    return dataWithCheckbox.every(track => track.isChecked)
  },[dataWithCheckbox])
  
  const allTracksIds = useMemo(() => {
    return dataWithCheckbox.map(track => track.id)
  },[dataWithCheckbox])


  const columns = React.useMemo(
    () => [
      getPlayButton({ isMobile, view }),
      getImage({ isMobile, view }),
      trackNumber,
      getSongAndArtist({ isMobile }),
      duration,
      getCheckbox({ areAllTracksSelected, allTracksIds, albumId }),
    ].filter(notNull), [areAllTracksSelected, allTracksIds, albumId, isMobile, view]
  )

  const handleOnClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    e.stopPropagation()
    const { target } = e
    const { tagName, checked, value: trackId } = target as HTMLInputElement;
    if (tagName  === 'INPUT'){
      if (checked){
        dispatch({ type: 'addTrackToCustomPlaylist', trackId: trackId })
      } else {
        dispatch({ type: 'deleteTrackFromCustomPlaylist', trackId: trackId })
      }
      // Handle unClicking a selected album if you unselect an option
      // Only do this if we pass the album id.
      // in playlist view we dont have that, currently
      if (!checked && albumId){
        dispatch({ type: 'deleteSelectedAlbum', albumId })
      }
      // Handle unClicking a bulk selection
      if (!checked){
        dispatch({ type: 'setAllAlbumsSelected', areSelected: false })
      }
      return
    }
  }

  const table = useReactTable({
    columns,
    data: dataWithCheckbox,
    // debugTable: true,
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
  handleOnClick: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, track: TrackListData) => void
}
const TrackRowMemoized = React.memo(({
  row,
  handleOnClick
}: TrackRowMemoizedProps) => {
  return (
    <tr 
      key={row.id} 
      className={styles.trackRows} 
      onClick={(e) => handleOnClick(e, row.original)}
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
