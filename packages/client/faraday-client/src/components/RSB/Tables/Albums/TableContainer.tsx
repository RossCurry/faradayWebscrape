
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  Table,
  useReactTable,
} from '@tanstack/react-table'
// Virtualization
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import {
  image,
  albumAndArtist,
  category,
  price,
  releaseDate} from './sections/columns/columns'
import { SpotifySearchResult } from '../../../../types/spotify.types'
import { useAppState } from '../../../../state/AppStateHooks'

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

export default function AlbumTableContainer({ data }: { data: SpotifySearchResult[] }) {
  const { selectedAlbums } = useAppState().rsb

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([])
  const [parentElementHeight, setParentElementHeight] = useState<number>(800)

  const dataWithCheckbox = useMemo(() => data.map(album => {
    return {
      ...album,
      isChecked: !!selectedAlbums[album.id]
    }
  }), [selectedAlbums, data])


  useEffect(() => {
    if(tableContainerRef.current){
      const div = tableContainerRef.current
      const parentElement = div.parentElement?.parentElement
      const parentElHeight = parentElement?.getBoundingClientRect().height
      if (parentElHeight) setParentElementHeight(parentElHeight)
    }
  }, [parentElementHeight])


  return (
    <div
      // <<<< || VIRTUALIZER PROPERTIES || >>>> //
      ref={tableContainerRef}
      style={{
        //our scrollable table container
        overflow: 'auto',
        position: 'relative',
        // We must have a fixed height
        height: `${parentElementHeight}px`,
      }}
    >
      <VirtualizedTable data={dataWithCheckbox} scrollableContainerRef={tableContainerRef} />
    </div>
  )
}


function VirtualizedTable({ data, scrollableContainerRef }: { data: AlbumItemTableData[], scrollableContainerRef: React.RefObject<HTMLDivElement> }) {
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
  const table = useReactTable<AlbumItemTableData>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
  })

  return (
    <table
    id='table_albums'
    style={{ display: 'grid'}}
  >
    <TableHeader table={table} />
    <TableBody table={table} scrollableContainerRef={scrollableContainerRef}/>
  </table>
  )
}

function TableHeader({ table }: { table: Table<AlbumItemTableData> }) {
  return (
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
  )
}

/**
 * The body contains the Virtualization logic
 * Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
 */
function TableBody ({ table, scrollableContainerRef }: { table: Table<AlbumItemTableData>, scrollableContainerRef: React.RefObject<HTMLDivElement> }){
  // VIRTUALIZER LOGIC //
  // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 96, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => scrollableContainerRef.current, //scrollable container
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
        navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })
  return (
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
              <TableBodyRow row={row} rowVirtualizer={rowVirtualizer} virtualRow={virtualRow} key={row.id}/>
            )
          })
      }
    </tbody>
  )
}

function TableBodyRow({ row, rowVirtualizer, virtualRow }: { row: Row<AlbumItemTableData>, rowVirtualizer: Virtualizer<HTMLDivElement, Element>, virtualRow: VirtualItem }) {
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
}