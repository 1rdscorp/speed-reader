import { act, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

describe('start page', () => {
  it('takes pasted text into the reader', async () => {
    const { user, router, services } = renderApp();

    const start = await screen.findByRole('button', { name: 'Start reading' });
    expect(start).toHaveProperty('disabled', true);

    await user.type(screen.getByLabelText('Text to read'), 'Steady pace wins. Every time.');
    expect(screen.getByText(/5 words/)).toBeTruthy();
    await user.click(start);

    const word = await screen.findByTestId('stage-word');
    expect(word.textContent).toBe('Steady');
    expect(router.state.location.pathname).toMatch(/^\/read\/\w+$/);
    expect(await services.documents.list()).toHaveLength(1);
  });

  it('opens a chosen file straight in the reader', async () => {
    const { user, services } = renderApp();
    const file = new File(['# Field Notes\n\nMorning fog over the *river*.'], 'notes.md');

    await user.upload(await screen.findByLabelText('Files to add'), file);

    expect((await screen.findByTestId('stage-word')).textContent).toBe('Field');
    expect(await services.documents.list()).toMatchObject([
      { title: 'Field Notes', source: { kind: 'file', name: 'notes.md', format: 'md' } },
    ]);
  });

  it('sends several files to the library', async () => {
    const { user, router } = renderApp();
    await user.upload(await screen.findByLabelText('Files to add'), [
      new File(['First file text.'], 'one.txt'),
      new File(['Second file text.'], 'two.txt'),
    ]);

    expect(await screen.findByRole('link', { name: /^one/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /^two/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Library' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/library');
  });

  it('keeps what worked and explains what did not', async () => {
    const { services } = renderApp();
    await screen.findByLabelText('Files to add');
    // Dropped rather than chosen: a drop is not limited to the file types the picker offers.
    dropFiles([
      new File(['Good text.'], 'good.txt'),
      new File(['x'], 'holiday.jpg', { type: 'image/jpeg' }),
    ]);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('“holiday.jpg” is not a kind of file this can read');
    expect(screen.getByText(/1 text was added to your/)).toBeTruthy();
    expect(await screen.findByRole('link', { name: /^good/ })).toBeTruthy();
    expect(await services.documents.list()).toHaveLength(1);
  });

  it('accepts files dropped on the page', async () => {
    renderApp();
    await screen.findByLabelText('Files to add');
    const files = [new File(['Dropped words here.'], 'dropped.txt')];

    dragFiles('dragenter', files);
    expect(await screen.findByText('Drop to add to your library')).toBeTruthy();
    dropFiles(files);

    expect((await screen.findByTestId('stage-word')).textContent).toBe('Dropped');
  });

  it('offers link import only when there is a way to fetch pages', async () => {
    const first = renderApp();
    await screen.findByLabelText('Files to add');
    expect(screen.queryByLabelText('Link to an article')).toBeNull();
    first.unmount();

    const page = `<title>Tide Tables</title><article><h1>Tide Tables</h1>${'<p>The sea keeps its own appointments, and has never once been late for them.</p>'.repeat(8)}</article>`;
    const services = createTestServices({
      pageEndpoint: '/api/page',
      fetch: async () =>
        new Response(page, { headers: { 'x-upstream-content-type': 'text/html' } }),
    });
    const { user } = renderApp('/', services);

    await user.type(await screen.findByLabelText('Link to an article'), 'example.com/tides');
    await user.click(screen.getByRole('button', { name: 'Add link' }));

    // The headline becomes the title; the text starts with the article itself.
    expect((await screen.findByTestId('stage-word')).textContent).toBe('The');
    expect(await services.documents.list()).toMatchObject([
      { title: 'Tide Tables', source: { kind: 'url', url: 'https://example.com/tides' } },
    ]);
  });

  it('says why a link could not be added', async () => {
    const services = createTestServices({
      pageEndpoint: '/api/page',
      fetch: async () => Response.json({ error: 'upstream-status' }, { status: 502 }),
    });
    const { user } = renderApp('/', services);

    await user.type(await screen.findByLabelText('Link to an article'), 'example.com/gone');
    await user.click(screen.getByRole('button', { name: 'Add link' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'would not hand over that page',
    );
  });

  it('lists the most recent texts, with a way to the rest', async () => {
    const { services } = await seeded(
      ...Array.from({ length: 7 }, (_, i) => ({
        text: `Text number ${i + 1}`,
        title: `Text ${i + 1}`,
      })),
    );
    renderApp('/', services);

    const recent = within(await screen.findByRole('region', { name: 'Recent' }));
    expect(recent.getAllByRole('listitem')).toHaveLength(5);
    expect(recent.getByRole('link', { name: /^Text 7/ })).toBeTruthy();
    expect(recent.getByRole('link', { name: 'All 7 in your library' })).toBeTruthy();
  });
});

describe('reader', () => {
  it('plays, pauses and navigates from the keyboard', async () => {
    const { services, documents } = await seeded({
      text: 'First sentence here. Second one follows.',
    });
    const { user } = renderApp(`/read/${documents[0]!.id}`, services);

    await screen.findByRole('button', { name: 'Play' });
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('stage-word').textContent).toBe('Second');
    await user.keyboard('{ArrowUp}');
    expect(services.settings.get().wpm).toBe(325);
  });

  it('resumes a text where it was left', async () => {
    const text = 'First sentence here. Second one follows.';
    const { services, documents } = await seeded({ text });
    await services.documents.saveProgress(documents[0]!.id, {
      offset: text.indexOf('Second'),
      fraction: 0.5,
    });
    renderApp(`/read/${documents[0]!.id}`, services);
    await waitFor(() => expect(screen.getByTestId('stage-word').textContent).toBe('Second'));
  });

  it('closes back to the page it was opened from', async () => {
    const { services } = await seeded({ text: 'Some words to read.', title: 'From the library' });
    const { user, router } = renderApp('/library', services);

    await user.click(await screen.findByRole('link', { name: /From the library/ }));
    await user.click(await screen.findByRole('button', { name: 'Close reader' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/library'));
  });

  it('closes to the start page when opened directly', async () => {
    const { services, documents } = await seeded({ text: 'Some words to read.' });
    const { user, router } = renderApp(`/read/${documents[0]!.id}`, services);

    await user.click(await screen.findByRole('button', { name: 'Close reader' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
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
    renderApp('/library');
    expect(await screen.findByText('Nothing here yet.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Add a text' })).toBeTruthy();
  });
});

describe('dead ends', () => {
  it('explains when a text is missing or an address is wrong', async () => {
    const first = renderApp('/read/unknown');
    expect(await screen.findByRole('heading', { name: 'This text is not here' })).toBeTruthy();
    first.unmount();

    renderApp('/no/such/page');
    expect(await screen.findByRole('heading', { name: /nothing at this address/ })).toBeTruthy();
  });
});
