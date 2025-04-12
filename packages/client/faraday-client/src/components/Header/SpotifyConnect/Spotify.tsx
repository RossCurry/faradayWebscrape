import React from 'react'
import styles from './Spotify.module.css'
import { InfoIcon, LogoutIcon } from '../../../icons/index';

import { connectToSpoti } from '../../../services/services';
import { useAppDispatch, useAppState } from '../../../state/AppStateHooks';
import Tooltip from '../../Shared/Tooltip/Tooltip';
import { SpotifyGreenLogo } from '../../../logos';
import { useIsMobile } from '../../../hooks/useIsMobile';


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
          <ConnectToSpotifyButton />
        </div>
      :
        <LoggedIn />
      }
    </fieldset>
  )
}

export function ConnectToSpotifyButton(){
  return (
    <button 
      onClick={() => connectToSpoti()}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}
    >
      <p style={{ margin: 0, padding: 0 }}>Connect</p> 
      <SpotifyGreenLogo width={24} height={24} />
    </button>
  )
}

const User = () => {
  const { user } = useAppState()
  const isMobile = useIsMobile()
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
          {!isMobile && <h4>{display_name}</h4>}
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


function LoggedIn(){
  const { user } = useAppState()
  const isMobile = useIsMobile()
  if (!user) return null;
  const { display_name } = user

  return (
    <span style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      cursor: 'pointer'
    }}>
      <Tooltip
        Component={<User />}
        tooltipText={display_name}
      />
      <Tooltip
        Component={<LogoutButton />}
        tooltipText='Log out'
      />
    </span>
  )
}

function LogoutButton(){
  const dispatch = useAppDispatch()
  const handleLogout = () => {
    // remove jwt token & set user to null
    localStorage.removeItem('jwt')
    dispatch({ type: 'setUserInfo', userInfo: null })
  }
  return (
    <button
      style={{
        background: 'inherit',
        border: 0,
        padding: 0,
        margin: 0,
      }} 
      onClick={handleLogout} 
    >
      <LogoutIcon width={28} height={28} />
    </button>
  )
}