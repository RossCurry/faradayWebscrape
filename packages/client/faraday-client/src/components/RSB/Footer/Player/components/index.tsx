import React, { useState, useEffect, useMemo } from 'react';
import styles from '../Player.module.css'
import { useAppDispatch, useAppState } from '../../../../../state/AppStateHooks';
import { faradayLogo } from '../../../../../logos/FaradayLogo';
import { PlayIcon, PauseIcon, VolumeOff, VolumeOn } from '../../../../../icons';
import { msToFormattedDuration } from '../../../../../utils/msToTime';
import IconButton from '../../../../Shared/IconButton/IconButton';


export function PlayerTrackImage() {
  const { track } = useAppState().player;
  return (
    <div
      className={styles.playerImg}
      style={{
        backgroundImage: `url(${track?.imageUrl || faradayLogo})`
      }} />
  );
}

export function PlayerTrackDetails() {
  const { track } = useAppState().player;
  return (
    <div className={styles.playerTrackInfo}>
      <p className={styles.playerTrackName}>{track?.name}</p>
      <p>{track?.artists.map(a => a.name).join(', ')}</p>
    </div>
  );
}

// Time is given in seconds
const Time = ({ time }: { time: number | undefined; }) => {
  const formattedTime = useMemo(() => {
    const asMilliseconds = time && time * 1000;
    return asMilliseconds ? msToFormattedDuration(asMilliseconds) : null;
  }, [time]);
  // if (formattedTime === null) return null;
  return (
    <p style={{ width: '50px' }}>{formattedTime || '00:00'}</p>
  );
};

const CurrentTime = ({ getCurrentTime, duration }: { getCurrentTime: () => number, duration: number }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const internvalId = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 150);
    return () => clearInterval(internvalId);
  });

  return (
    <>
      {/* <p>preview</p> */}
      <Time time={currentTime || 0} />
      {'/'}
      <Time time={duration} />
    </>
  );

};

const ProgressBar = ({ getCurrentTime, totalTime }: { getCurrentTime: () => number; totalTime: number; }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const progress = currentTime / totalTime * 100;

  useEffect(() => {
    const internvalId = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 150);
    return () => clearInterval(internvalId);
  });

  return (
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar} id="progress-bar"
        style={{ width: `${progress}%` }} />
    </div>
  );
};


export function PlayerControls({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement>; }) {
  const dispatch = useAppDispatch();
  const { controls } = useAppState().player;

  // Plays the audio
  function handlePlay() {
    console.log('!handlePlay -> ', !!audioRef.current);
    if (!audioRef.current) return;
    audioRef.current?.play();
    dispatch({ type: 'setControls', controls: { isPlaying: true } });
  }

  // Pauses the audio
  function handlePause() {
    console.log('!handlePause -> ', !!audioRef.current);
    if (!audioRef.current) return;
    audioRef.current?.pause();
    dispatch({ type: 'setControls', controls: { isPlaying: false } });
  }

  // Gets the current playback position in seconds
  function getCurrentTime() {
    if (!audioRef.current) return 0;
    return audioRef.current.currentTime;
  }

  // Sets whether the audio is muted
  function handleSetMuted() {
    if (!audioRef.current) return;
    const toogleValue = !controls.isMuted;
    audioRef.current.muted = toogleValue;
    dispatch({ type: 'setControls', controls: { isMuted: toogleValue } });
  }

  // Returns the length of the audio in seconds
  function getDuration() {
    return controls.clipDuration;
  }

  return (
    <fieldset>
      {/* Play */}
      {!controls.isPlaying && <IconButton
        Icon={PlayIcon}
        handleOnClick={handlePlay}
        text='' />}
      {/* Pause */}
      {controls.isPlaying && <IconButton
        Icon={PauseIcon}
        handleOnClick={handlePause}
        text='' />}
      {/* PROGESS BAR */}
      <CurrentTime getCurrentTime={getCurrentTime} duration={getDuration()} />
      <ProgressBar getCurrentTime={getCurrentTime} totalTime={getDuration()} />
      {/* VOLUME CONTROLS - at least MUTE */}
      <IconButton
        Icon={controls.isMuted ? VolumeOff : VolumeOn}
        handleOnClick={handleSetMuted}
        text=''
        className={`${styles.playerButtonMute}`} />
    </fieldset>
  );
}