// Sets the current playback position in seconds
function handleSetCurrentTime(seconds: number) {
  if (!audioRef.current) return
  audioRef.current.currentTime = seconds;
}



  // Gets the current audio volume (0.0 to 1.0)
  function handleGetVolume() {
    return audioRef.current?.volume;
  }

  // Sets the audio volume (0.0 to 1.0)
  function handleSetVolume(volume: number) {
    if (!audioRef.current) return
    audioRef.current.volume = volume;
  }

  // Returns true if the audio is paused
  function handleIsPaused() {
    return audioRef.current?.paused;
  }

  // Gets whether the audio is muted
  function handleGetMuted() {
    return audioRef.current?.muted;
  }

  // Gets the current playback rate
  function handleGetPlaybackRate() {
    return audioRef.current?.playbackRate;
  }

  // Sets the speed of playback
  function handleSetPlaybackRate(rate: number) {
    if (!audioRef.current) return
    audioRef.current.playbackRate = rate;
  }
