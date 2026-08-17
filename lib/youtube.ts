const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);

export function getYouTubeVideoId(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  try {
    const url = new URL(normalizedValue);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    let videoId: string | null = null;

    if (url.hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (YOUTUBE_HOSTS.has(url.hostname)) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/").filter(Boolean)[1] ?? null;
      }
    }

    return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function normalizeOptionalYouTubeUrl(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const videoId = getYouTubeVideoId(normalizedValue);

  if (!videoId) {
    throw new Error("La URL de YouTube no es válida.");
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeEmbedUrl(
  value: string,
  options: { autoplay?: boolean } = {},
) {
  const videoId = getYouTubeVideoId(value);

  if (!videoId) {
    return null;
  }

  const searchParams = new URLSearchParams({
    rel: "0",
    playsinline: "1",
  });

  if (options.autoplay) {
    searchParams.set("autoplay", "1");
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${searchParams.toString()}`;
}
