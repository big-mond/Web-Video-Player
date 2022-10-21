const playPauseBtn = document.querySelector(".play-pause-btn")
const controls = document.querySelector(".controls")
const autoplay = document.querySelector(".autoplay-btn")
const replayBtn = document.querySelector(".replay-btn")
const forwardBtn = document.querySelector(".forward-btn")
const muteBtn = document.querySelector(".mute-btn")
const currentTime = document.querySelector(".current-time")
const totalTime = document.querySelector(".total-time")
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const captionsBtn = document.querySelector(".captions-btn")
const captionsMenu = document.querySelector(".captionsMenu")
const captionsLabel = document.querySelector(".captionsMenu ul")
const speedBtn = document.querySelector(".speed-btn")
const miniplayerBtn = document.querySelector(".miniplayer-btn")
const settingsBtn = document.querySelector(".settings-btn")
const settings = document.querySelector(".settings")
const settingsMenu = document.querySelectorAll(
    ".settings [data-label='settingsMenu'] > ul > li")
const playback = document.querySelectorAll(".playback li")
const theaterBtn = document.querySelector(".theater-btn")
const fullscreenBtn = document.querySelector(".fullscreen-btn")
const timelineContainer = document.querySelector(".timeline-container")
const videoContainer = document.querySelector(".video-container")
const volumeSlider = document.querySelector(".volume-slider")
const video = document.querySelector("video")


//Key bindings to actions.
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
          skip(-10)
          break
        case "arrowRight":
        case "l":
          skip(+10)
          break
        case "c":
          toggleCaptions()
          break
    }
})

//Video Blob Url
let videoSources = document.querySelectorAll("source");
for (let i = 0; i < videoSources.length; i++) {
  let videoUrl = videoSources[i].src;
  blobUrl(videoSources[i], videoUrl);
}
function blobUrl(video, videoUrl) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", videoUrl);
  xhr.responseType = "arraybuffer";
  xhr.onload = (e) => {
    let blob = new Blob([xhr.response]);
    let url = URL.createObjectURL(blob);
    video.src = url;
  };
  xhr.send();
}

//Prevent Right-Click on video
video.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

//Timeline

//If mouse is moving starts handleTimelineUpdate
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




// Play/Pause button toggle
playPauseBtn.addEventListener("click", togglePlay)
// Toggle play on video
video.addEventListener("click", togglePlay)

//If video paused, play it. If playing, pause it.
function togglePlay() {
    video.paused ? video.play() : video.pause()
}

//Add paused class on paused and remove on play
video.addEventListener("play", () => {
    videoContainer.classList.remove("paused")
    videoContainer.classList.remove("ended")
})

video.addEventListener("pause", () => {
    videoContainer.classList.add("paused")
})


// Auto play
autoplay.addEventListener("click", () => {
  videoContainer.classList.toggle("autoplay");
  if (videoContainer.classList.contains("autoplay")) {
    autoplay.title = "Autoplay is on";
  } else {
    autoplay.title = "Autoplay is off";
  }
});

video.addEventListener("ended", () => {
  if (videoContainer.classList.contains("autoplay")) {
    playVideo();
  } else {
    videoContainer.classList.add("ended")
    // playPauseBtn.innerHTML = "";
    // playPauseBtn.title = "Replay";
  }
});


//Skip
function skip(duration) {
  video.currentTime += duration
}

//Replay Button
replayBtn.addEventListener("click", () => {
  skip(-10)
})

//Forward Button
forwardBtn.addEventListener("click", () => {
  skip(+10)
})


//Current Time
video.addEventListener("timeupdate", () => {
  currentTime.textContent = formatDuration(video.currentTime)
  //Bar will move with video progress
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


//Mute toggle
muteBtn.addEventListener("click", toggleMute)

function toggleMute() {
  video.muted = !video.muted
}

//Set volume slider to corresponding value
volumeSlider.addEventListener("input", e => {
  video.volume = e.target.value
  video.muted = e.target.value === 0 
})


//Change volume button according to actual volume
video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume / 1
  let volumeLevel
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0
    volumeLevel = "muted"
  } else if (video.volume >= 0.6) {
    volumeLevel = "high"
  } else {
    volumeLevel = "low"
  }
  
  //Volume button will correlate with volume level
  videoContainer.dataset.volumeLevel = volumeLevel
  
  //Inside volume bar will move with volume level
  volumeSlider.style.setProperty("--volume-level", volumeSlider.value)
})


//View Modes
miniplayerBtn.addEventListener("click", toggleMiniPlayerMode)
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


let timer
//Settings Button and Menu
settingsBtn.addEventListener("click", () => {
  clearTimeout(timer);
  settings.classList.toggle("active");
  settingsBtn.classList.toggle("active");
  //Settings Timeout after 20sec
  timer = setTimeout(() => {
    if (settings.classList.contains("active")||
        settingsBtn.classList.contains("active")
        ) {
        settings.classList.remove("active")
        settingsBtn.classList.remove("active")
    }
  }, 20000);
})

settings.addEventListener("click", () => {
  clearTimeout(timer);
  // Sets 20 second timer after clicking inside of menu
  timer = setTimeout(() => {
    if (settings.classList.contains("active")||
        settingsBtn.classList.contains("active")
        ) {
        settings.classList.remove("active")
        settingsBtn.classList.remove("active")
    }
  }, 20000);
})

settings.addEventListener("input", () => {
  clearTimeout(timer);
  // Sets 10 second timer after making an input
  timer = setTimeout(() => {
    if (settings.classList.contains("active")||
        settingsBtn.classList.contains("active")
        ) {
        settings.classList.remove("active")
        settingsBtn.classList.remove("active")
    }
  }, 10000);
})


// //Playback Speed Button
// speedBtn.addEventListener("click", changePlaybackSpeed)

// function changePlaybackSpeed() {
//   let speed = video.playbackRate + 0.25
//   if (speed > 2) speed = 0.25
//   video.playbackRate = speed
//   /*Play Speed Label*/
//   speedBtn.textContent = `${speed}x`
// }

//Playback Speed in Settings
playback.forEach((event) => {
  event.addEventListener("input", () => {
    // event.classList.toggle("active");
    speed = event.getAttribute("data-speed");
    video.playbackRate = speed
    /*Play Speed Label*/
    speedBtn.textContent = `${speed}x`
  })
})

//Captions
const captions = video.textTracks
captions.mode = "hidden"

captionsBtn.addEventListener("click", toggleCaptions, () => {})

//If it starts hidden, change to showing
function toggleCaptions() {
  //Default Captions
  //const isHidden = captions.mode === "hidden"
  //captions.mode = isHidden ? "showing" : "hidden"
  if (captionText.classList.contains("active")){
    captionText.classList.toggle("hidden")  
    videoContainer.classList.toggle("captions")

  }
}



//Video Tracks
const track = document.querySelectorAll("track")

if (track.length != 0) {
  captionsLabel.insertAdjacentHTML("afterbegin",
    `<li data-track="OFF" class="off">
      <button>
        <input type="radio" name="subtitles" value="off" checked>
      </button>
      <span>Off</span>
    </li>`
  );
  for (let i = 0; i < track.length; i++) {
    track_li = `<li data-track="${track[i].label}">
                  <button>
                    <input type="radio" name="subtitles" value="${track[i].label}">
                  </button>
                  <span>${track[i].label}</span>
                </li>`;
    captionsLabel.insertAdjacentHTML("beforeend", track_li);
  } 
}

//Subtitles in Settings Menu
const subtitles = document.querySelectorAll(".captionsMenu ul li");
subtitles.forEach((event) => {
  event.addEventListener("input", () => {
      videoContainer.classList.add("captions")
      captionText.classList.add("active")
     
    if (event.classList.contains("off")){
      videoContainer.classList.remove("captions")
      captionText.classList.remove("active")
    } 
    changeCaptions(event);
    captionText.innerHTML = "";
  });
});

function changeCaptions(label) {
  let captionsLabel = label.getAttribute("data-track");
  for (let i = 0; i < captions.length; i++) {
    captions[i].mode = "hidden";
    if (captions[i].label == captionsLabel) {
      captions[i].mode = "showing";
    }
  }
}


//Video Track Text
let captionText = document.querySelector(".caption-text");
for (let i = 0; i < captions.length; i++) {
  captions[i].addEventListener("cuechange", () => {
    if (captions[i].mode === "showing") {
      if (captions[i].activeCues[0]) {
        let span = `<span><mark>${captions[i].activeCues[0].text}</mark></span>`;
        captionText.innerHTML = span;
      } else {
        captionText.innerHTML = "";
      }
    }
  });
}

const settingsDivs = document.querySelectorAll(".settings > div")
const settingsBack = document.querySelectorAll(".settings > div .arrow_back")
const qualityUl = document.querySelector(".settings > [data-label='quality'] ul")
const qualities = document.querySelectorAll("source[size]")

qualities.forEach((event) => {
  let quality_html = `<li data-quality="${event.getAttribute("size")}">
                        <button>
                          <input type="radio" name="quality" value="${event.getAttribute("size")}">
                        </button>
                        <span>${event.getAttribute("size")}p</span></li>`;
  qualityUl.insertAdjacentHTML("afterbegin", quality_html);
})

const qualityLi = document.querySelectorAll(".settings > [data-label='quality'] ul > li")

qualityLi.forEach((event) => {
  event.addEventListener("input", (e) => {
    let quality = event.getAttribute("data-quality");
    removeActiveClasses(qualityLi);
    event.classList.add("active");
    qualities.forEach((event) => {
      if (event.getAttribute("size") == quality) {
        let videoCurrentDuration = video.currentTime;
        let videoSource = event.getAttribute("src");
        video.src = videoSource;
        video.currentTime = videoCurrentDuration;
        playVideo();
      }
    });
  });
});

settingsBack.forEach((event) => {
  event.addEventListener("click", (e) => {
    let settingsLabel = e.target.getAttribute("data-label");
    for (let i = 0; i < settingsDivs.length; i++) {
      if (settingsDivs[i].getAttribute("data-label") == settingsLabel) {
        settingsDivs[i].removeAttribute("hidden");
      } else {
        settingsDivs[i].setAttribute("hidden", "");
      }
    }
  });
});

settingsMenu.forEach((event) => {
  event.addEventListener("click", (e) => {
    let settingsLabel = e.target.getAttribute("data-label");
    for (let i = 0; i < settingsDivs.length; i++) {
      if (settingsDivs[i].getAttribute("data-label") == settingsLabel) {
        settingsDivs[i].removeAttribute("hidden");
      } else {
        settingsDivs[i].setAttribute("hidden", "");
      }
    }
  });
});



function removeActiveClasses(e) {
  e.forEach((event) => {
    event.classList.remove("active");
  });
}








