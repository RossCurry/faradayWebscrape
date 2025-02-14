
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
} from './sections/columns/columns'
import TrackTable, { TrackListData } from '../Tracks/TrackTable'
import { SpotifySearchResult } from '../../../../types/spotify.types'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks'
import { BatchResponse, getAlbumsInBatch } from '../../../../services'

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

  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  // TrackTable Logic
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const tableAlbumsRef = useRef<HTMLTableElement>(null)
  const [tracklistNumTracks, setTracklistNumTracks] = useState<number>(0)
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  
  // const dataWithCheckbox = useMemo(() => data.map(album => {
  //   return {
  //     ...album,
  //     isChecked: !!selectedAlbums[album.id]
  //   }
  // }),[selectedAlbums, data])

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

  const handleSelectCheckbox = useCallback((e: React.ChangeEvent<HTMLInputElement>, trackList: TrackListData[]) => {
    // TODO not working triggering the onClick for open track rows
    e.preventDefault()
    e.stopPropagation()
    const { target } = e;
    const { value: albumId, checked } = (target as HTMLInputElement)
    // controls input components for rows
    if (checked) {
      appDispatch({ type: 'addSelectedAlbum', albumId })
      appDispatch({ type: 'addTracksToCustomPlaylist', trackIds: trackList.map(t => t.id) })
    } else {
      appDispatch({ type: 'deleteSelectedAlbum', albumId })
      appDispatch({ type: 'deleteTracksFromCustomPlaylist', trackIds: trackList.map(t => t.id) })
    }
    // handle deselect bulk selection
    if (!checked) appDispatch({ type: 'setAllAlbumsSelected', areSelected: false })
    // We dont want appDispatch to be in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const columns = React.useMemo(
    () => [
      getCheckbox({ areAllAlbumsSelected, handleSelectAll, handleSelectCheckbox }),
      image,
      albumAndArtist,
      category,
      releaseDate,
      price,
    ], [areAllAlbumsSelected, handleSelectAll, handleSelectCheckbox]
  )

  // Virtualization logic - react-query
  const fetchSize = 30 // batch size
  const {
    data: albumData,
    fetchNextPage,
    isFetching,
    isLoading,
    hasNextPage
  } = useInfiniteQuery<BatchResponse>({
    queryKey: [
      'albumData',
      // sorting, //refetch when sorting changes
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = (pageParam as number) * fetchSize
      const cursor = pageParam as number
      const fetchedData = await getAlbumsInBatch(offset, fetchSize, cursor, sorting)
      return fetchedData
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      if (!lastPage || !lastPage.data.length) return null
      const { nextCursor } = lastPage.meta
      return nextCursor 
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  // TODO this is not pretty.
  const albumDataWithCheckbox = useMemo(
    () => albumData?.pages.flatMap(page => page?.data.map(album => ({
      ...album,
      isChecked: !!selectedAlbums[album.id]
    }))), [albumData?.pages, selectedAlbums]
  )

  console.log('!albumData -> ', albumData);
  console.log('!albumDataWithCheckbox -> ', albumDataWithCheckbox);
  const totalDBRowCount = albumData?.pages.at(0)?.totalCount
  const totalFetched = albumData?.pages.at(0)?.totalFetched


  console.log('!component log,  -> ', { isFetching, hasNextPage });
  // //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  // const fetchMoreOnBottomReached = React.useCallback(
  //   (containerRefElement?: HTMLDivElement | null) => {
  //     console.log('!callback log,  -> ', { isFetching, hasNextPage });
  //     if (containerRefElement) {
  //       const { scrollHeight, scrollTop, clientHeight } = containerRefElement
  //       //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
  //       if (
  //         scrollHeight - scrollTop - clientHeight < 500
  //         && !isFetching
  //         && hasNextPage
  //         // && totalFetched < totalDBRowCount
  //       ) {
  //         console.log('!CALL FETCH NEXT PAGE -> ');
  //         fetchNextPage()
  //       }
  //     }
  //   },
  //   [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  // )

  // TODO use a btn to control this
  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  // React.useEffect(() => {
  //   fetchMoreOnBottomReached(tableAlbumsRef.current)
  //   // fetchMoreOnBottomReached(tableContainerRef.current)
  // }, [fetchMoreOnBottomReached])

  const table = useReactTable({
    columns,
    data: albumDataWithCheckbox || [],
    // debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    state: { sorting },
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 96, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableAlbumsRef.current,
    // getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
        navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
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


  if (isLoading) {
    return <>Loading...</>
  }

  return (
    <div
      ref={tableContainerRef}
    // onScroll={e => fetchMoreOnBottomReached(e.currentTarget)}
    // style={{
    //   overflow: 'auto', //our scrollable table container
    //   // position: 'relative', //needed for sticky header
    //   height: '600px', //should be a fixed height
    // }}
    >
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
                  <th key={header.id} colSpan={header.colSpan} className={styles.albumTableHeader}>
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
          style={{
            display: 'grid',
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
            position: 'relative', //needed for absolute positioning of rows
          }}
        >
          {
            rowVirtualizer.getVirtualItems().map(
              (virtualRow) => {
                const row = rows[virtualRow.index] as Row<AlbumItemTableData>
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
                    virtualRow={virtualRow}
                    rowVirtualizer={rowVirtualizer}
                  />
                )
              })
          }
        </tbody>
      </table>
      <button onClick={() => fetchNextPage()}>NextFetch</button>
    </div>
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
  virtualRow: VirtualItem,
  rowVirtualizer: Virtualizer<HTMLTableElement, Element>
}
const AlbumRowMemoized = React.memo(({
  row,
  setTracklist,
  setTracklistNumTracks,
  setTrackListVisible,
  tracklist,
  tracklistVisible,
  // setIsAllSelected,
  virtualRow,
  rowVirtualizer
}: AlbumRowMemoizedProps) => {
   // Each row is actually going to be 2 rows
  // 1. the tanStack data row (album)
  // 2. the track info for the album

  const albumId = row.original.id
  const isSelected = tracklistVisible.albumId === albumId;

  const handleOpenTrackList = (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => {
    const isCheckbox = 'id' in e.target && typeof e.target.id === 'string' && e.target.id.startsWith('album-checkbox-id')
    e.stopPropagation()
    if (isCheckbox) return

    // Mapping imageUrl here but not isSelected so to re-render on selection
    setTracklist(row.original.trackList.map(track => ({ 
      ...track, 
      imageUrl: row.original.image.url,
    })))
    // Sets the height for the dropdown
    setTracklistNumTracks(row.original.totalTracks)
    // Toggle
    setTrackListVisible({ albumId: isSelected ? null : albumId })
    // Scroll into view
    if (!isSelected) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
  }

  return (
    <div
      data-index={virtualRow.index} //needed for dynamic row height measurement
      ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
        width: '100%',
      }}
    >
      <AlbumCell  
        row={row}
        // handleOnClick={handleOnClick}
        handleOpenTrackList={handleOpenTrackList}
        // handleCheckAlbum={handleCheckAlbum}
        isSelected={isSelected}
        virtualRow={virtualRow}
        rowVirtualizer={rowVirtualizer}
      />
      <AlbumTrackListCell 
        row={row}
        tracklistVisible={tracklistVisible}
        albumId={albumId}
        tracklist={tracklist}
      />
    </div>
  )
})

type AlbumCellProps = {
  row: Row<AlbumItemTableData>,
  handleOpenTrackList: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void,
  isSelected: boolean,
  virtualRow: VirtualItem,
  rowVirtualizer: Virtualizer<HTMLTableElement, Element>
}
const AlbumCell = ({ 
  row,
  handleOpenTrackList,
  isSelected,
  // virtualRow,
  // rowVirtualizer
}: AlbumCellProps) => {
  // TODO also should be true if any track of the album is selected
  const isAddedToPlaylist = row.original.isChecked
  return (
    <tr 
      key={row.id} 
      className={`
        ${styles.albumRows}
        ${isSelected ? styles.albumRowsSelected : ''}
        ${isAddedToPlaylist ? styles.albumRowsAddedToPlaylist : ''}
        `
      }
    >
      {row.getVisibleCells().map(cell => {
        return (
          <td
            key={cell.id}
            onClick={
              !cell.id.includes('checkbox')
                ? handleOpenTrackList
                : (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => { e.stopPropagation() }
            }
            style={{
              display: 'flex',
              width: cell.column.getSize(),
            }}
          >
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