// Upcoming shows from Bandsintown. The app id stays server-side (Netlify env var BANDSINTOWN_APP_ID).
const ARTIST = 'id_15670902'; // Grady Maguire on Bandsintown

export default async () => {
  const appId = process.env.BANDSINTOWN_APP_ID;
  if (!appId) return json({ error: 'missing app id', events: [] }, 500);
  try {
    const res = await fetch(
      `https://rest.bandsintown.com/artists/${ARTIST}/events?app_id=${encodeURIComponent(appId)}&date=upcoming`,
      { headers: { accept: 'application/json' } }
    );
    if (!res.ok) return json({ error: `bandsintown ${res.status}`, events: [] }, 502);
    const raw = await res.json();
    const events = (Array.isArray(raw) ? raw : []).map(e => ({
      datetime: e.datetime,
      venue: e.venue?.name || '',
      city: e.venue?.city || '',
      region: e.venue?.region || '',
      country: e.venue?.country || '',
      title: e.title || '',
      description: e.description || '',
      lineup: (e.lineup || []).filter(n => n && n.toLowerCase() !== 'grady maguire'),
      url: e.url || '',
      ticket: (e.offers || []).find(o => o.url)?.url || '',
      ticketType: (e.offers || []).find(o => o.url)?.type || '',
    }));
    return json({ events });
  } catch (err) {
    return json({ error: String(err), events: [] }, 502);
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      // fresh enough for new dates, light on the Bandsintown API
      'cache-control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}

export const config = { path: '/api/shows' };
