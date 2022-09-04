const playPauseBtn = document.querySelector(".play-pause-btn")
const muteBtn = document.querySelector(".mute-btn")
const currentTime = document.querySelector(".current-time")
const totalTime = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const captionsBtn = document.querySelector(".captions-btn")
const speedBtn = document.querySelector(".speed-btn")
const miniPlayerBtn = document.querySelector(".miniplayer-btn")
const theaterBtn = document.querySelector(".theater-btn")
const fullscreenBtn = document.querySelector(".fullscreen-btn")
const timelineContainer = document.querySelector(".timeline-container")
const videoContainer = document.querySelector(".video-container")
const volumeSlider = document.querySelector(".volume-slider")
const video = document.querySelector("video")


//Key bindings to actions
document.addEventListener("keydown", e => {
  //Equals whatever we are tabbed on to
  const tagName =document.activeElement.tagName.toLowerCase()
  //If tab into an input, exit out
  if (tagName === "input") return

    switch (e.key.toLowerCase()) {
        case " ":
          //If tabbed on to button, press button
          if(tagName === "button") return
        case "k":
          togglePlay()
          break
        case "i":
          toggleMiniPlayerMode
          break
        case "t":
          toggleTheaterMode
          break
        case "f":
          toggleFullscreenMode()
          break
        case "m":
          toggleMute()
          break
        case "arrowLeft":
        case "j":
          skip(-5)
          break
        case "arrowRight":
        case "l":
          skip(+5)
          break
        case "c":
          toggleCaptions()
          break
    }
})


//Timeline

timelineContainer.addEventListener("mousemove", handleTimelineUpdate)
//If mouse is pressed down, toggle scrubbing
timelineContainer.addEventListener("mousedown", toggleScrubbing)
//Only enter scrubbing when in timeline and clicking down
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e)
})
//If scrubbing starts handleTimelineUpdate
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e)
})

let isScrubbing = false
let wasPaused
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect()
  //e.x gives position of X of mouse cursor, relative to timeline.
  //0 is so cursor doesn't go past limit. 
  //Rect.width is furthest right position
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  //Determines if left button is being click, if yes, enables scrubbing
  isScrubbing = (e.buttons & 1) === 1
  videoContainer.classList.toggle("scrubbing", isScrubbing)
  //If scrubbing, pause video
  if (isScrubbing) {
    wasPaused = video.paused
    video.pause()
  } else {
    //Move video where scrubbing was stopped then play
    video.currentTime = percent * video.duration
    if (!wasPaused) video.play()
  }

  //If scrubbing starts, pulls code from handleTimelineUpdate 
  handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect()
  //e.x gives position of X of mouse cursor, relative to timeline.
  //0 is so cursor doesn't go past limit. 
  //Rect.width is furthest right position
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
  //Math.floor((percent * video.duration)) gives value for how far into video
  //Determines image according to how they were set up, 10 seconds
  const previewImgNumber = Math.max(1, Math.floor((percent * video.duration) / 10))
  const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`
  previewImg.src = previewImgSrc
  timelineContainer.style.setProperty("--preview-position", percent)
  
  //Scrubbing Settings
  if (isScrubbing) {
    //Prevents highlighting page while scrubbing
    e.preventDefault()
    thumbnailImg.src = previewImgSrc
    timelineContainer.style.setProperty("--progress-position", percent)
  }
}


//Play/Pause button toggle
playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)

//If video paused, play it. If playing, pause it.
function togglePlay() {
    video.paused ? video.play() : video.pause()
}

video.addEventListener("play", () => {
    videoContainer.classList.remove("paused")
})

video.addEventListener("pause", () => {
    videoContainer.classList.add("paused")
})


//Volume toggle
muteBtn.addEventListener("click", toggleMute)
//Set volume slider to corresponding value
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value
  video.muted = e.target.value === 0 
})

function toggleMute() {
  video.muted = !video.muted
}

//Change volume button according to actual volume
video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume
  let volumeLevel
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    volumeLevel = "muted"
  } else if (video.volume >= .5) {
    volumeLevel = "high"
  } else {
    volumeLevel = "low"
  }
  
  videoContainer.dataset.volumeLevel = volumeLevel
})


//Current Time
video.addEventListener("timeupdate", () => {
  currentTime.textContent = formatDuration(video.currentTime)
  //Red bar will move with video progress
  const percent = video.currentTime / video.duration
  timelineContainer.style.setProperty("--progress-position", percent)
})

//Duration Counter
video.addEventListener("loadeddata", () => {
  totalTime.textContent = formatDuration(video.duration)
})

//Makes time say :04 instead of :4
const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
})

//Created to display duration time in full instead of seconds
function formatDuration(time) {
  const seconds = Math.floor(time % 60)
  const minutes = Math.floor(time / 60) % 60
  const hours = Math.floor(time / 3600)
  //If no hours display minutes, if so show with minutes
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes)}:${leadingZeroFormatter.format(seconds)}`
  }
}

//Skip
function skip(duration) {
  video.currentTime += duration
}

//Captions
const captions = video.textTracks[0]
video.textTracks[0].mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions)

//If it starts hidden, change to showing
function toggleCaptions() {
  const isHidden = captions.mode === "hidden"
  captions.mode = isHidden ? "shown" : "hidden"
  videoContainer.classList.toggle("captions", isHidden)
}

//Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed)

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25
  if (newPlaybackRate > 2) newPlaybackRate = 0.25
  video.playbackRate = newPlaybackRate
  speedBtn.textContent = `${newPlaybackRate}x`
}

//View Modes
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode)
theaterBtn.addEventListener("click", toggleTheaterMode)
fullscreenBtn.addEventListener("click", toggleFullscreenMode)

//Mini-player. Checks if in mini-player mode, if so exit, if not enable it.
function toggleMiniPlayerMode(){
    if (videoContainer.classList.contains("miniplayer")) {
        document.exitPictureInPicture()
      } else {
        video.requestPictureInPicture() 
      }
}

//Enable miniplayer class
video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("miniplayer")
  })

//Disable miniplayer class
video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("miniplayer")
  })

//Enable theater class
function toggleTheaterMode() {
    videoContainer.classList.toggle("theater")
}

//Fullscreen. If not in fullscreen enable it, else exit fullscreen.  
function toggleFullscreenMode(){
    if (document.fullscreenElement == null) {
      videoContainer.requestFullscreen()
    } else {
      document.exitFullscreen() 
    }
}

//If in fullscreen set to true, else set to false
document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("fullscreen", 
  document.fullscreenElement)
})