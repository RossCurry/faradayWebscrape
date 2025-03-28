import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from '../Footer.module.css'
import { useAppDispatch, useAppState } from '../../../../state/AppStateHooks';
import { faradayLogo } from '../../../../logos/FaradayLogo';
import IconButton from '../../../Shared/IconButton/IconButton';
import { PauseIcon, PlayIcon, SkipPrevious, VolumeOff, VolumeOn } from '../../../../icons';
import { msToFormattedDuration } from '../../../../utils/msToTime';

export default function Player() {
  const dispatch = useAppDispatch()
  const { audioUrl, track } = useAppState().player
  const audioRef = useRef<HTMLAudioElement>(null);
  const [controls, setControls] = useState({
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    volume: 1,
    playbackRate: 1,
    track: track,
    clipDuration: 0
  })

    // Plays the audio
  function handlePlay () {
    if (!audioRef.current) return
    audioRef.current?.play();
    setControls({ ...controls, isPlaying: true, isPaused: false })
    console.log('!isPlaying -> ', controls.isPlaying);
    console.log('!isPaused -> ', controls.isPaused);
  }

  // Pauses the audio
  function handlePause() {
    if (!audioRef.current) return
    audioRef.current?.pause();
    setControls({ ...controls, isPaused: true, isPlaying: false })
  }

  function handlePlayPause(){
    if (controls.isPlaying){
      handlePause()
      return
    }
    if (controls.isPaused){
      handlePlay()
      return
    }
  }

  // Gets the current playback position in seconds
  function getCurrentTime() {
    if (!audioRef.current) return 0
    return audioRef.current.currentTime;
  }


  
  // Sets the current playback position in seconds
  function handleStop() {
    if (!audioRef.current) return
    handlePause()
    audioRef.current.currentTime = 0;
  }


  // Sets whether the audio is muted
  function handleSetMuted() {
    if (!audioRef.current) return
    const toogleValue = !controls.isMuted
    audioRef.current.muted = toogleValue;
    setControls({ ...controls, isMuted: toogleValue })
  }

  // Returns the length of the audio in seconds
  function getDuration() {
    return controls.clipDuration;
  }


  useEffect(() => {
    const prevTrack = audioRef.current?.src
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl
      audioRef.current.load(); // Reloads the audio source
      audioRef.current.addEventListener('loadedmetadata', () => {
        setControls({ 
          ...controls, 
          clipDuration: audioRef.current?.duration || 0
        })
      });
      
      // Make sure to only autoplay on a new song. 
      // otherwise component mount will trigger the song.
      const isNewSong = prevTrack !== audioUrl
      if (isNewSong) handlePlay()
    }
    
    // Trigger the effect whenever the audioUrl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]); 

  return (
    <div className={styles.player}>
    
        <audio ref={audioRef}>
          <source src={audioUrl || '#'} media='audio/mpeg' />
        </audio>
      
      {/* <button onClick={() => alert(handleGetCurrentTime())}>Get Current Time</button> */}
      {/* TODO */}
      {/* IMG */}
      <div
          className={styles.playerImg}
          style={{
            backgroundImage: `url(${track?.imageUrl || faradayLogo})`
          }}
        />
      {/* ARTIST & SONG NAME */}
      <div className={styles.playerTrackInfo}>
        <p className={styles.playerTrackName}>{track?.name}</p>
        <p>{track?.artists.map(a=>a.name).join(', ')}</p>
      </div>
      {/* REPRODUCIR CONTROLS */}
      <fieldset>

        {/* StopBack */}
        <IconButton 
          Icon={SkipPrevious}
          handleOnClick={handleStop}
          text=''
          />
        {/* PlayPause */}
        <IconButton 
          Icon={controls.isPlaying && !controls.isPaused ? PauseIcon : PlayIcon}
          handleOnClick={handlePlayPause}
          text=''
        />
        {/* PROGESS BAR */}
        <Time time={getDuration()} />
        <ProgressBar getCurrentTime={getCurrentTime} totalTime={getDuration()} />
        {/* VOLUME CONTROLS - at least MUTE */}
        <IconButton 
          Icon={controls.isMuted ? VolumeOff : VolumeOn}
          handleOnClick={handleSetMuted}
          text=''
          // className={`${styles.playerButtonMute} ${controls.isMuted ? styles.isMuted : ''}`}
          className={`${styles.playerButtonMute}`}
        />
      </fieldset>
      {/* <button onClick={() => handleSetVolume(0.5)}>Set Volume (e.g., 0.5)</button> */}
      {/* <button onClick={() => handleSetPlaybackRate(1.5)}>Set Playback Rate (e.g., 1.5x)</button> */}
    </div>
  )
}

const ProgressBar = ({ getCurrentTime, totalTime }: { getCurrentTime: () => number, totalTime: number }) => {
  const [currentTime, setCurrentTime] = useState<number>(0)
  const progress = currentTime/totalTime * 100;

  useEffect(() => {
    const internvalId = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 150)
    return () => clearInterval(internvalId)
  })

  return (
    <div className={styles.progressBarContainer}>
      <div 
        className={styles.progressBar} id="progress-bar" 
        style={{ width: `${progress}%`}}
      />
    </div>
  )
}

// Time is given in seconds
const Time = ({ time }: { time: number | undefined }) => {
  console.log('!Time -> ', time);
  const formattedTime = useMemo(() => {
    const asMilliseconds = time && time * 1000;
    return asMilliseconds ? msToFormattedDuration(asMilliseconds) : 0
  }, [time])
  console.log('!formattedTime -> ', formattedTime);
  if (!formattedTime) return null;
  return (
    <p>{formattedTime}</p>
  )
}

// const BasicPlayerWithControls = () => {
//   const { audioUrl } = useAppState().player
//   return (
//     <audio 
//       controls 
//       // ref={audioRef}
//     >
//       <source src={audioUrl || '#'} media='audio/mpeg' />
//     </audio>
//   )
// }


/**
 * <button onClick={handlePlay}>Play</button>
    <button onClick={handlePause}>Pause</button>
    <button onClick={() => alert(handleGetCurrentTime())}>Get Current Time</button>
    <button onClick={() => handleSetCurrentTime(30)}>Set Current Time (e.g., 30s)</button>
    <button onClick={() => alert(handleGetDuration())}>Get Duration</button>
    <button onClick={() => alert(handleGetVolume())}>Get Volume</button>
    <button onClick={() => handleSetVolume(0.5)}>Set Volume (e.g., 0.5)</button>
    <button onClick={() => alert(handleIsPaused())}>Is Paused?</button>
    <button onClick={() => alert(handleGetMuted())}>Get Muted</button>
    <button onClick={() => handleSetMuted(true)}>Set Muted (Mute)</button>
    <button onClick={() => alert(handleGetPlaybackRate())}>Get Playback Rate</button>
    <button onClick={() => handleSetPlaybackRate(1.5)}>Set Playback Rate (e.g., 1.5x)</button>
 */