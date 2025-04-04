
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
  getCheckbox,
  playButton
} from './sections/columns/columns'
import { SpotifySearchResult } from '../../../../types/spotify.types'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks'
import TrackTable, { TrackListData } from '../Tracks/TrackTable'
import styles from './AlbumTableContainer.module.css'
import IconButton from '../../../Shared/IconButton/IconButton'
import { ArrowBackIcon, ShoppingCartIcon } from '../../../../icons'
import { msToTimeDivision } from '../../../../utils/msToTime'
import { BatchResponse, getAlbumsInBatch } from '../../../../services/services'
import { SpotifyGreenLogo } from '../../../../logos'
import Tooltip from '../../../Shared/Tooltip/Tooltip'

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

export default function AlbumTableContainer({ data }: { data: SpotifySearchResult[] }) {
  const dispatch = useAppDispatch()
  const { selectedAlbums, openAlbumInfo, showTrackTableOverlay, filters } = useAppState().rsb
  const { trackList, albumId } = openAlbumInfo

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [parentElementHeight, setParentElementHeight] = useState<number|null>(null)
  const canShowTrackTable = !!albumId && !!trackList?.length


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
      filters
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = (pageParam as number) * FETCH_SIZE
      const cursor = pageParam as number
      const fetchedData = await getAlbumsInBatch({offset, batchSize: FETCH_SIZE, cursor, filters})
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
  })

  // Calculate total album count from meta data
  const totalAlbumCount = useMemo(() => {
    const totalAlbumCount = albumData?.pages.flatMap(page => page?.meta.totalCount)[0] || 0
    return totalAlbumCount
  }, [albumData?.pages])

  // Set total album count
  useEffect(()=>{
    dispatch({type: 'setTotalCollectionCount', totalCollectionCount: totalAlbumCount})
  }, [totalAlbumCount])
  
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
}: { 
  table: Table<AlbumItemTableData>, 
  scrollableContainerRef: React.RefObject<HTMLDivElement> 
  setTracklistNumTracks: React.Dispatch<React.SetStateAction<number>>
}){
  const { scrollToTop } = useAppState().rsb

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
    // gap: 24,

  })

  // ScrollTo Last selected row
  useEffect(() => {
    console.log('Call scroll useEffect ROW')
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
  const { selectedAlbumRowRef } = useAppState().rsb
  // TrackTable Logic
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)
  
  const dispatch = useAppDispatch()
  const albumId = row.original.id
  const isSelected = tracklistVisible.albumId === albumId;
  
  // TODO clean up the logic here
  const handleOpenTrackList = (e: React.MouseEvent<HTMLTableCellElement | HTMLTableRowElement, MouseEvent>) => {
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
    setTrackListVisible({ albumId: isSelected ? null : albumId })
    
    // Record ScrollTop
    console.log('!row.index -> ', row.index);
    dispatch({ type: 'setScrollToTop', scrollToTop: row.index })
    // TODO MEASURE THE SCROLL HEIGHT HERE
    // TODO setTrackList in the state
    // // Sets the height for the dropdown
    // setTracklistNumTracks(row.original.totalTracks)
    // Toggle
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

/**
 * Container for the tracklist view
 * @param param0 
 * @returns 
 */
function TrackTableOverlay({ 
  parentElementHeight, 
}: { 
  parentElementHeight: number, 
}) {
  const dispatch = useAppDispatch()
  const { showTrackTableOverlay, openAlbumInfo } = useAppState().rsb
  const { albumInfo, trackList, albumId } = openAlbumInfo
  const imageUrl = trackList?.at(0)?.imageUrl
  const { hours, minutes, seconds } = useMemo(() => {
    const totalDurationMs = trackList?.reduce((duration, info) => info.duration_ms + duration, 0)
    return msToTimeDivision(totalDurationMs || 0)
  }, [trackList])
  const durationString = `${hours > 0 ? `${hours}h` : ''} ${minutes}m ${seconds}s`
  const albumLink = albumId && `https://open.spotify.com/album/${albumId}`

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

        <Links albumLink={albumLink} faradayLink={albumInfo?.link} />
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


function Links({ 
  albumLink, 
  faradayLink 
}: { 
  albumLink: string | null,
  faradayLink?: string,
}){
  return (
    <span
      className={styles.trackTableHeaderLinks}
    >
    {faradayLink && 
    <a 
      href={faradayLink} 
      target='_blank'
    >
      <Tooltip
        Component={<ShoppingCartIcon width={28} height={28} />}
        tooltipText='Buy on Faraday'
      />
      {/* <Tooltip
        Component={<FaradayLogo className={styles.faradayLinkLogo} />}
        tooltipText='Buy on Faraday'
      /> */}
    </a>
    }
    {albumLink && 
      <a 
        href={albumLink} 
        target='_blank'
      >
        <Tooltip
          Component={<SpotifyGreenLogo width={28} height={28} />}
          tooltipText='Listen on Spotify'
        />
      </a>
      }
    </span>
  )
}