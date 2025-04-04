import { useEffect, useRef } from 'react'
import styles from './Player.module.css'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks';
import { PlayerTrackImage, PlayerTrackDetails, PlayerControls } from './components';

export default function Player() {
  const dispatch = useAppDispatch()
  const { audioUrl } = useAppState().player
  const audioRef = useRef<HTMLAudioElement>(null);

    // Plays the audio
  function handlePlay () {
    if (!audioRef.current) return
    audioRef.current?.play();
    dispatch({ type: 'setControls', controls: { isPlaying: true } })
  }

  useEffect(() => {
    const prevTrack = audioRef.current?.src
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl
      audioRef.current.load(); // Reloads the audio source
      audioRef.current.addEventListener('loadedmetadata', () => {
        dispatch({ type: 'setControls', controls: { clipDuration: audioRef.current?.duration || 0 } })
      });
      
      // Make sure to only autoplay on a new song. 
      // otherwise component mount will trigger the song.
      const isNewSong = prevTrack !== audioUrl
      if (isNewSong) {
        handlePlay()
      }
    }
    
    // Trigger the effect whenever the audioUrl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]); 

  return (
    <div className={styles.player}>
    
        <audio ref={audioRef}>
          <source src={audioUrl || '#'} media='audio/mpeg' />
        </audio>
      
      <PlayerTrackImage />
      <PlayerTrackDetails />
      <PlayerControls audioRef={audioRef} />
    </div>
  )
}




