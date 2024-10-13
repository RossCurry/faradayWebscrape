import React, { useEffect, useRef } from 'react'

type PlayerProps = {
  audioUrl: string | null
}
export default function Player({ audioUrl }: PlayerProps) {
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
          <source src={audioUrl} media='audio/mpeg'/>
        </audio>
      }
    </div>
  )
}
