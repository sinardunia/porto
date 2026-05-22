import imageCompression from "browser-image-compression";

/* ---------------------------------
   IMAGE COMPRESSION
   Canvas-based, max 1200px long edge
---------------------------------- */

export async function compressImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<File> {
  const options = {
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8,
    onProgress,
  };

  const compressed = await imageCompression(file, options);

  // Rename to original-ish name but .webp
  return new File(
    [compressed],
    file.name.replace(/\.[^.]+$/, "") + ".webp",
    { type: "image/webp" }
  );
}

/* ---------------------------------
   VIDEO COMPRESSION
   MediaRecorder API: re-encode to 720p @ ~1.5Mbps
---------------------------------- */

export function compressVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.onerror = () => reject(new Error("Failed to load video for compression"));

    video.onloadedmetadata = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      // Scale to max 720p while preserving aspect ratio
      const MAX_HEIGHT = 720;
      const scale = Math.min(1, MAX_HEIGHT / video.videoHeight);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const stream = canvas.captureStream(30); // 30fps

      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
      ];
      const mimeType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "";

      const bitsPerSecond = Math.min(
        1_500_000, // 1.5 Mbps target
        file.size * 8 / Math.max(video.duration, 1) // or preserve current bitrate if lower
      );

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitsPerSecond,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(video.src);

        const blob = new Blob(chunks, { type: mimeType || "video/webm" });
        const name = file.name.replace(/\.[^.]+$/, "") + "_compressed.mp4";
        const compressedFile = new File([blob], name, {
          type: mimeType || "video/webm",
        });

        if (onProgress) onProgress(100);
        resolve(compressedFile);
      };

      recorder.onerror = () => reject(new Error("MediaRecorder error"));

      // Progress simulation (MediaRecorder has no native progress)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += (100 / video.duration) * 0.5;
        if (progress >= 95) progress = 95;
        if (onProgress) onProgress(Math.round(progress));
      }, 500);

      video.onplay = () => {
        const drawFrame = () => {
          if (video.paused || video.ended) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        };
        drawFrame();
      };

      video.play().catch(reject);
      recorder.start(100); // collect every 100ms

      video.onended = () => {
        clearInterval(progressInterval);
        recorder.stop();
        video.pause();
      };

      // Safety timeout if video doesn't fire onended
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          clearInterval(progressInterval);
          recorder.stop();
        }
      }, (video.duration + 5) * 1000);
    };
  });
}

/* ---------------------------------
   BATCH COMPRESSION
---------------------------------- */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

const SKIP_IMAGE_THRESHOLD = 300 * 1024; // 300KB
const SKIP_VIDEO_THRESHOLD = 5 * 1024 * 1024; // 5MB

function shouldSkipCompression(file: File): boolean {
  if (file.type.startsWith("image/")) {
    return file.size <= SKIP_IMAGE_THRESHOLD;
  }
  if (file.type.startsWith("video/")) {
    return file.size <= SKIP_VIDEO_THRESHOLD;
  }
  return true;
}

export async function compressMedia(
  files: File[],
  onItemProgress?: (index: number, percent: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (shouldSkipCompression(file)) {
      onItemProgress?.(i, 100);
      results.push({ file, originalSize: file.size, compressedSize: file.size });
      continue;
    }

    if (file.type.startsWith("image/")) {
      const compressed = await compressImage(file, (p) =>
        onItemProgress?.(i, p)
      );
      results.push({ file: compressed, originalSize: file.size, compressedSize: compressed.size });
    } else if (file.type.startsWith("video/")) {
      const compressed = await compressVideo(file, (p) =>
        onItemProgress?.(i, p)
      );
      results.push({ file: compressed, originalSize: file.size, compressedSize: compressed.size });
    } else {
      results.push({ file, originalSize: file.size, compressedSize: file.size });
    }
  }

  return results;
}
