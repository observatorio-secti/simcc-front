import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { removeStorage, writeStorage } from '@/shared/lib/storage';
import {
  BROWSER_CONVERSATIONS_KEY,
  addBrowserConversation,
  readBrowserConversationIds,
  removeBrowserConversation,
  useBrowserConversationIds,
} from './browser-conversations';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

afterEach(() => removeStorage(BROWSER_CONVERSATIONS_KEY));

describe('conversas do navegador', () => {
  it('guarda os ids no storage, a mais recente primeiro e sem repetir', () => {
    addBrowserConversation(A);
    addBrowserConversation(B);
    addBrowserConversation(A);
    expect(readBrowserConversationIds()).toEqual([A, B]);
    expect(
      JSON.parse(window.localStorage.getItem(BROWSER_CONVERSATIONS_KEY) ?? ''),
    ).toEqual([A, B]);
  });

  it('ignora ids que não são UUID e conteúdo corrompido', () => {
    addBrowserConversation('../admin');
    expect(readBrowserConversationIds()).toEqual([]);
    writeStorage(BROWSER_CONVERSATIONS_KEY, { not: 'a list' });
    expect(readBrowserConversationIds()).toEqual([]);
    writeStorage(BROWSER_CONVERSATIONS_KEY, [A, 42, 'x', A]);
    expect(readBrowserConversationIds()).toEqual([A]);
  });

  it('remove só da lista local', () => {
    addBrowserConversation(A);
    addBrowserConversation(B);
    removeBrowserConversation(A);
    expect(readBrowserConversationIds()).toEqual([B]);
  });

  it('avisa o hook quando a lista muda', () => {
    const { result } = renderHook(() => useBrowserConversationIds());
    expect(result.current).toEqual([]);
    act(() => addBrowserConversation(A));
    expect(result.current).toEqual([A]);
    const before = result.current;
    act(() => addBrowserConversation(A));
    expect(result.current).toBe(before);
    act(() => removeBrowserConversation(A));
    expect(result.current).toEqual([]);
  });
});
