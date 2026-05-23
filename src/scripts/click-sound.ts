function initClickSound() {
  const audio = document.getElementById("button-sound");

  const isInternalLink = (href: string | null): href is string =>
    Boolean(href && href.startsWith("/") && !href.startsWith("//"));

  const playClickSound = () => {
    if (!(audio instanceof HTMLAudioElement)) {
      return;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const handleClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest("button, a");

    if (!target) return;

    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    // BUTTON
    if (target.tagName !== "A") {
      playClickSound();
      return;
    }

    // LINK
    const href = target.getAttribute("href");

    if (!isInternalLink(href)) {
      playClickSound();
      return;
    }

    event.preventDefault();
    playClickSound();

    setTimeout(() => {
      window.location.href = href;
    }, 90);
  };

  document.body.removeEventListener("click", handleClick);
  document.body.addEventListener("click", handleClick);

  // unlock audio
  const unlockAudio = () => {
    if (!(audio instanceof HTMLAudioElement)) {
      return;
    }

    audio
      .play()
      .catch(() => {})
      .finally(() => {
        audio.pause();
        audio.currentTime = 0;
      });

    document.removeEventListener("click", unlockAudio);
  };

  document.addEventListener("click", unlockAudio, {
    once: true,
  });
}

// Support both standard page load and Astro View Transitions
document.addEventListener("DOMContentLoaded", initClickSound);
document.addEventListener("astro:page-load", initClickSound);
