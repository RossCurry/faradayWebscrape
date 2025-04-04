import { useAppDispatch, useAppState } from "../../../../state/AppStateHooks"
import Footer from "../../Footer"
import AlbumTableContainer from "../../Tables/Albums/TableContainer"
import styles from './AlbumView.module.css'
import sharedStyles from '../SharedStyles.module.css'
import { useState } from "react"
import { Filter } from "../../../../types/app.types"

export function AlbumView() {
  const { albumCollection } = useAppState()
  return (
    <section 
      id='albumView' 
      className={`
        ${sharedStyles.albumCollection}
        ${sharedStyles.viewContainerLayout}
      `}
    >
      <HeaderAlbumView />
      <section className={sharedStyles.viewTableContainer}>
        {albumCollection &&
          <AlbumTableContainer data={albumCollection} />
        }
      </section>
        <Footer />
    </section>
  )
}

function HeaderAlbumView() {
  const { albumCollection } = useAppState()

  return (
    <header className={sharedStyles.viewHeaderShared}>
      <p>{albumCollection?.length || 0} Albums</p>
      <FilterSection />
    </header>
  )
}

/**
 * We want to be able to filter for:
 * soldOut / available
 * text search album / artist
 * genre
 * price
 * release date 
 * @returns 
 */

function FilterSection(){
  const availabilityOptions: Filter['availability'][] = ['all','sold out','available']
  const dispatch = useAppDispatch();
  const selectedAvailability = useAppState().rsb.filters.availability
  const checked = selectedAvailability
  const handleOnChange = (id: Filter['availability']) => {
    dispatch({ type: 'setFilters', filters: { availability: id }})
  }
  return (
    <section>
      <fieldset className={styles.filterSection}>
        <legend>Filter availability:</legend>
        {availabilityOptions.map(availabilityOption => {
          return (
            <label htmlFor={availabilityOption} key={availabilityOption}>
              <input 
                type="radio" 
                name="available" 
                id={availabilityOption} 
                checked={checked === availabilityOption}
                onChange={() => handleOnChange(availabilityOption)}
                />
              <p>{availabilityOption}</p>
            </label>
          )
        })}
      </fieldset>

    </section>
  )
}