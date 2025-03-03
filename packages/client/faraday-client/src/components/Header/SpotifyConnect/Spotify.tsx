import React from 'react'
import styles from './Spotify.module.css'
import { InfoIcon } from '../../../icons/index';

import { connectToSpoti } from '../../../services/services';
import { useAppState } from '../../../state/AppStateHooks';
import Tooltip from '../../Shared/Tooltip/Tooltip';


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
            tooltipText="Log into Spotify to create a playlist."
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
  const { display_name, images } = user

  
  const inlineImageStyles: React.CSSProperties = {}
  if (images.length){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_big, small] = images
    inlineImageStyles.backgroundImage = `url(${small.url})`
  }

  return (
    <>
    {images.length
      ? 
        <div className={styles.userInfoContainer}>
          <h4>{display_name}</h4>
          <div
            className={styles.userImage}
            style={inlineImageStyles}
          /> 
        </div>
      : 
        <span className={styles.usersInitialWrapper}>
          <h3 className={styles.usersInitial}>{user.display_name.at(0)?.toUpperCase()}</h3>
        </span>
      }
    </>
  )
}