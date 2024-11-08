import React, { useEffect, useRef } from 'react'
import { useAppState } from '../../../state/AppStateHooks';

type PlayerProps = {}
export default function Player(props: PlayerProps) {
  const { audioUrl } = useAppState().player
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl
      audioRef.current.load(); // Reloads the audio source
      audioRef.current.play(); // Reloads the audio source
    }
  }, [audioUrl]); // Trigger the effect whenever the audioUrl changes
  
  return (
    <div style={{ position: 'absolute', left: 600, top: 0 }}>
      {
        <audio controls ref={audioRef}>
          <source src={audioUrl || '#'} media='audio/mpeg'/>
        </audio>
      }
    </div>
  )
}
