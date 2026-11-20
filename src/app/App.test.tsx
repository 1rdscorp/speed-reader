import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestServices, renderApp } from '@/test/renderApp';

describe('app', () => {
  it('takes pasted text from the start page into the reader', async () => {
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

  it('plays, pauses and navigates from the keyboard', async () => {
    const services = createTestServices();
    const document = await services.documents.create({
      text: 'First sentence here. Second one follows.',
      source: { kind: 'paste' },
    });
    const { user } = renderApp(`/read/${document.id}`, services);

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
    const services = createTestServices();
    const text = 'First sentence here. Second one follows.';
    const document = await services.documents.create({ text, source: { kind: 'paste' } });
    await services.documents.saveProgress(document.id, {
      offset: text.indexOf('Second'),
      fraction: 0.5,
    });
    renderApp(`/read/${document.id}`, services);
    await waitFor(() => expect(screen.getByTestId('stage-word').textContent).toBe('Second'));
  });

  it('lists recent texts on the start page and removes them', async () => {
    const services = createTestServices();
    await services.documents.create({ text: 'Kept for later', source: { kind: 'paste' } });
    const { user } = renderApp('/', services);

    expect(await screen.findByRole('link', { name: /Kept for later/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Remove/ }));
    await waitFor(() => expect(screen.queryByRole('link', { name: /Kept for later/ })).toBeNull());
  });

  it('explains when a text is missing or an address is wrong', async () => {
    const first = renderApp('/read/unknown');
    expect(await screen.findByRole('heading', { name: 'This text is not here' })).toBeTruthy();
    first.unmount();

    renderApp('/no/such/page');
    expect(await screen.findByRole('heading', { name: /nothing at this address/ })).toBeTruthy();
  });
});
