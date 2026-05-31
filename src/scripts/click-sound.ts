// Store handleClick reference globally for View Transitions cleanup
let globalHandleClick: ((event: MouseEvent) => void) | null = null;

function initClickSound() {
  const audio = document.getElementById("button-sound") as HTMLAudioElement | null;
  if (!audio) return; // Guard: no audio element found

  const isInternalLink = (href: string | null): href is string =>
    Boolean(href && href.startsWith("/") && !href.startsWith("//"));

  const playClickSound = () => {
    if (!(audio instanceof HTMLAudioElement)) {
      return;
    }

    audio.currentTime = 0;
    try {
      audio.play().catch((err) => {
        // Silently catch Autoplay Policy errors
        if (err.name !== 'NotAllowedError') {
          console.warn('Audio play failed:', err.message);
        }
      });
    } catch (err) {
      // Fallback for older browsers
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

  // Store reference for cleanup
  globalHandleClick = handleClick;

  document.body.removeEventListener("click", handleClick);
  document.body.addEventListener("click", handleClick);

  // unlock audio
  const unlockAudio = () => {
    if (!(audio instanceof HTMLAudioElement)) {
      return;
    }

    try {
      audio
        .play()
        .catch((err) => {
          // Silently catch Autoplay Policy errors during unlock
          if (err.name !== 'NotAllowedError') {
            console.warn('Audio unlock failed:', err.message);
          }
        })
        .finally(() => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {
            // Ignore cleanup errors
          }
        });
    } catch (err) {
      // Fallback for older browsers
      console.warn('Audio unlock error:', err instanceof Error ? err.message : 'Unknown');
    }

    document.removeEventListener("click", unlockAudio);
  };

  document.addEventListener("click", unlockAudio, {
    once: true,
  });
}

// Support both standard page load and Astro View Transitions
// Wrap everything in astro:page-load to prevent duplication and ensure audio works after navigation
if (typeof window !== 'undefined') {
  function initAll() {
    // Remove existing listeners to prevent duplication
    if (globalHandleClick) {
      document.body.removeEventListener("click", globalHandleClick);
    }
    // Re-initialize
    initClickSound();
  }
  
  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initClickSound);
  } else {
    initClickSound();
  }
  
  // Re-init after View Transitions navigation
  document.addEventListener("astro:page-load", initAll);
}
