/**
 * Columnas
 * Artista, album title, disponible, genero, precio
 */

import React, { useState } from 'react'
import { SpotifySearchResult } from '../../types/spotify.types'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import styles from './Table.module.css'
import {
  image,
  albumAndArtist,
  category,
  price,
  releaseDate,
} from './sections/columns/columns'

export default function Table({ data }: { data: SpotifySearchResult[] }) {
  console.log('!example data', data[0])
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const [sorting, setSorting] = useState<SortingState>([])
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
  return (
    <div className="p-2">
      <div className="h-2" />
      <table
        id='table_albums'
        className={styles.table_albums}
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
            .rows.slice(0, 10)
            // .rows
            .map(row => {
              // Each row is actually going to be 2 rows
              // 1. the tanStack data row (album)
              // 2. the track info for the album

              const albumId = row.original.id
              const handleOnClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
                console.log('!click', row.original.id)
                // Toggle
                setTrackListVisible({ albumId: tracklistVisible.albumId === albumId ? null : albumId })
                // Scroll to view
                // TODO give it margin
                // e.currentTarget.scrollIntoView({ behavior: 'smooth'})
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
                    ${styles.albumTrackList} 
                    ${tracklistVisible.albumId === albumId ? styles.albumTrackListOpen : ''} 
                  `}>
                    <td colSpan={row.getVisibleCells().length} >hello</td>
                  </tr>
                </>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
