import React from 'react'
import styles from './Spotify.module.css'
import { InfoIcon } from '../../../icons/index';

import { connectToSpoti } from '../../../services';
import { useAppState } from '../../../state/AppStateHooks';
import Tooltip from '../../Tooltip/Tooltip';


export default function SpotifyConnect() {
  const { user } = useAppState()
  const isUserLoggedIn = !!user

  return (
    <fieldset style={{ borderWidth: 0 }}>
      {!isUserLoggedIn 
      ? 
        <div className={styles.connectToSpotifyButton}>
          <Tooltip
            Component={<InfoIcon />}
            tooltipText="you must be logged in to create a playlist"
            componentStyle={{ width: '24px', height: '24px', marginRight: '8px' }}
          />
          <button onClick={() => connectToSpoti()}>Connect to Spotify</button>
        </div>
      :
        <Tooltip
          Component={<User />}
          tooltipText={user.display_name}
        />
      }
    </fieldset>
  )
}

const User = () => {
  const { user } = useAppState()
  if (!user) return null;

  console.log('!User component -> ', user);
  const { images } = user
  console.log('!images -> ', images);
  
  const inlineStyles: React.CSSProperties = {}
  if (images.length){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_big, small] = images
    inlineStyles.backgroundImage = `url(${small.url})`
  }

  return (
    <>
    {images.length
      ? 
        <div
          className={styles.userImage}
          style={inlineStyles}
        /> 
      : 
        <span className={styles.userInitialWrapper}>
          <h3 className={styles.userInitial}>{user.display_name.at(0)?.toUpperCase()}</h3>
        </span>
      }
    </>
  )
}