(() => {
  const form = document.querySelector('#demo-settings');
  const stories = document.querySelector('#demo-stories');
  if (!form || !stories) return;

  const topics = ['Technology', 'Business', 'Science', 'Culture'];
  const sampleDescriptions = {
    Technology: 'A place for the technology stories you choose to follow, ranked for your morning.',
    Business: 'A focused view of markets, companies, and economic changes from your selected sources.',
    Science: 'Research and discoveries from publications you trust, with a short reason to read each one.',
    Culture: 'Ideas, art, books, and events that make your brief feel personal.'
  };
  const storageKey = 'morning-demo-preferences-v1';
  let preferences = { name: 'Alex', topics: ['Technology', 'Business', 'Science'] };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved.name === 'string' && Array.isArray(saved.topics)) {
      preferences = {
        name: saved.name.trim().slice(0, 32) || 'Alex',
        topics: saved.topics.filter(topic => topics.includes(topic))
      };
    }
  } catch (_) { /* The demo still works without browser storage. */ }

  const date = new Date();
  const fullDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', weekday: 'short', month: 'short', day: 'numeric'
  }).format(date);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const part = type => parts.find(item => item.type === type)?.value;
  const dateCode = `${part('year')}.${part('month')}.${part('day')}`;

  function render() {
    const greeting = document.querySelector('.decode-greeting');
    if (greeting) {
      const exclamation = document.createElement('span');
      exclamation.textContent = '!';
      greeting.replaceChildren(document.createTextNode(`Good Morning ${preferences.name}`), exclamation);
    }
    const statValues = document.querySelectorAll('.decode-stat-value');
    if (statValues.length >= 3) {
      statValues[0].textContent = fullDate;
      statValues[1].textContent = `${preferences.topics.length} topics`;
      statValues[2].textContent = `${preferences.topics.length * 2} min demo`;
    }
    const footer = document.querySelector('.decode-footline span:first-child');
    if (footer) footer.textContent = `EDITION ${part('month')}/${part('day')}  ◇  PREPARED FOR ${preferences.name.toUpperCase()}`;
    const edition = document.querySelector('.decode-index');
    if (edition) edition.textContent = `01 / OPENING TRANSMISSION  ·  ${dateCode}`;
    form.elements.name.value = preferences.name;
    form.querySelectorAll('input[name=topic]').forEach(input => {
      input.checked = preferences.topics.includes(input.value);
    });
    stories.replaceChildren();
    const selected = preferences.topics.length ? preferences.topics : ['Technology'];
    selected.forEach(topic => {
      const article = document.createElement('article');
      article.className = 'demo-story';
      const label = document.createElement('small');
      label.textContent = `Sample · ${topic}`;
      const heading = document.createElement('h3');
      heading.textContent = `${topic}, your way`;
      const description = document.createElement('p');
      description.textContent = sampleDescriptions[topic];
      article.append(label, heading, description);
      stories.append(article);
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.name.value.trim().slice(0, 32) || 'Alex';
    preferences = {
      name,
      topics: [...form.querySelectorAll('input[name=topic]:checked')].map(input => input.value)
    };
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) { /* Optional. */ }
    render();
    document.querySelector('#demo-save-status').textContent = 'Saved in this browser.';
  });

  render();
})();
