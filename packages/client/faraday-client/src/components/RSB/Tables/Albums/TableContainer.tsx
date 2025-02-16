
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

export type CheckedAlbumDict = {
  [K in SpotifySearchResult['id']]: boolean
}
export type CheckedTrackDict = {
  [K in SpotifySearchResult['trackList'][number]['id']]: boolean
}
export type AlbumItemTableData = SpotifySearchResult & { isChecked: boolean }

export default function AlbumTableContainer({ data }: { data: SpotifySearchResult[] }) {
  
  const dispatch = useAppDispatch()
  const { selectedAlbums, openAlbumInfo } = useAppState().rsb

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [parentElementHeight, setParentElementHeight] = useState<number|null>(null)

  const { trackList, albumId } = openAlbumInfo
  const showTrackTable = !!albumId && trackList?.length

  const dataWithCheckbox = useMemo(() => data.map(album => {
    return {
      ...album,
      isChecked: !!selectedAlbums[album.id]
    }
  }), [selectedAlbums, data])




  useEffect(() => {
    if(tableContainerRef.current){
      const div = tableContainerRef.current
      const parentElement = div.parentElement
      console.log('!parentElement -> ', parentElement);
      const parentElHeight = parentElement?.getBoundingClientRect().height
      if (parentElHeight) {
        console.log('!useEffect parentElHeight -> ', parentElHeight);
        setParentElementHeight(parentElHeight)
        // dispatch({
        //   type: 'setTableContainerHeight',
        //   tableContainerHeight: parentElHeight
        // })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentElementHeight])

  
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
    >
      {!showTrackTable && <VirtualizedTable data={dataWithCheckbox} scrollableContainerRef={tableContainerRef} />}
      <section
        id='trackTableContainer'
        className={`
          ${styles.trackTableContainer}
          ${showTrackTable ? styles.isOpen : styles.isClosed}
        `}
        style={{
          height: `${parentElementHeight}px`,
        }}
      >
        {showTrackTable && 
          <TrackTable
            data={trackList}
            // deselect the album selection if selected
            albumId={albumId}
          />
        }
      </section>
    </div>
    </>
  )
}


function VirtualizedTable({ data, scrollableContainerRef }: { data: AlbumItemTableData[], scrollableContainerRef: React.RefObject<HTMLDivElement> }) {
  const appDispatch = useAppDispatch()
  const { areAllAlbumsSelected } = useAppState().rsb

  const tableAlbumsRef = useRef<HTMLTableElement>(null)
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

  // TABLE LOGIC //
  const table = useReactTable<AlbumItemTableData>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
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
  // TrackTable Logic
  const [tracklistVisible, setTrackListVisible] = useState<{ albumId: string | null }>({ albumId: null })
  const [tracklist, setTracklist] = useState<TrackListData[] | null>(null)

  const dispatch = useAppDispatch()
  const albumId = row.original.id
  const isSelected = tracklistVisible.albumId === albumId;
  
  const handleOpenTrackList = (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => {
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
      }
    })

    // TODO setTrackList in the state
    // Sets the height for the dropdown
    setTracklistNumTracks(row.original.totalTracks)
    // Toggle
    setTrackListVisible({ albumId: isSelected ? null : albumId })
    // Scroll into view
    if (!isSelected) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
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
        }}
        className={`
          ${styles.albumRows}
          ${isSelected ? styles.albumRowsSelected : ''}
          ${isAddedToPlaylist ? styles.albumRowsAddedToPlaylist : ''}
          `
        }
      >
        {row.getVisibleCells().map(cell => {
          return (
            <TableCell cell={cell} key={cell.id} handleOpenTrackList={handleOpenTrackList} />
          )
        })}
      </tr>
      {/* <AlbumTrackListRow
        tracklist={tracklist}
        albumId={albumId}
        tracklistVisible={tracklistVisible}
        row={row}
      /> */}
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
      }}
      onClick={
        !cell.id.includes('checkbox')
          ? handleOpenTrackList
          : (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => { e.stopPropagation() }
      }
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}

type AlbumTrackListRowProps = {
  albumId: string,
  row: Row<AlbumItemTableData>,
  tracklist: TrackListData[] | null,
  tracklistVisible: { albumId: string | null },
}
const AlbumTrackListRow = React.memo(({
  albumId,
  // row,
  tracklist,
  tracklistVisible,
}: AlbumTrackListRowProps) => {

  return (
    <tr
      // style={{display: 'contents'}}
      className={styles.albumTrackList}
    >
      <td
        colSpan={6}
        // colSpan={row.getVisibleCells().length}
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
            // key={row.original.id}
            key={albumId}
              // deselect the album selection if selected
              albumId={albumId}
            />
          }
        </div>
      </td>
    </tr>
  )
})