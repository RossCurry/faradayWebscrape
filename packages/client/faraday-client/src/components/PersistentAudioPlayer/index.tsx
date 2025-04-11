import { useRef, useEffect } from "react";
import { useAppDispatch, useAppState } from "../../state/AppStateHooks";

export function PersistentAudioPlayer() {
  const dispatch = useAppDispatch()
  const { audioUrl } = useAppState().player
  const audioRef = useRef<HTMLAudioElement>(null);

  // Set the audioRef in the store
  useEffect(() => {
    if (audioRef.current) {
      dispatch({ type: 'setAudioRef', audioRef })
    }
  },[])

  /**
   * Add eventlisteners to the audio element
   * Autoplay the audio when the audioUrl changes
   */
  useEffect(() => {
    const abort = new AbortController();
    const prevTrack = audioRef.current?.src

    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl
      audioRef.current.load(); // Reloads the audio source

      audioRef.current.addEventListener('loadedmetadata', () => {
        dispatch({ type: 'setControls', controls: { clipDuration: audioRef.current?.duration || 0 } })
      }, { signal: abort.signal });

      audioRef.current.addEventListener('ended', () => {
        if (audioRef.current) audioRef.current.currentTime = 0
        dispatch({ type: 'setControls', controls: { isPlaying: false } })
      }, { signal: abort.signal });


      // Make sure to only autoplay on a new song. 
      // otherwise component mount will trigger the song.
      const isNewSong = prevTrack !== audioUrl
      console.log('!isNewSong -> ', isNewSong);
      if (isNewSong) {
        audioRef.current.play()
        dispatch({ type: 'setControls', controls: { isPlaying: true } })
      }
    }

    // Abort the event listeners when the component unmounts
    return () => {
      abort.abort();
    }
    // Trigger the effect whenever the audioUrl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]); 

  // moving the audio element to the top level of the app to avoid rerendering
  return (
    <audio ref={audioRef}>
      <source src={audioUrl || '#'} media='audio/mpeg' />
    </audio>
  )
}