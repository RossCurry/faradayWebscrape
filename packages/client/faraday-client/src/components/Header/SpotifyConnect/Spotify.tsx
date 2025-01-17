import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import styles from './Spotify.module.css'

import { connectToSpoti } from '../../../services';
import { useAppState } from '../../../state/AppStateHooks';


export default function SpotifyConnect() {
  const { user } = useAppState()
  const isUserLoggedIn = !!user
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')
  console.log('code', code)

  console.log('!isUserLoggedIn -> ', isUserLoggedIn);
  return (
    <fieldset style={{ borderWidth: 0 }}>
      {!isUserLoggedIn 
      ? 
        <>
          <button onClick={() => connectToSpoti()}>Connect to Spotify</button>
        </>
      :
        <User />
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
    {/* TODO add popover on hover for name */}
    </>
  )
}