const videos = document.querySelectorAll<HTMLVideoElement>(".thought-video");

const pauseAllVideos = (except?: HTMLVideoElement) => {
  videos.forEach((video) => {
    if (video !== except) {
      video.pause();
    }
  });
};

videos.forEach((video) => {

  const wrapper = video.closest(".thought-video-wrapper");

  if (!wrapper) return;

  const overlay = wrapper.querySelector<HTMLButtonElement>(".video-overlay");
  const muteBtn = wrapper.querySelector<HTMLButtonElement>(".mute-toggle");
  const indicator = wrapper.querySelector<HTMLElement>(".play-indicator");

  // ONLY ONE VIDEO ACTIVE

  video.addEventListener("play", () => {
    pauseAllVideos(video);
  });

  // AUTOPLAY WHEN VISIBLE

  const observer = new IntersectionObserver(
    ([entry]) => {

      if (entry.isIntersecting) {
        pauseAllVideos(video);

        video.play().catch(() => {});
      } else {
        video.pause();
      }

    },
    {
      threshold: 0.7,
    }
  );

  observer.observe(video);

  // TAP ANYWHERE

  overlay?.addEventListener("click", () => {

    if (video.paused) {
      pauseAllVideos(video);

      video.play();

      indicator?.classList.add("opacity-0");

    } else {

      video.pause();

      indicator?.classList.remove("opacity-0");
    }

  });

  // MUTE

  muteBtn?.addEventListener("click", (e) => {

    e.stopPropagation();

    video.muted = !video.muted;

    muteBtn.textContent = video.muted
      ? "muted"
      : "sound on";
  });

});

// PAUSE ON CAROUSEL SWIPE

document.querySelectorAll(".media-slider").forEach((slider) => {

  slider.addEventListener("scroll", () => {
    pauseAllVideos();
  });

});