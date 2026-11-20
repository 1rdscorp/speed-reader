import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestServices, renderApp } from '@/test/renderApp';

async function seeded(...texts: Array<{ text: string; title?: string }>) {
  const services = createTestServices();
  const documents = [];
  for (const input of texts) {
    documents.push(await services.documents.create({ ...input, source: { kind: 'paste' } }));
  }
  return { services, documents };
}

/** Fire a drag event carrying files at the window, as the browser does during a drag from the desktop. */
function dragFiles(type: 'dragenter' | 'drop', files: File[]) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { dataTransfer: { types: ['Files'], files } });
  act(() => {
    window.dispatchEvent(event);
  });
}
const dropFiles = (files: File[]) => dragFiles('drop', files);

const stageWord = () => screen.getByTestId('stage-word').textContent;

describe('home page', () => {
  it('introduces the site and leads into the reader', async () => {
    const { user, router } = renderApp();

    expect(
      await screen.findByRole('heading', { level: 1, name: /Read faster\.\s*Stay focused\./ }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Start reading' }));
    expect(await screen.findByRole('button', { name: 'Play' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/read');
  });

  it('lists the tools by stage, linking only the ones that exist', async () => {
    renderApp();
    const tools = within(await screen.findByRole('region', { name: 'Tools' }));

    expect(tools.getByRole('link', { name: /RSVP Reader/ }).textContent).toContain('Stage 1');
    expect(tools.getByRole('link', { name: /Reading settings/ }).textContent).toContain('Stage 2');
    for (const upcoming of ['Training drills', 'Speed test & progress']) {
      expect(tools.getByRole('heading', { name: upcoming })).toBeTruthy();
      expect(tools.queryByRole('link', { name: new RegExp(upcoming) })).toBeNull();
    }
    expect(document.body.textContent).not.toMatch(/memory/i);
  });

  it('switches the whole site between light and dark', async () => {
    const { user, services } = renderApp();
    await user.click(await screen.findByRole('button', { name: 'Switch to dark theme' }));
    expect(services.settings.get().theme).toBe('dark');
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(services.settings.get().theme).toBe('light');
  });

  it('has navigation to every page that exists', async () => {
    renderApp();
    const nav = within(await screen.findByRole('navigation', { name: 'Main' }));
    expect(nav.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Read',
      'Library',
      'Games',
      'Stereograms',
      'Settings',
    ]);
  });
});

describe('adding text', () => {
  it('shows how the reader works until something has been added', async () => {
    renderApp('/read');
    expect(await screen.findByRole('heading', { level: 1, name: 'How this works' })).toBeTruthy();
    expect(stageWord()).toBe('Most');
  });

  it('reads pasted text and keeps it in the library', async () => {
    const { user, router, services } = renderApp('/read');

    const read = await screen.findByRole('button', { name: 'Read this text' });
    expect(read).toHaveProperty('disabled', true);

    await user.type(screen.getByLabelText('Your text'), 'Steady pace wins. Every time.');
    expect(screen.getByText(/5 words/)).toBeTruthy();
    await user.click(read);

    await waitFor(() => expect(stageWord()).toBe('Steady'));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Steady pace wins. Every time.' }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toMatch(/^\/read\/\w+$/);
    expect(screen.getByLabelText('Your text')).toHaveProperty('value', '');
    expect(await services.documents.list()).toHaveLength(1);
  });

  it('opens a chosen file straight in the reader', async () => {
    const { user, services } = renderApp('/read');
    const file = new File(['# Field Notes\n\nMorning fog over the *river*.'], 'notes.md');

    await user.upload(await screen.findByLabelText('Files to add'), file);

    await waitFor(() => expect(stageWord()).toBe('Field'));
    expect(await services.documents.list()).toMatchObject([
      { title: 'Field Notes', source: { kind: 'file', name: 'notes.md', format: 'md' } },
    ]);
  });

  it('sends several files to the library', async () => {
    const { user, router } = renderApp('/read');
    await user.upload(await screen.findByLabelText('Files to add'), [
      new File(['First file text.'], 'one.txt'),
      new File(['Second file text.'], 'two.txt'),
    ]);

    expect(await screen.findByRole('link', { name: /^one/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^two/ })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/library');
  });

  it('accepts dropped files, keeps what worked and explains what did not', async () => {
    const { services } = renderApp('/read');
    await screen.findByLabelText('Files to add');
    const files = [
      new File(['Good text.'], 'good.txt'),
      new File(['x'], 'holiday.jpg', { type: 'image/jpeg' }),
    ];

    dragFiles('dragenter', files);
    expect(await screen.findByText('Drop to add to your library')).toBeTruthy();
    // A drop is not limited to the file types the picker offers.
    dropFiles(files);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('“holiday.jpg” is not a kind of file this can read');
    expect(screen.getByText(/1 text was added to your/)).toBeTruthy();
    expect(screen.queryByText('Drop to add to your library')).toBeNull();
    expect(await services.documents.list()).toHaveLength(1);
  });

  it('generates a practice text on the chosen topic and length', async () => {
    const { user, services } = renderApp('/read');

    await user.selectOptions(await screen.findByLabelText('Topic'), 'History');
    await user.selectOptions(screen.getByLabelText('Length'), 'Short · about 150 words');
    await user.click(screen.getByRole('button', { name: 'Generate text' }));

    const title = await screen.findByRole('heading', { level: 1, name: / and 1 more$/ });
    const first = title.textContent!.replace(' and 1 more', '');
    // The text opens on the heading of its first passage, and is also placed in the text box.
    expect(first.startsWith(stageWord() ?? '?')).toBe(true);
    const box = screen.getByLabelText('Your text') as HTMLTextAreaElement;
    expect(box.value.startsWith(first)).toBe(true);
    expect(screen.getByText(/Word 1 of 1\d\d/)).toBeTruthy();

    // It is not kept: nothing reaches the library, however many are generated.
    await user.click(screen.getByRole('button', { name: 'Generate text' }));
    await user.click(screen.getByRole('link', { name: 'Library' }));
    expect(await screen.findByText('Nothing here yet.')).toBeTruthy();
    expect(await services.documents.list()).toEqual([]);
  });

  it('keeps a generated text only if you ask to', async () => {
    const { user, services } = renderApp('/read');
    await user.click(await screen.findByRole('button', { name: 'Generate text' }));
    await screen.findByRole('heading', { level: 1, name: / and 4 more$/ });
    await user.click(screen.getByRole('button', { name: 'Read this text' }));
    await waitFor(async () => expect(await services.documents.list()).toHaveLength(1));
  });

  it('offers link import only when there is a way to fetch pages', async () => {
    const first = renderApp('/read');
    await screen.findByLabelText('Files to add');
    expect(screen.queryByLabelText('Link to an article')).toBeNull();
    first.unmount();

    const page = `<title>Tide Tables</title><article><h1>Tide Tables</h1>${'<p>The sea keeps its own appointments, and has never once been late for them.</p>'.repeat(8)}</article>`;
    const services = createTestServices({
      pageEndpoint: '/api/page',
      fetch: async () =>
        new Response(page, { headers: { 'x-upstream-content-type': 'text/html' } }),
    });
    const { user } = renderApp('/read', services);

    await user.type(await screen.findByLabelText('Link to an article'), 'example.com/tides');
    await user.click(screen.getByRole('button', { name: 'Add link' }));

    // The headline becomes the title; the text starts with the article itself.
    expect(await screen.findByRole('heading', { level: 1, name: 'Tide Tables' })).toBeTruthy();
    expect(stageWord()).toBe('The');
    expect(await services.documents.list()).toMatchObject([
      { title: 'Tide Tables', source: { kind: 'url', url: 'https://example.com/tides' } },
    ]);
  });

  it('says why a link could not be added', async () => {
    const services = createTestServices({
      pageEndpoint: '/api/page',
      fetch: async () => Response.json({ error: 'upstream-status' }, { status: 502 }),
    });
    const { user } = renderApp('/read', services);

    await user.type(await screen.findByLabelText('Link to an article'), 'example.com/gone');
    await user.click(screen.getByRole('button', { name: 'Add link' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'would not hand over that page',
    );
  });
});

describe('reader', () => {
  const STORY =
    'One two three four five six seven eight nine ten eleven twelve. Second sentence starts here and runs on. Third.';

  it('opens whatever was read last', async () => {
    const { services, documents } = await seeded(
      { text: 'Older text here.', title: 'Older' },
      { text: 'Newer text here.', title: 'Newer' },
    );
    await services.documents.saveProgress(documents[0]!.id, { offset: 0, fraction: 0 });
    renderApp('/read', services);
    expect(await screen.findByRole('heading', { level: 1, name: 'Older' })).toBeTruthy();
  });

  it('plays, pauses and moves around from the keyboard', async () => {
    const { services, documents } = await seeded({ text: STORY });
    const { user } = renderApp(`/read/${documents[0]!.id}`, services);

    await screen.findByRole('button', { name: 'Play' });
    expect(screen.getByText('Word 1 of 20')).toBeTruthy();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();

    await user.keyboard('r{ArrowRight}');
    expect(stageWord()).toBe('eleven');
    await user.keyboard('{ArrowLeft}');
    expect(stageWord()).toBe('One');
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(stageWord()).toBe('Second');
    await user.keyboard('{Shift>}{ArrowRight}{ArrowLeft}{/Shift}');
    expect(stageWord()).toBe('Second');
    await user.keyboard('{ArrowUp}');
    expect(services.settings.get().wpm).toBe(325);
  });

  it('has buttons for the same moves', async () => {
    const { services, documents } = await seeded({ text: STORY });
    const { user } = renderApp(`/read/${documents[0]!.id}`, services);

    await user.click(await screen.findByRole('button', { name: 'Forward 10 words' }));
    expect(stageWord()).toBe('eleven');
    await user.click(screen.getByRole('button', { name: 'Back 10 words' }));
    expect(stageWord()).toBe('One');
    await user.click(screen.getByRole('button', { name: 'Forward 10 words' }));
    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(stageWord()).toBe('One');
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
  });

  it('fills the screen on request, and gives it back', async () => {
    const { services, documents } = await seeded({ text: STORY });
    const { user } = renderApp(`/read/${documents[0]!.id}`, services);
    const card = () =>
      screen.getByTestId('stage-word').closest('[style*="--focus-letter"]') as HTMLElement;

    await user.click(await screen.findByRole('button', { name: 'Full screen' }));
    expect(card().hasAttribute('data-fullscreen')).toBe(true);
    // With the controls out of sight, the reading area says what speed it is set to.
    expect(screen.getByText(/Word 1 of 20 · 300 WPM/)).toBeTruthy();
    // Everything still works from the keyboard.
    await user.keyboard('{ArrowUp}{ArrowRight}');
    expect(screen.getByText(/Word 11 of 20 · 325 WPM/)).toBeTruthy();

    // One button switches the screen between white and dark; it is remembered but only applies in full screen.
    await user.click(screen.getByRole('button', { name: 'Switch to dark screen' }));
    expect(card().hasAttribute('data-dark')).toBe(true);
    expect(services.settings.get().screenColor).toBe('dark');
    await user.click(screen.getByRole('button', { name: 'Switch to white screen' }));
    expect(card().getAttribute('data-screen')).toBe('white');
    await user.click(screen.getByRole('button', { name: 'Switch to dark screen' }));

    await user.click(screen.getByRole('button', { name: 'Exit full screen' }));
    expect(card().hasAttribute('data-fullscreen')).toBe(false);
    expect(card().hasAttribute('data-screen')).toBe(false);
    expect(card().hasAttribute('data-dark')).toBe(false);
    expect(screen.queryByRole('button', { name: /(white|dark) screen$/ })).toBeNull();

    await user.keyboard('f');
    expect(card().hasAttribute('data-fullscreen')).toBe(true);
    await user.keyboard('{Escape}');
    expect(card().hasAttribute('data-fullscreen')).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('shows several words at a time, keeping your place when the setting changes', async () => {
    const { services, documents } = await seeded({ text: STORY });
    const { user } = renderApp(`/read/${documents[0]!.id}`, services);

    await user.click(await screen.findByRole('button', { name: 'Forward 10 words' }));
    expect(stageWord()).toBe('eleven');

    await user.selectOptions(screen.getByLabelText('Words at a time'), '3 words');
    expect(stageWord()).toBe('ten eleven twelve.');
    expect(services.settings.get().wordsPerFrame).toBe(3);

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(stageWord()).toBe('Second sentence starts');

    await user.selectOptions(screen.getByLabelText('Words at a time'), '1 word');
    expect(stageWord()).toBe('Second');
  });

  it('applies the speed, size and appearance controls and remembers them', async () => {
    const { services, documents } = await seeded({ text: STORY });
    renderApp(`/read/${documents[0]!.id}`, services);
    const card = (await screen.findByTestId('stage-word')).closest(
      '[class*="card"]',
    ) as HTMLElement;

    fireEvent.change(screen.getByLabelText('Speed'), { target: { value: '450' } });
    expect(screen.getByText('450 WPM')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Font size'), { target: { value: '72' } });
    expect(screen.getByText('72 px')).toBeTruthy();
    expect(
      screen.getByTestId('stage-word').parentElement?.style.getPropertyValue('--word-size'),
    ).toBe('72px');

    expect(card.hasAttribute('data-dark')).toBe(false);
    fireEvent.click(screen.getByLabelText('Dark reading area'));
    expect(card.hasAttribute('data-dark')).toBe(true);

    fireEvent.click(screen.getByLabelText('Pause longer on punctuation'));
    expect(services.settings.get()).toEqual({
      theme: 'light',
      wpm: 450,
      wordsPerFrame: 1,
      fontSize: 72,
      darkReader: true,
      focusColor: 'red',
      screenColor: 'auto',
      punctuationPauses: false,
    });
  });

  it('resumes a text where it was left', async () => {
    const { services, documents } = await seeded({ text: STORY });
    await services.documents.saveProgress(documents[0]!.id, {
      offset: STORY.indexOf('Second'),
      fraction: 0.6,
    });
    renderApp(`/read/${documents[0]!.id}`, services);
    await waitFor(() => expect(stageWord()).toBe('Second'));
  });

  it('saves your place when you leave', async () => {
    const { services, documents } = await seeded({ text: STORY, title: 'Story' });
    const { user } = renderApp(`/read/${documents[0]!.id}`, services);

    await user.click(await screen.findByRole('button', { name: 'Forward 10 words' }));
    await user.click(screen.getByRole('link', { name: 'Library' }));

    expect((await screen.findByRole('link', { name: /Story/ })).textContent).toContain('50% read');
  });

  it('explains when a text is missing, and still lets you add one', async () => {
    renderApp('/read/unknown');
    expect(await screen.findByRole('heading', { name: 'This text is not here' })).toBeTruthy();
    expect(screen.getByLabelText('Your text')).toBeTruthy();
  });
});

describe('settings', () => {
  const surface = () =>
    screen.getByTestId('stage-word').closest('[style*="--focus-letter"]') as HTMLElement;
  const focusLetter = () => surface().style.getPropertyValue('--focus-letter');

  it('changes how the reading area looks, shown in a preview', async () => {
    const { user, services } = renderApp('/settings');
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy();
    expect(focusLetter()).toBe('var(--focus-red)');

    await user.click(screen.getByRole('radio', { name: 'Green' }));
    expect(focusLetter()).toBe('var(--focus-green)');
    expect(screen.getByRole('radio', { name: 'Green' })).toHaveProperty('checked', true);

    await user.click(screen.getByLabelText('Dark reading area'));
    expect(surface().hasAttribute('data-dark')).toBe(true);
    expect(focusLetter()).toBe('var(--focus-green-night)');

    fireEvent.change(screen.getByLabelText('Font size'), { target: { value: '40' } });
    expect(
      screen.getByTestId('stage-word').parentElement?.style.getPropertyValue('--word-size'),
    ).toBe('40px');

    await user.selectOptions(screen.getByLabelText('Words at a time'), '2 words');
    expect(stageWord()).toBe('Reading settings');

    expect(services.settings.get()).toMatchObject({
      focusColor: 'green',
      darkReader: true,
      fontSize: 40,
      wordsPerFrame: 2,
    });
  });

  it('plays the preview on request', async () => {
    const { user } = renderApp('/settings');
    await user.click(await screen.findByRole('button', { name: 'Play preview' }));
    expect(screen.getByRole('button', { name: 'Pause preview' })).toBeTruthy();
    await waitFor(() => expect(stageWord()).not.toBe('Reading'));
    await user.click(screen.getByRole('button', { name: 'Pause preview' }));
    expect(screen.getByRole('button', { name: 'Play preview' })).toBeTruthy();
  });

  it('carries over to the reader', async () => {
    const { services, documents } = await seeded({
      text: 'Some words to read here.',
      title: 'Story',
    });
    services.settings.update({ focusColor: 'blue', darkReader: true });
    const { user } = renderApp(`/read/${documents[0]!.id}`, services);

    await screen.findByRole('button', { name: 'Play' });
    expect(focusLetter()).toBe('var(--focus-blue-night)');
    expect(screen.getByText(/keep your eyes on the blue marks/)).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'All settings' }));
    expect(await screen.findByRole('radio', { name: 'Blue' })).toHaveProperty('checked', true);
  });

  it('resets to the defaults', async () => {
    const { user, services } = renderApp('/settings');
    const reset = await screen.findByRole('button', { name: 'Reset to defaults' });
    expect(reset).toHaveProperty('disabled', true);

    await user.click(screen.getByRole('radio', { name: 'Purple' }));
    fireEvent.change(screen.getByLabelText('Speed'), { target: { value: '600' } });
    expect(reset).toHaveProperty('disabled', false);

    await user.click(reset);
    expect(services.settings.get()).toEqual({
      theme: 'light',
      wpm: 300,
      wordsPerFrame: 1,
      fontSize: 56,
      darkReader: false,
      focusColor: 'red',
      screenColor: 'auto',
      punctuationPauses: true,
    });
    expect(screen.getByRole('radio', { name: 'Red' })).toHaveProperty('checked', true);
    expect(reset).toHaveProperty('disabled', true);
  });
});

describe('library', () => {
  it('lists every text with its progress and source', async () => {
    const { services, documents } = await seeded(
      { text: 'alpha '.repeat(600), title: 'Long One' },
      { text: 'A short one.', title: 'Short One' },
    );
    await services.documents.saveProgress(documents[0]!.id, { offset: 1800, fraction: 0.5 });
    renderApp('/library', services);

    expect(await screen.findByText('2 texts')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Long One/ }).textContent).toContain(
      '50% read · about 1 min left · 600 words · Pasted',
    );
    expect(screen.getByRole('link', { name: /Short One/ }).textContent).toContain(
      'Not started · under a minute · 3 words · Pasted',
    );
  });

  it('opens a text in the reader', async () => {
    const { services } = await seeded({ text: 'Some words to read.', title: 'From the library' });
    const { user, router } = renderApp('/library', services);

    await user.click(await screen.findByRole('link', { name: /From the library/ }));
    await waitFor(() => expect(stageWord()).toBe('Some'));
    expect(router.state.location.pathname).toMatch(/^\/read\/\w+$/);
  });

  it('filters by title and sorts', async () => {
    const { services } = await seeded(
      { text: 'one', title: 'Zebra Crossing' },
      { text: 'two', title: 'apple orchard' },
      { text: 'three', title: 'Mango Season' },
    );
    const { user } = renderApp('/library', services);
    const titles = () =>
      screen.getAllByRole('listitem').map((item) => item.querySelector('span')?.textContent);

    await screen.findByText('3 texts');
    expect(titles()).toEqual(['Mango Season', 'apple orchard', 'Zebra Crossing']);

    await user.selectOptions(screen.getByLabelText('Sort by'), 'Title');
    expect(titles()).toEqual(['apple orchard', 'Mango Season', 'Zebra Crossing']);

    await user.type(screen.getByLabelText('Search titles'), 'SEAS');
    expect(titles()).toEqual(['Mango Season']);

    await user.type(screen.getByLabelText('Search titles'), 'xyz');
    expect(screen.getByText(/No titles match “SEASxyz”/)).toBeTruthy();
  });

  it('renames a text', async () => {
    const { services } = await seeded({ text: 'body', title: 'Microsoft Word - draft3' });
    const { user } = renderApp('/library', services);

    await user.click(await screen.findByRole('button', { name: /^Rename/ }));
    const field = screen.getByLabelText('Title');
    await user.clear(field);
    await user.type(field, 'The Real Title{Enter}');

    expect(await screen.findByRole('link', { name: /The Real Title/ })).toBeTruthy();
    expect((await services.documents.list())[0]?.title).toBe('The Real Title');
  });

  it('removes a text, and lets you take it back', async () => {
    const { services } = await seeded(
      { text: 'keep me', title: 'Keeper' },
      { text: 'lose me', title: 'Goner' },
    );
    const { user, unmount } = renderApp('/library', services);

    await user.click(await screen.findByRole('button', { name: 'Remove “Keeper”' }));
    expect(screen.queryByRole('link', { name: /Keeper/ })).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('Removed “Keeper”');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('link', { name: /Keeper/ })).toBeTruthy();
    expect(await services.documents.list()).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Remove “Goner”' }));
    expect(screen.getByText('1 text')).toBeTruthy();
    // Leaving the page makes the removal final.
    unmount();
    expect((await services.documents.list()).map((d) => d.title)).toEqual(['Keeper']);
  });

  it('invites you to add something when empty', async () => {
    const { user, router } = renderApp('/library');
    expect(await screen.findByText('Nothing here yet.')).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Add a text' }));
    expect(await screen.findByLabelText('Your text')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/read');
  });
});

describe('games', () => {
  it('lists the games and opens one in a frame', async () => {
    const { user } = renderApp('/games');
    expect(await screen.findByRole('link', { name: /Flying Mile/ })).toBeTruthy();
    await user.click(screen.getByRole('link', { name: /Keystorm/ }));

    const frame = (await screen.findByTitle('Keystorm')) as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toMatch(/games\/keystorm\.html$/);
    expect(screen.getByRole('link', { name: 'All games' })).toBeTruthy();
  });

  it('says so when a game does not exist', async () => {
    renderApp('/games/nope');
    expect(await screen.findByRole('heading', { name: /no game at this address/ })).toBeTruthy();
  });
});

describe('dead ends', () => {
  it('explains when an address is wrong', async () => {
    renderApp('/no/such/page');
    expect(await screen.findByRole('heading', { name: /nothing at this address/ })).toBeTruthy();
  });
});

describe('stereograms', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  function tick(seconds: number) {
    // First let the page finish starting its timer, then move the clock.
    act(() => {});
    act(() => void vi.advanceTimersByTime(seconds * 1000));
  }
  const timeLeft = () => screen.getByRole('timer').textContent;

  it('shows fifty pictures, each against a 30-second timer that can be paused', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const { user } = renderApp('/stereograms');
    expect(await screen.findByText('Stereogram 1 of 50')).toBeTruthy();
    expect(timeLeft()).toBe('0:30');

    tick(4);
    expect(timeLeft()).toBe('0:26');
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    tick(10);
    expect(timeLeft()).toBe('0:26');
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    tick(1);
    expect(timeLeft()).toBe('0:25');

    // The next picture starts its own 30 seconds; going back from the first reaches the last.
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Stereogram 2 of 50')).toBeTruthy();
    expect(timeLeft()).toBe('0:30');
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Stereogram 50 of 50')).toBeTruthy();
  });

  it('offers to show the hidden word only when the time is up', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const { user } = renderApp('/stereograms');
    await screen.findByText('Stereogram 1 of 50');
    expect(screen.queryByRole('button', { name: 'Show image' })).toBeNull();

    tick(30);
    expect(timeLeft()).toBe('0:00');
    await user.click(screen.getByRole('button', { name: 'Show image' }));
    expect(screen.getByText('The hidden word is READ.')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'The hidden word: READ' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.queryByText(/hidden word is/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
  });

  it('adds your own stereogram to the end, shows its answer, and removes it', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const { user, services } = renderApp('/stereograms');
    await screen.findByText('Stereogram 1 of 50');

    const picture = new File([new Uint8Array([1, 2, 3])], 'shark.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Picture'), picture);
    await user.type(screen.getByLabelText(/What is hidden/), 'A shark');
    await user.click(screen.getByRole('button', { name: 'Add stereogram' }));
    expect(await screen.findByText('Stereogram 1 of 51')).toBeTruthy();
    expect(await services.stereograms.list()).toMatchObject([{ name: 'shark.png' }]);

    await user.click(screen.getByRole('button', { name: 'View shark.png' }));
    expect(screen.getByText('Stereogram 51 of 51 · shark.png')).toBeTruthy();
    expect(
      (await screen.findByRole('img', { name: 'Your stereogram: shark.png' })).getAttribute('src'),
    ).toMatch(/^data:image\/png;base64,/);
    tick(30);
    await user.click(screen.getByRole('button', { name: 'Show image' }));
    expect(screen.getByText('Hidden in it: A shark')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Remove shark.png' }));
    expect(await screen.findByText('Stereogram 50 of 50')).toBeTruthy();
    expect(await services.stereograms.list()).toEqual([]);
  });

  it('refuses a file that is not a picture', async () => {
    const { user, services } = renderApp('/stereograms');
    await screen.findByText('Stereogram 1 of 50');
    const notes = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('Picture'), { target: { files: [notes] } });
    await user.click(screen.getByRole('button', { name: 'Add stereogram' }));
    expect(await screen.findByText('That file is not a picture.')).toBeTruthy();
    expect(await services.stereograms.list()).toEqual([]);
  });
});
