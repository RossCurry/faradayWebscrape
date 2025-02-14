import styles from './RightSidebar.module.css'
import Views from './Views'
import Footer from './Footer'


export default function RightSidebar() {

  return (
    <div id='RightSidebar' className={styles.rightSidebar}>
      <main
        className={styles.viewContainer}
        // // Using onscoll here as the table itself is not scrollable
        // onScroll={(e) =>{ 
        //   const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
        //   if (scrollHeight - scrollTop - clientHeight < 500){
        //     dispatch({ type: 'scrollAction', scrollAction: 'fetch' })
        //   }
        //   else {
        //     dispatch({ type: 'scrollAction', scrollAction: null })
        //   }
        // }}
      >
        <Views />
      </main>
      <Footer />
    </div>
  )
}
