import fetch from "node-fetch";

/**
 * Searches the iTunes API for a song track.
 * @param {string} title - The song title to search for.
 * @returns {Promise<object|null>} The top song object from iTunes, or null.
 */
export async function searchSong(title) {
  // media=music and entity=musicTrack filters out music videos, movies, and podcasts
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=music&entity=musicTrack&limit=1`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.results?.[0] ?? null;
  } catch (error) {
    console.error("iTunes API Error:", error);
    return null;
  }
}
