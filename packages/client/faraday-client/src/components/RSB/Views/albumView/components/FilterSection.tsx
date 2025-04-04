import { useAppDispatch, useAppState } from '../../../../../state/AppStateHooks';
import { Filter } from '../../../../../types/app.types';
import styles from './FilterSection.module.css'

/**
 * We want to be able to filter for:
 * soldOut / available
 * text search album / artist
 * genre
 * price
 * release date 
 * @returns 
 */

export function FilterSection(){
  return (
    <section>
      <AvailabilitySelect />
    </section>
  )
}

function AvailabilityRadio(){
  const availabilityOptions: Filter['availability'][] = ['all','sold out','available']
  const dispatch = useAppDispatch();
  const selectedAvailability = useAppState().rsb.filters.availability
  const checked = selectedAvailability
  const handleOnChange = (id: Filter['availability']) => {
    dispatch({ type: 'setFilters', filters: { availability: id }})
  }
  return (
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
  )
}
function AvailabilitySelect(){
  const availabilityOptions: Filter['availability'][] = ['available', 'sold out', 'all']
  const dispatch = useAppDispatch();
  const selectedAvailability = useAppState().rsb.filters.availability
  const checked = selectedAvailability
  const handleOnChange = (id: Filter['availability']) => {
    dispatch({ type: 'setFilters', filters: { availability: id }})
  }
  return (
    <div className={styles.filterSection}>
      <label htmlFor="availability-filter" style={{ display: 'none' }}>Filter availability:</label>
      <select
        id="availability-filter"
        name="available"
        value={checked}
        onChange={(e) => {
          const value = e.target.value
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (availabilityOptions.includes(value as any)){
            handleOnChange(value as Filter['availability'])
          }
        }}
      >
        {availabilityOptions.map(availabilityOption => (
          <option 
            key={availabilityOption} 
            value={availabilityOption}
          >
            {availabilityOption}
          </option>
        ))}
      </select>
    </div>
  )
}