import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
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
          <p>A collection of what is available on Spotify</p>
          <button onClick={() => connectToSpoti()}>Connect to Spotify</button>
        </>
      :
        <p>LoggedIn</p>
      }
    </fieldset>
  )
}
