export type Preferences = { name: string; topics: string[] };

export const defaultPreferences: Preferences = {
  name: 'Nico',
  topics: ['World', 'Technology', 'Design'],
};

export const topicOptions = ['World', 'Technology', 'Design', 'Business', 'Science', 'Culture', 'Sports'];

export function chicagoDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = (part: string) => parts.find((entry) => entry.type === part)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function issueFor(date: string) {
  const day = Number(date.slice(-2));
  const isSum = day % 2 === 0;
  const isNov4 = date === '2026-11-04';
  const isNov5 = date === '2026-11-05';
  return {
    date,
    label: new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00Z`)),
    puzzle: isSum ? 'sum' as const : 'sequence' as const,
    art: isNov4 ? 'Folded Signal' : isNov5 ? 'Prismatic Loop' : `Signal Study ${date.replaceAll('-', '.')}`,
    caption: isNov4 ? 'Fine strands fold around a bright center.' : isNov5 ? 'A loop of light searches for its own edge.' : 'A daily study of motion, light, and connection.',
  };
}

export const sampleStories = [
  { category: 'WORLD', title: 'A calmer way to start with the biggest stories', detail: 'A concise, sourced summary will live here when live news is connected.' },
  { category: 'YOUR DAY', title: 'Your schedule at a glance', detail: 'Calendar events will appear here after you connect a calendar.' },
  { category: 'A SIGNAL FOR YOU', title: 'A brief tuned to what matters to you', detail: 'Your selected topics shape this sample view now; live recommendations come later.' },
];
