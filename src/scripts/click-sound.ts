let globalHandleClick: ((event: MouseEvent) => void) | null = null;

function initClickSound() {
  const audio = document.getElementById("button-sound") as HTMLAudioElement | null;
  if (!audio) return;

  const isInternalLink = (href: string | null): href is string =>
    Boolean(href && href.startsWith("/") && !href.startsWith("//"));

  const playClickSound = () => {
    if (!(audio instanceof HTMLAudioElement)) {
      return;
    }

    audio.currentTime = 0;
    try {
      audio.play().catch((err) => {
        if (err.name !== 'NotAllowedError') {
          console.warn('Audio play failed:', err.message);
        }
      });
    } catch (err) {
      console.warn('Audio play error:', err instanceof Error ? err.message : 'Unknown');
    }
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

    if (target.tagName !== "A") {
      playClickSound();
      return;
    }

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

  globalHandleClick = handleClick;

  document.body.removeEventListener("click", handleClick);
  document.body.addEventListener("click", handleClick);

  const unlockAudio = () => {
    if (!(audio instanceof HTMLAudioElement)) {
      return;
    }

    try {
      audio
        .play()
        .catch((err) => {
          if (err.name !== 'NotAllowedError') {
            console.warn('Audio unlock failed:', err.message);
          }
        })
        .finally(() => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {
            // Ignore
          }
        });
    } catch (err) {
      console.warn('Audio unlock error:', err instanceof Error ? err.message : 'Unknown');
    }

    document.removeEventListener("click", unlockAudio);
  };

  document.addEventListener("click", unlockAudio, {
    once: true,
  });
}

if (typeof window !== 'undefined') {
  function initAll() {
    if (globalHandleClick) {
      document.body.removeEventListener("click", globalHandleClick);
    }
    initClickSound();
  }

  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initClickSound);
  } else {
    initClickSound();
  }

  document.addEventListener("astro:page-load", initAll);
}
