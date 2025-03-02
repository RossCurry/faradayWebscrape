
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Cell,
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
// Infinite Scroll Query
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import {
  image,
  albumAndArtist,
  category,
  price,
  releaseDate,
  getCheckbox
} from './sections/columns/columns'
import { SpotifySearchResult } from '../../../../types/spotify.types'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks'
import TrackTable, { TrackListData } from '../Tracks/TrackTable'
import styles from './AlbumTableContainer.module.css'
import IconButton from '../../../Shared/IconButton/IconButton'
import { ArrowBackIcon } from '../../../../icons'
import { msToTime } from '../../../../utils/msToTime'
import { BatchResponse, getAlbumsInBatch } from '../../../../services'

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

export default function AlbumTableContainer({ data }: { data: SpotifySearchResult[] }) {
  
  const { selectedAlbums, openAlbumInfo, showTrackTableOverlay } = useAppState().rsb
  const { trackList, albumId } = openAlbumInfo

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [parentElementHeight, setParentElementHeight] = useState<number|null>(null)
  const canShowTrackTable = !!albumId && !!trackList?.length

  // const dataWithCheckbox = useMemo(() => data.map(album => {
  //   return {
  //     ...album,
  //     isChecked: !!selectedAlbums[album.id]
  //   }
  // }), [selectedAlbums, data])

  // QUERY LOGIC - FETCHES DATA //
  // Virtualization logic - react-query
  const FETCH_SIZE = 30 // batch size
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
      const offset = (pageParam as number) * FETCH_SIZE
      const cursor = pageParam as number
      const fetchedData = await getAlbumsInBatch(offset, FETCH_SIZE, cursor)
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
    () => albumData?.pages.flatMap(page => page?.data.map(album => ({
      ...album,
      isChecked: !!selectedAlbums[album.id]
    }) as AlbumItemTableData)), [albumData?.pages, selectedAlbums]
  ) || []

// HANDLERS //
//called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
const fetchMoreOnBottomReached = React.useCallback((scrollEvent: React.UIEvent<HTMLDivElement, UIEvent>) => {
  const { scrollHeight, scrollTop, clientHeight } = scrollEvent.currentTarget
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
  })
  
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
      {!showTrackTableOverlay && 
        <VirtualizedTable 
          data={albumDataWithCheckbox} 
          scrollableContainerRef={tableContainerRef} 
        />
      }
      {canShowTrackTable && 
        <TrackTableOverlay
          parentElementHeight={parentElementHeight || 0}
        />
      }
    </div>
    </>
  )
}


function VirtualizedTable({ data, scrollableContainerRef }: { data: AlbumItemTableData[], scrollableContainerRef: React.RefObject<HTMLDivElement> }) {
  const appDispatch = useAppDispatch()
  const { areAllAlbumsSelected } = useAppState().rsb

  const tableAlbumsRef = useRef<HTMLTableElement>(null)
  const selectedAlbumRowRef = useRef<HTMLTableElement>(null)
  const [tracklistNumTracks, setTracklistNumTracks] = useState<number>(0)
  

  // List of all track ids
  const allTrackIds = useMemo(() => {
      return data.reduce((tracks, album) => {
        const trackIds = album.trackList.map(track => track.id)
        return tracks.concat(trackIds)
      },[] as string[])
    }, [data])

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

  // TODO not sure we need this
  // We can use this refs .current in the context when we select a row.
  useEffect(() => {
    appDispatch({ type: 'setSelectedAlbumRowRef', selectedAlbumRowRef })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
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
      tracklistNumTracks={tracklistNumTracks}
      setTracklistNumTracks={setTracklistNumTracks}
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
  tracklistNumTracks,
  setTracklistNumTracks,
}: { 
  table: Table<AlbumItemTableData>, 
  scrollableContainerRef: React.RefObject<HTMLDivElement> 
  tracklistNumTracks: number
  setTracklistNumTracks: React.Dispatch<React.SetStateAction<number>>
}){


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
              <TableBodyRow 
                key={row.id}
                row={row} 
                rowVirtualizer={rowVirtualizer} 
                virtualRow={virtualRow}
                setTracklistNumTracks={setTracklistNumTracks}
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
  setTracklistNumTracks,
}: { 
  row: Row<AlbumItemTableData>, 
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>, 
    virtualRow: VirtualItem 
    setTracklistNumTracks: React.Dispatch<React.SetStateAction<number>>,
}) {
  const { selectedAlbumRowRef } = useAppState().rsb
  // TrackTable Logic
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)
  
  const dispatch = useAppDispatch()
  const albumId = row.original.id
  const isSelected = tracklistVisible.albumId === albumId;
  
  // TODO clean up the logic here
  const handleOpenTrackList = (e: React.MouseEvent<HTMLTableCellElement | HTMLTableRowElement, MouseEvent>) => {
    console.log('!handleOpenTrackList -> ', { albumId, isSelected, target: e.target });
    const isCheckbox = 'id' in e.target && typeof e.target.id === 'string' && e.target.id.startsWith('album-checkbox-id')
    e.stopPropagation()
    if (isCheckbox) return

    // Mapping imageUrl here but not isSelected so to re-render on selection
    const mappedTracklist = row.original.trackList.map(track => ({ 
      ...track, 
      imageUrl: row.original.image.url,
    }) as TrackListData)
    setTracklist(mappedTracklist)
    dispatch({
      type: 'setOpenAlbumInfo', openAlbumInfo: {
        albumId: isSelected ? null : albumId,
        trackList: mappedTracklist,
        albumInfo: isSelected ? null : row.original,
      }
    })
    dispatch({ type: 'setShowTrackTableOverlay', showTrackTableOverlay: true })

    // TODO setTrackList in the state
    // // Sets the height for the dropdown
    // setTracklistNumTracks(row.original.totalTracks)
    // Toggle
    setTrackListVisible({ albumId: isSelected ? null : albumId })
    // // Scroll into view
    // if (!isSelected) {
    //   e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    // }
    // TODO why did I habe this?
    // selectedAlbumRowRef.current = e.target
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
            <TableCell cell={cell} key={cell.id} handleOpenTrackList={handleOpenTrackList} />
          )
        })}
      </tr>
    </>
  )
}

function TableCell({ cell, handleOpenTrackList }: { cell: Cell<AlbumItemTableData, unknown>, handleOpenTrackList: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void }) {
  return (
    <td
      key={cell.id}
      style={{
        display: 'flex',
        width: cell.column.getSize(),
        justifyContent: 'center'
      }}
      // onClick={
      //   !cell.id.includes('checkbox')
      //     ? handleOpenTrackList
      //     : (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => { e.stopPropagation() }
      // }
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}


function TrackTableOverlay({ 
  parentElementHeight, 
}: { 
  parentElementHeight: number, 
}) {
  const { showTrackTableOverlay, openAlbumInfo } = useAppState().rsb
  const { albumInfo, trackList, albumId } = openAlbumInfo
  const dispatch = useAppDispatch()
  const imageUrl = trackList?.at(0)?.imageUrl
  const { hours, minutes, seconds } = useMemo(() => {
    const totalDurationMs = trackList?.reduce((duration, info) => info.duration_ms + duration, 0)
    return msToTime(totalDurationMs || 0)
  }, [trackList])
  const durationString = `${hours > 0 ? `${hours}h` : ''} ${minutes}m ${seconds}s`
  const handleCloseOverlay = () => {
    dispatch({ 
      type: 'setShowTrackTableOverlay', 
      showTrackTableOverlay: false 
    })
  }
  const renderTrackList = !!albumId && !!trackList && trackList?.length > 0
  return (
    <section
    id='trackTableContainerAlbumView'
    className={`
      ${styles.trackTableContainer}
      ${showTrackTableOverlay ? styles.isOpen : styles.isClosed}
      `}
      style={{
        height: `${parentElementHeight}px`,
      }}
      >
      <header
        className={styles.trackTableHeader}
      >
        <IconButton
          handleOnClick={handleCloseOverlay}
          Icon={ArrowBackIcon}
          text={''}
          className={styles.closeOverlayButton}
        />
        <div
          className={styles.trackTableHeaderImg}
          style={{
              backgroundImage: `url(${imageUrl})`
            }}
        />
        <div
          className={styles.trackTableHeaderAlbumInfo}
        >
          <h2>{albumInfo?.name}</h2>
          <h3>{albumInfo?.artists.join(', ')}</h3>
        </div>
        <div
          className={styles.trackTableHeaderAlbumStats}
        >
          <p>{trackList?.length} track{trackList?.length === 1 ? '' : 's'}</p>
          <p>{durationString}</p>
        </div>
      </header>
      {renderTrackList && 
        <TrackTable
          data={trackList}
          // deselect the album selection if selected
          albumId={albumId}
        />
      }
    </section>
  )
}