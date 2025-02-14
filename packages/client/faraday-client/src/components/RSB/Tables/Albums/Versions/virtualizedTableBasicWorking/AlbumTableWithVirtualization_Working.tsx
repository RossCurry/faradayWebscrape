
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
// Virtualization
import {
  keepPreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import styles from './V_AlbumTable.module.css'
import {
  image,
  albumAndArtist,
  category,
  price,
  releaseDate,
  getCheckbox
} from '../../sections/columns/columns'
import TrackTable, { TrackListData } from '../../../Tracks/TrackTable'
import { SpotifySearchResult } from '../../../../../../types/spotify.types'
import { useAppDispatch, useAppState } from '../../../../../../state/AppStateHooks'
import { BatchResponse, getAlbumsInBatch } from '../../../../../../services'

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

export default function AlbumTable({ data }: { data: SpotifySearchResult[] }) {
  const { selectedAlbums } = useAppState().rsb

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([])

  const dataWithCheckbox = useMemo(() => data.map(album => {
    return {
      ...album,
      isChecked: !!selectedAlbums[album.id]
    }
  }), [selectedAlbums, data])

  const columns = React.useMemo(
    () => [
      image,
      albumAndArtist,
      category,
      releaseDate,
      price,
    ], []
  )

  // TABLE LOGIC //
  const table = useReactTable({
    columns,
    data: dataWithCheckbox,
    // debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    state: { sorting },
  })

  // VIRTUALIZER LOGIC //
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 96, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current, //scrollable container
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
        navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })

  return (
    <div
      // <<<< || VIRTUALIZER PROPERTIES || >>>> //
      ref={tableContainerRef}
      style={{
        //our scrollable table container
        overflow: 'auto',
        position: 'relative',
        // They say we must have a fixed height - seems to work without
        height: '600px',
      }}
    >
      <table
        id='table_albums'
        style={{ display: 'grid'}}
      >
        <thead
          style={{
            display: 'grid',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {table.getHeaderGroups().map(headerGroup => (
            <tr 
              key={headerGroup.id} 
              style={{ display: 'flex', width: '100%' }}
            >
              {headerGroup.headers.map(header => {
                return (
                  <th 
                    key={header.id} 
                    colSpan={header.colSpan} 
                    style={{
                      display: 'flex',
                      width: header.getSize(),
                    }}
                  >
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
        <tbody
          // <<<< || VIRTUALIZER PROPERTIES || >>>> //
          style={{
            display: 'grid',
            //tells scrollbar how big the table is
            height: `${rowVirtualizer.getTotalSize()}px`,
            //needed for absolute positioning of rows
            position: 'relative',
          }}
        >
          {
            rowVirtualizer.getVirtualItems().map(
              (virtualRow) => {
                const row = rows[virtualRow.index] as Row<AlbumItemTableData>
                return (
                  <tr
                    data-index={virtualRow.index} //needed for dynamic row height measurement
                    ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
                    key={row.id}
                    style={{
                      display: 'flex',
                      position: 'absolute',
                      transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                      width: '100%',
                    }}
                  >
                    {row.getVisibleCells().map(cell => {
                      return (
                        <td
                          key={cell.id}
                          style={{
                            display: 'flex',
                            width: cell.column.getSize(),
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
          }
        </tbody>
      </table>
    </div>
  )
}
