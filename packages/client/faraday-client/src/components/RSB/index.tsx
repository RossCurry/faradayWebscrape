import React, { useEffect, useRef } from 'react'

import styles from './RightSidebar.module.css'
import Views from './Views'
import Footer from './Footer'
import { useAppDispatch } from '../../state/AppStateHooks'

export default function RightSidebar() {
  const dispatch = useAppDispatch()
  const scrollRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      dispatch({ type: 'setScrollElement', scrollElement: scrollRef.current })
    }
  // Dont want dispatch in the dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef])

  return (
    <div id='RightSidebar' className={styles.rightSidebar}>
      <main
        id='scrollContainer'
        className={styles.viewContainer}
        ref={scrollRef}
        // Using onscoll here as the table itself is not scrollable
        onScroll={(e) =>{ 
          const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
          if (scrollHeight - scrollTop - clientHeight < 500){
            dispatch({ type: 'scrollAction', scrollAction: 'fetch' })
          }
          else {
            dispatch({ type: 'scrollAction', scrollAction: null })
          }
        }}
        style={{
          //our scrollable table container
          overflow: 'auto', 
          // They say we must have a fixed height - seems to work without
          height: '600px', 
          position: 'relative',
        }}
      >
        <Views scrollElement={scrollRef}/>
      </main>
      <Footer />
    </div>
  )
}
