/**
 * Columnas
 * Artista, album title, disponible, genero, precio
 */

import React from 'react'
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

export default function Table({ data }: { data: SpotifySearchResult[] }) {
  console.log('!data', data)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const columns = React.useMemo<ColumnDef<SpotifySearchResult>[]>(
    () => [
      {
        accessorFn: row => row.image.url,
        id: 'image',
        cell: info => {
          return (
            <div
              className={styles.rowDataImg}
              style={{
                backgroundImage: `url(${info.getValue()})`
              }}
            />
          )
        },
        header: () => <span>Img</span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      },
      {
        accessorFn: row => row,
        id: 'albumInfo',
        cell: info => {
          console.log('!info.getValue()', info.getValue())
          const { name, artists } = info.getValue() as SpotifySearchResult
          const artist = artists.join(', ')
          const album = name
          return (
            <div className={styles.rowDataAlbum}>
              <p>{album}</p>
              <p>{artist}</p>
            </div>
          )
        },
        header: () => <span>Album</span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      },
      // {
      //   accessorFn: row => row.name,
      //   id: 'album',
      //   cell: info => <span className={styles.rowDataAlbum}>{info.getValue() as string}</span>,
      //   header: () => <span>Album</span>,
      //   sortUndefined: 'last', //force undefined values to the end
      //   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      // },
      // {
      //   accessorFn: row => row.artists,
      //   id: 'artists',
      //   cell: info => <span className={styles.rowDataArtist}>{info.getValue() as string}</span>,
      //   header: () => <span>Artist</span>,
      //   sortUndefined: 'last', //force undefined values to the end
      //   sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      // },
      {
        accessorFn: row => row.isSoldOut,
        id: 'isSoldOut',
        cell: info => {
          const isSoldOut = !!info.getValue()
          return (
            <span className={`${styles.rowDataAvailability} ${isSoldOut ? styles.unavailable : ''}`}>

            </span>
          )
        },
        header: () => <span>Available</span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      },
      // TODO I need genre data 
      {
        accessorFn: row => row.category,
        id: 'genre',
        cell: info => info.getValue() || 'not specified',
        header: () => <span>Genre</span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      },
      // TODO I need price data
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        accessorFn: row => row.price,
        id: 'price',
        cell: info => info.getValue(),
        header: () => <span>Price</span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      },
    ],
    []
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
                          asc: ' 🔼',
                          desc: ' 🔽',
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
              console.log('row', row.id)
              return (
                <tr key={row.id} className={styles.albumRows}>
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
            })}
        </tbody>
      </table>
    </div>
  )
}
