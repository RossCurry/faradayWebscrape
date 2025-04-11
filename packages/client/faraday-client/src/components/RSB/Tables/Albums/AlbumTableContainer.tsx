
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Cell,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  Table,
  useReactTable,
} from '@tanstack/react-table'
// Virtualization
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual'
// Infinite Scroll Query
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import {
  image,
  albumAndArtist,
  category,
  price,
  releaseDate,
  getCheckbox,
  playButton
} from './sections/columns/columns'
import { SpotifySearchResult } from '../../../../types/spotify.types'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks'
import { TrackListData } from '../Tracks/TrackTable'
import styles from './AlbumTableContainer.module.css'
import { BatchResponse, getAlbumsInBatch } from '../../../../services/services'

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

export default function AlbumTableContainer() {
  const dispatch = useAppDispatch()
  const { 
    selectedAlbums, 
    filters, 
    areAllAlbumsSelected 
  } = useAppState().rsb

  console.log('!RENDER AlbumTableContainer -> ');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [parentElementHeight, setParentElementHeight] = useState<number|null>(null)


  // QUERY LOGIC - FETCHES DATA //
  // Virtualization logic - react-query
  const FETCH_SIZE = 30 // batch size
  const {
    data: albumData,
    fetchNextPage,
    isFetching,
    // isLoading,
    hasNextPage
  } = useInfiniteQuery<BatchResponse>({
    queryKey: [
      'albumData',
      // sorting, //refetch when sorting changes
      filters
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = (pageParam as number) * FETCH_SIZE
      const cursor = pageParam as number
      const fetchedData = await getAlbumsInBatch({offset, batchSize: FETCH_SIZE, cursor, filters})
      // update total count
      const totalAlbumCount = fetchedData.meta.totalCount || 0
      dispatch({type: 'setTotalCollectionCount', totalCollectionCount: totalAlbumCount})
      return fetchedData
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages): number | null => {
      if (!lastPage || !lastPage.data.length) return null
      const { nextCursor } = lastPage.meta
      return Number(nextCursor) 
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })
  
  // TODO this is not pretty.
  const albumDataWithCheckbox = useMemo(
    () => {
      const mappedAlbums = albumData?.pages.flatMap(page => page?.data.map(album => ({
        ...album,
        isChecked: areAllAlbumsSelected || !!selectedAlbums[album.id]
      }) as AlbumItemTableData)) || []
      // update albumCollection here to prevent re-renders
      dispatch({type: 'setAlbumCollection', albums: mappedAlbums })
      // If all albums are selected, we need to update the customPlaylist state
      if (areAllAlbumsSelected) {
        dispatch({ type: 'addTracksToCustomPlaylist', trackIds: mappedAlbums.flatMap(album => album.trackList.map(track => track.id)) })
      }
      return mappedAlbums
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [albumData?.pages, selectedAlbums, areAllAlbumsSelected]
  ) 

  // HANDLERS //
  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = React.useCallback((scrollEvent: React.UIEvent<HTMLDivElement, UIEvent>) => {
  const { scrollHeight, scrollTop, clientHeight } = scrollEvent.currentTarget

  // Virtualizer Logic
  const isCloseToEndOfViewport = scrollHeight - scrollTop - clientHeight < 500
  const totalDBRowCount = albumData?.pages.at(0)?.meta.totalCount
  const totalFetched = albumData?.pages.at(0)?.meta.totalFetched
  if (
    !isFetching && 
    hasNextPage && 
    !!totalFetched && 
    totalDBRowCount &&  
    totalFetched < totalDBRowCount &&
    isCloseToEndOfViewport
  ){
    fetchNextPage()
  }
}, [fetchNextPage, isFetching, hasNextPage, albumData?.pages])

  // Get parent Height on mount
  useEffect(() => {
    if(tableContainerRef.current){
      const div = tableContainerRef.current
      const parentElement = div.parentElement
      const parentElHeight = parentElement?.getBoundingClientRect().height
      if (parentElHeight) {
        setParentElementHeight(parentElHeight)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentElementHeight])

  // ResizeObserver
  useEffect(() => {
    const tableRef = tableContainerRef.current
    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries;
      const parentElement = entry.target.parentElement;
      const newParentElHeight = parentElement?.getBoundingClientRect().height;
      if (newParentElHeight) setParentElementHeight(newParentElHeight);
    });

    if (tableRef) resizeObserver.observe(tableRef);
    
    return () => {
      if (tableRef) resizeObserver.unobserve(tableRef);
    };
  },[])

  
  return (
    <>
    <div
      id='albumTableContainer'
      // <<<< || VIRTUALIZER PROPERTIES || >>>> //
      ref={tableContainerRef}
      style={{
        //our scrollable table container
        overflowY: 'scroll',
        overflowX: 'hidden',
        position: 'relative',
        // We must have a fixed height
        height: `${parentElementHeight}px`,
        
      }}
      // <<<< || QUERY INFINITE SCROLL || >>>> //
      onScroll={fetchMoreOnBottomReached}
    >
      <VirtualizedTable 
        data={albumDataWithCheckbox} 
        scrollableContainerRef={tableContainerRef} 
      />
    </div>
    </>
  )
}


function VirtualizedTable({ data, scrollableContainerRef }: { data: AlbumItemTableData[], scrollableContainerRef: React.RefObject<HTMLDivElement> }) {
  console.log('!RENDER  VirtualizedTable-> ' );
  
  const appDispatch = useAppDispatch()
  const { areAllAlbumsSelected } = useAppState().rsb

  const tableAlbumsRef = useRef<HTMLTableElement>(null)
  

  // List of all track ids
  const allTrackIds = useMemo(() => {
      return data.reduce((tracks, album) => {
        const trackIds = album.trackList.map(track => track.id)
        return tracks.concat(trackIds)
      },[] as string[])
    }, [data])


  // Callback for Header Checkbox
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
  
  // Callback for album row Checkbox
  const handleSelectCheckbox = useCallback((trackList: TrackListData[], isChecked: boolean, albumId: string) => {
      // controls input components for rows
      if (isChecked) {
        appDispatch({ type: 'addSelectedAlbum', albumId })
        appDispatch({ type: 'addTracksToCustomPlaylist', trackIds: trackList.map(t => t.id) })
      } else {
        appDispatch({ type: 'deleteSelectedAlbum', albumId })
        appDispatch({ type: 'deleteTracksFromCustomPlaylist', trackIds: trackList.map(t => t.id) })
      }
      
      // handle deselect bulk selection
      if (!isChecked) appDispatch({ type: 'setAllAlbumsSelected', areSelected: false })
      
        // We dont want appDispatch to be in the dependency array
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


  const columns = React.useMemo(
    () => [
      getCheckbox({ areAllAlbumsSelected, handleSelectAll, handleSelectCheckbox }),
      image,
      playButton,
      albumAndArtist,
      category,
      releaseDate,
      price,
    ], [areAllAlbumsSelected, handleSelectAll, handleSelectCheckbox]
  )

  // TABLE LOGIC //
  const table = useReactTable<AlbumItemTableData>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    enableColumnResizing: true, // Allow user resizing (optional)
  })

  
  return (
    <table
    id='table_albums'
    style={{ display: 'grid'}}
    ref={tableAlbumsRef}
    className={styles.table_albums}
  >
    <TableHeader table={table} />
    <TableBody 
      table={table} 
      scrollableContainerRef={scrollableContainerRef}
    />
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
        left: 0,
        padding: 0,
        zIndex: 1,
        // backgroundColor: '#324658'
      }}
      className={styles.tableHeader}
    >
      {table.getHeaderGroups().map(headerGroup => (
        <tr 
          key={headerGroup.id} 
          style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}
        >
          {headerGroup.headers.map(header => {
            return (
              <th 
                key={header.id} 
                colSpan={header.colSpan} 
                style={{
                  display: 'flex',
                  width: `${header.getSize()}px`,
                }}
                className={styles.albumTableHeader}
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
function TableBody ({ 
  table, 
  scrollableContainerRef,
}: { 
  table: Table<AlbumItemTableData>, 
  scrollableContainerRef: React.RefObject<HTMLDivElement> 
}){
  const { scrollToTop, shouldScroll } = useAppState().rsb
  console.log('!RENDER TableBody  shouldScroll-> ', scrollToTop, shouldScroll);

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
    overscan: 10,
    gap: 8,
    initialOffset: scrollToTop
  })

  // TODO the scroll on mount has stopped working. I think due to so many rerenders
  // onMount ScrollTo Last selected row
  // if (shouldScroll){
  //   rowVirtualizer.scrollToIndex(scrollToTop + 1 , { behavior: 'auto', align: 'center' })
  //   dispatch({ type: 'setShouldScroll', shouldScroll: false })
  // }

  useEffect(() => {
    rowVirtualizer.scrollToIndex(scrollToTop + 1 , { behavior: 'auto', align: 'center' })
  }, [])


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
              <TableBodyRow 
                key={row.id}
                row={row} 
                rowVirtualizer={rowVirtualizer} 
                virtualRow={virtualRow}
              />
            )
          })
      }
    </tbody>
  )
}


/**
  * 
  * Each row is actually going to be 2 rows
  * 1. the tanStack data row (album)
  * 2. the track info for the album
  */
function TableBodyRow({ 
  row, 
  rowVirtualizer, 
  virtualRow,
}: { 
  row: Row<AlbumItemTableData>, 
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>, 
  virtualRow: VirtualItem 
}) {
  // TrackTable Logic
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  
  const dispatch = useAppDispatch()
  const albumId = row.original.id
  const isSelected = tracklistVisible.albumId === albumId;
  
  const handleOpenTrackList = (e: React.MouseEvent<HTMLTableCellElement | HTMLTableRowElement, MouseEvent>) => {
    const isCheckbox = 'id' in e.target && typeof e.target.id === 'string' && e.target.id.startsWith('album-checkbox-id')
    e.stopPropagation()
    if (isCheckbox) return

    // Mapping imageUrl here but not isSelected so to re-render on selection
    const mappedTracklist = row.original.trackList.map(track => ({ 
      ...track, 
      imageUrl: row.original.image.url,
    }) as TrackListData)

    dispatch({
      type: 'setOpenAlbumInfo', 
      openAlbumInfo: {
        albumId: isSelected ? null : albumId,
        trackList: mappedTracklist,
        albumInfo: isSelected ? null : row.original,
      }
    })

    dispatch({ type: 'updateView', view: 'albumDetail', playlistId: null })
    setTrackListVisible({ albumId: isSelected ? null : albumId })
    
    // Record ScrollTop
    console.log('!setScrollToTop -> ', row.index);
    dispatch({ type: 'setScrollToTop', scrollToTop: row.index })
    dispatch({ type: 'setShouldScroll', shouldScroll: true })
  }

   // TODO also should be true if any track of the album is selected
   const isAddedToPlaylist = row.original.isChecked
  return (
    <>
      <tr
        key={'virtualrow' + row.id} 
        // <<<< || VIRTUALIZER PROPERTIES || >>>> //
        data-index={virtualRow.index} //needed for dynamic row height measurement
        ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
        style={{
          display: 'flex',
          position: 'absolute',
          transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
          width: '100%',
          justifyContent: 'space-between',
        }}
        className={`
          ${styles.albumRows}
          ${isSelected ? styles.albumRowsSelected : ''}
          ${isAddedToPlaylist ? styles.albumRowsAddedToPlaylist : ''}
          `
        }
        onClick={handleOpenTrackList}
      >
        {row.getVisibleCells().map(cell => {
          return (
            <TableCell cell={cell} key={cell.id} />
          )
        })}
      </tr>
    </>
  )
}

function TableCell({ cell }: { cell: Cell<AlbumItemTableData, unknown> }) {
  return (
    <td
      key={cell.id}
      style={{
        display: 'flex',
        width: cell.column.getSize(),
        justifyContent: 'center'
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}
