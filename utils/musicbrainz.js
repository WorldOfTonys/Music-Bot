import fetch from "node-fetch";

const BASE = "https://musicbrainz.org/ws/2";
// MusicBrainz requires a descriptive User-Agent header — update with your contact info
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
  const url = `${BASE}/recording/?query=${encodeURIComponent(title)}&fmt=json&limit=1`;
  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();
  return data.recordings?.[0] ?? null;
}
