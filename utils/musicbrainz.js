import fetch from "node-fetch";

const BASE = "https://musicbrainz.org/ws/2";
const HEADERS = { "User-Agent": "MusicDiscordBot/1.0 (your@email.com)" };

export async function searchArtist(name) {
  const url = `${BASE}/artist/?query=${encodeURIComponent(name)}&fmt=json&limit=1`;
  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();
  return data.artists?.[0] ?? null;
}

export async function searchAlbum(title) {
  const url = `${BASE}/release-group/?query=${encodeURIComponent(title)}&type=album&fmt=json&limit=1`;
  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();
  return data["release-groups"]?.[0] ?? null;
}

export async function searchSong(title) {
  // Enforcing strict title matches, but pushing the limit to 30 
  // to ensure short words like "Numb" don't get drowned out by niche tracks.
  const strictQuery = `recording:"${title}"`;
  const url = `${BASE}/recording/?query=${encodeURIComponent(strictQuery)}&fmt=json&limit=30`;
  
  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();
  
  return data.recordings ?? [];
}
